"use client";

/**
 * Mock intake-request adapter. There is no backend/database in Phase 1 (out of
 * scope per docs/PHASE_1_BRIEF.md), so this store lives in the browser: an
 * in-memory singleton persisted to localStorage so state survives reloads and is
 * shared between the customer's isolated `/c/[token]` view and the Head of
 * Recruitment / HRD inbox within the same browser. A real backend will replace
 * this module without changing the `IntakeRequestsAdapter` interface it implements.
 *
 * Customer isolation rule: `getByToken` is the only way to reach a single
 * request from the customer surface, and it never exposes other requests.
 */
import type { IntakeRequest, IntakeRequestStatus } from "./types";

const STORAGE_KEY = "ivideon_hr_hub_intake_requests_v1";

function seedRequests(): IntakeRequest[] {
  const now = Date.now();
  const iso = (offsetHours: number) => new Date(now - offsetHours * 60 * 60 * 1000).toISOString();
  return [
    {
      id: "req-1",
      token: "demo-token-genstoret",
      companyContact: "Заказчик — направление «Розница»",
      position: "Специалист поддержки продаж",
      department: "Коммерция",
      mustHave: "Опыт работы с CRM, грамотная речь, готовность к разъездам по РФ",
      niceToHave: "Опыт в B2B-продажах видеонаблюдения",
      comment: "",
      status: "submitted",
      assignedRecruiterId: null,
      history: [{ status: "submitted", at: iso(20) }],
      createdAt: iso(21),
      updatedAt: iso(20),
    },
    {
      id: "req-2",
      token: "demo-token-analytics",
      companyContact: "Заказчик — направление «Аналитика»",
      position: "Аналитик данных",
      department: "Продукт",
      mustHave: "SQL, Python, опыт построения дашбордов",
      niceToHave: "Опыт в видеоаналитике",
      comment: "Нужно уточнить грейд и вилку",
      status: "returned",
      assignedRecruiterId: null,
      history: [
        { status: "submitted", at: iso(50) },
        { status: "returned", comment: "Уточните, пожалуйста, грейд и вилку по рынку.", at: iso(48) },
      ],
      createdAt: iso(51),
      updatedAt: iso(48),
    },
    {
      id: "req-3",
      token: "demo-token-support",
      companyContact: "Заказчик — направление «Техподдержка»",
      position: "Инженер техподдержки 2-й линии",
      department: "Инфраструктура",
      mustHave: "Linux, сетевые протоколы, опыт в саппорте от 2 лет",
      niceToHave: "Опыт с видеосистемами",
      comment: "",
      status: "assigned",
      assignedRecruiterId: "rec-2",
      history: [
        { status: "submitted", at: iso(96) },
        { status: "accepted", at: iso(90) },
        { status: "assigned", at: iso(89) },
      ],
      createdAt: iso(97),
      updatedAt: iso(89),
    },
  ];
}

/**
 * Module-level cache with a stable reference between mutations, so this store
 * can back `useSyncExternalStore` without a synchronous setState-in-effect
 * anti-pattern and without returning a new array identity on every read.
 */
let cache: IntakeRequest[] = seedRequests();
let hydrated = false;

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as IntakeRequest[];
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    // keep the in-memory seed if localStorage is unavailable
  }
}

function readAll(): IntakeRequest[] {
  ensureHydrated();
  return cache;
}

/** Test-only: resets the in-memory cache so each test starts from a clean seed. */
export function __resetStoreForTests() {
  cache = seedRequests();
  hydrated = false;
}

function writeAll(requests: IntakeRequest[]) {
  cache = requests;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }
  listeners.forEach((fn) => fn(cache));
}

const listeners = new Set<(requests: IntakeRequest[]) => void>();

export function subscribeRequests(fn: (requests: IntakeRequest[]) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getAllRequestsSnapshot(): IntakeRequest[] {
  return readAll();
}

export async function getByToken(token: string): Promise<IntakeRequest | null> {
  return readAll().find((r) => r.token === token) ?? null;
}

export async function saveDraft(token: string, patch: Partial<IntakeRequest>): Promise<IntakeRequest> {
  const all = [...readAll()];
  const idx = all.findIndex((r) => r.token === token);
  if (idx === -1) throw new Error("Request not found");
  const updated: IntakeRequest = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export async function submit(token: string): Promise<IntakeRequest> {
  return transition(token, "submitted");
}

async function transition(token: string, status: IntakeRequestStatus, comment?: string): Promise<IntakeRequest> {
  const all = [...readAll()];
  const idx = all.findIndex((r) => r.token === token);
  if (idx === -1) throw new Error("Request not found");
  const now = new Date().toISOString();
  const updated: IntakeRequest = {
    ...all[idx],
    status,
    updatedAt: now,
    history: [...all[idx].history, { status, comment, at: now }],
  };
  all[idx] = updated;
  writeAll(all);
  return updated;
}

export async function listForManagement(): Promise<IntakeRequest[]> {
  return readAll();
}

export async function returnForRevision(id: string, comment: string): Promise<IntakeRequest> {
  const all = readAll();
  const target = all.find((r) => r.id === id);
  if (!target) throw new Error("Request not found");
  return transition(target.token, "returned", comment);
}

export async function accept(id: string): Promise<IntakeRequest> {
  const all = readAll();
  const target = all.find((r) => r.id === id);
  if (!target) throw new Error("Request not found");
  return transition(target.token, "accepted");
}

export async function assignRecruiter(id: string, recruiterId: string): Promise<IntakeRequest> {
  const all = [...readAll()];
  const idx = all.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error("Request not found");
  const now = new Date().toISOString();
  const updated: IntakeRequest = {
    ...all[idx],
    assignedRecruiterId: recruiterId,
    status: "assigned",
    updatedAt: now,
    history: [...all[idx].history, { status: "assigned", at: now }],
  };
  all[idx] = updated;
  writeAll(all);
  return updated;
}
