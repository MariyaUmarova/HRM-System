import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type NewsSource = {
  id: string;
  name: string;
  feed_url: string;
  allowed_host: string;
};

type FeedItem = {
  source_id: string;
  source_item_id: string;
  canonical_url: string;
  title: string;
  published_at: string | null;
  category:
    | "Рынок труда"
    | "Подбор и найм"
    | "AI и HR Tech"
    | "Обучение и развитие";
  status: "pending_review";
};

type SourceResult = {
  sourceId: string;
  status: "succeeded" | "failed" | "skipped";
  discovered: number;
  inserted: number;
  errorCode?: string;
};

const ALLOWED_FEED_HOSTS = new Set(["mintrud.gov.ru"]);
const MAX_FEED_BYTES = 2_000_000;
const MAX_ITEMS_PER_SOURCE = 40;

function readNamedKeys(name: string): string[] {
  const value = Deno.env.get(name);
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return Object.values(parsed).filter(Boolean);
  } catch {
    return [];
  }
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function isAuthorized(request: Request): Promise<boolean> {
  const provided = request.headers.get("x-hr-radar-secret");
  if (!provided || provided.length > 256) return false;

  const rows = await rest<Array<{ value_hash: string }>>(
    "hr_news_runtime_config?select=value_hash&key=eq.invocation_secret_sha256&limit=1",
  );
  if (rows.length !== 1) return false;

  return constantTimeEqual(await sha256(provided), rows[0].value_hash);
}

function getAdminKey(): string {
  const secretKeys = readNamedKeys("SUPABASE_SECRET_KEYS");
  const key = secretKeys[0] ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("SUPABASE_ADMIN_KEY_MISSING");
  return key;
}

function adminHeaders(prefer?: string): HeadersInit {
  const key = getAdminKey();
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };

  if (!key.startsWith("sb_secret_")) {
    headers.Authorization = "Bearer " + key;
  }
  if (prefer) headers.Prefer = prefer;
  return headers;
}

function sanitizeError(error: unknown): { code: string; message: string } {
  const raw = error instanceof Error ? error.message : String(error);
  const message = raw.replace(/[\r\n\t]+/g, " ").slice(0, 300);
  const code = /^[A-Z0-9_]{3,80}$/.test(message) ? message : "INGESTION_FAILED";
  return { code, message };
}

async function rest<T>(
  path: string,
  init: RequestInit = {},
  prefer?: string,
): Promise<T> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) throw new Error("SUPABASE_URL_MISSING");

  const response = await fetch(supabaseUrl + "/rest/v1/" + path, {
    ...init,
    headers: {
      ...adminHeaders(prefer),
      ...(init.headers ?? {}),
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error("DATABASE_" + response.status);
  }

  return (body ? JSON.parse(body) : null) as T;
}

function moscowDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function stripMarkup(value: string): string {
  return value
    .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/i, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, entity: string) => String.fromCodePoint(Number(entity)))
    .replace(/&#x([0-9a-f]+);/gi, (_, entity: string) =>
      String.fromCodePoint(Number.parseInt(entity, 16)),
    )
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function readTag(block: string, name: string): string {
  const pattern = "<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + ">";
  const match = block.match(new RegExp(pattern, "i"));
  return match ? stripMarkup(match[1]) : "";
}

function canonicalizeUrl(value: string, allowedHost: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== allowedHost) return null;

    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (key.toLowerCase().startsWith("utm_")) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function classify(title: string): FeedItem["category"] {
  const value = title.toLocaleLowerCase("ru-RU");

  if (/(обуч|квалификац|навык|образован|стажиров)/u.test(value)) {
    return "Обучение и развитие";
  }
  if (/(искусственн|нейросет|цифров|автоматизац|технолог|(^|\s)ии(\s|$))/u.test(value)) {
    return "AI и HR Tech";
  }
  if (/(ваканси|подбор|найм|рекру|работодател)/u.test(value)) {
    return "Подбор и найм";
  }
  return "Рынок труда";
}

function parseRss(xml: string, source: NewsSource): FeedItem[] {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  const seen = new Set<string>();
  const items: FeedItem[] = [];

  for (const block of blocks.slice(0, MAX_ITEMS_PER_SOURCE)) {
    const title = readTag(block, "title").slice(0, 500);
    const rawUrl = readTag(block, "link");
    const canonicalUrl = canonicalizeUrl(rawUrl, source.allowed_host);
    if (title.length < 5 || !canonicalUrl || seen.has(canonicalUrl)) continue;

    const rawDate = readTag(block, "pubDate") || readTag(block, "dc:date");
    const parsedDate = rawDate ? new Date(rawDate) : null;
    const guid = readTag(block, "guid") || canonicalUrl;

    seen.add(canonicalUrl);
    items.push({
      source_id: source.id,
      source_item_id: guid.slice(0, 1000),
      canonical_url: canonicalUrl,
      title,
      published_at:
        parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : null,
      category: classify(title),
      status: "pending_review",
    });
  }

  return items;
}

async function alreadySucceeded(sourceId: string, runDate: string): Promise<boolean> {
  const rows = await rest<Array<{ id: number }>>(
    "hr_news_ingestion_runs?select=id&source_id=eq." +
      encodeURIComponent(sourceId) +
      "&run_date=eq." +
      runDate +
      "&status=eq.succeeded&limit=1",
  );
  return rows.length > 0;
}

async function startRun(sourceId: string, runDate: string): Promise<void> {
  await rest(
    "hr_news_ingestion_runs?on_conflict=" +
      encodeURIComponent("source_id,run_date"),
    {
      method: "POST",
      body: JSON.stringify({
        source_id: sourceId,
        run_date: runDate,
        started_at: new Date().toISOString(),
        finished_at: null,
        status: "running",
        discovered_count: 0,
        inserted_count: 0,
        error_code: null,
        error_message: null,
      }),
    },
    "resolution=merge-duplicates,return=minimal",
  );
}

async function finishRun(
  sourceId: string,
  runDate: string,
  values: {
    status: "succeeded" | "failed";
    discovered_count: number;
    inserted_count: number;
    error_code: string | null;
    error_message: string | null;
  },
): Promise<void> {
  await rest(
    "hr_news_ingestion_runs?source_id=eq." +
      encodeURIComponent(sourceId) +
      "&run_date=eq." +
      runDate,
    {
      method: "PATCH",
      body: JSON.stringify({
        ...values,
        finished_at: new Date().toISOString(),
      }),
    },
    "return=minimal",
  );
}

async function updateSource(
  sourceId: string,
  values: Record<string, string | null>,
): Promise<void> {
  await rest(
    "hr_news_sources?id=eq." + encodeURIComponent(sourceId),
    {
      method: "PATCH",
      body: JSON.stringify({
        ...values,
        updated_at: new Date().toISOString(),
      }),
    },
    "return=minimal",
  );
}

async function ingestSource(source: NewsSource, runDate: string): Promise<SourceResult> {
  if (await alreadySucceeded(source.id, runDate)) {
    return {
      sourceId: source.id,
      status: "skipped",
      discovered: 0,
      inserted: 0,
    };
  }

  await startRun(source.id, runDate);

  try {
    if (!ALLOWED_FEED_HOSTS.has(source.allowed_host)) {
      throw new Error("SOURCE_HOST_NOT_ALLOWED");
    }

    const feedUrl = new URL(source.feed_url);
    if (feedUrl.protocol !== "https:" || feedUrl.hostname !== source.allowed_host) {
      throw new Error("FEED_URL_NOT_ALLOWED");
    }

    const response = await fetch(feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9",
        "User-Agent": "Ivideon-HR-Hub/0.1",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) throw new Error("SOURCE_HTTP_" + response.status);

    const finalUrl = new URL(response.url);
    if (finalUrl.protocol !== "https:" || finalUrl.hostname !== source.allowed_host) {
      throw new Error("SOURCE_REDIRECT_NOT_ALLOWED");
    }

    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_FEED_BYTES) throw new Error("SOURCE_RESPONSE_TOO_LARGE");

    const xml = await response.text();
    if (xml.length > MAX_FEED_BYTES) throw new Error("SOURCE_RESPONSE_TOO_LARGE");

    const items = parseRss(xml, source);
    if (items.length === 0) throw new Error("SOURCE_FEED_EMPTY");

    const inserted = await rest<FeedItem[]>(
      "hr_news_items?on_conflict=canonical_url",
      {
        method: "POST",
        body: JSON.stringify(items),
      },
      "resolution=ignore-duplicates,return=representation",
    );

    await finishRun(source.id, runDate, {
      status: "succeeded",
      discovered_count: items.length,
      inserted_count: inserted.length,
      error_code: null,
      error_message: null,
    });
    const now = new Date().toISOString();
    await updateSource(source.id, {
      last_checked_at: now,
      last_success_at: now,
      last_error_code: null,
    });

    return {
      sourceId: source.id,
      status: "succeeded",
      discovered: items.length,
      inserted: inserted.length,
    };
  } catch (error) {
    const safeError = sanitizeError(error);
    await finishRun(source.id, runDate, {
      status: "failed",
      discovered_count: 0,
      inserted_count: 0,
      error_code: safeError.code,
      error_message: safeError.message,
    });
    await updateSource(source.id, {
      last_checked_at: new Date().toISOString(),
      last_error_code: safeError.code,
    });

    return {
      sourceId: source.id,
      status: "failed",
      discovered: 0,
      inserted: 0,
      errorCode: safeError.code,
    };
  }
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  if (!(await isAuthorized(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sources = await rest<NewsSource[]>(
      "hr_news_sources?select=id,name,feed_url,allowed_host&enabled=eq.true&adapter=eq.rss&feed_url=not.is.null&order=id",
    );
    const runDate = moscowDate();
    const results: SourceResult[] = [];

    for (const source of sources) {
      results.push(await ingestSource(source, runDate));
    }

    const failed = results.filter((result) => result.status === "failed").length;
    return Response.json(
      {
        ok: failed === 0,
        runDate,
        totals: {
          sources: results.length,
          failed,
          discovered: results.reduce((sum, result) => sum + result.discovered, 0),
          inserted: results.reduce((sum, result) => sum + result.inserted, 0),
        },
        results,
      },
      { status: failed === 0 ? 200 : 502 },
    );
  } catch (error) {
    const safeError = sanitizeError(error);
    return Response.json(
      { ok: false, error: safeError.code },
      { status: 500 },
    );
  }
});
