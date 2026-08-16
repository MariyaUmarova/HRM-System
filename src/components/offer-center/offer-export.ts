import {
  buildWorkFormat,
  displayDate,
  getOfferPages,
  getPaymentRows,
  type OfferDraft,
  type OfferTask,
} from "./offer-model";

export type OfferExportKind = "pdf" | "png" | "pptx";

const PAGE_WIDTH = 569;
const PAGE_HEIGHT = 1013;
const RENDER_SCALE = 3;
const PDF_WIDTH_POINTS = (148 / 25.4) * 72;
const PDF_HEIGHT_POINTS = (263 / 25.4) * 72;
const PPTX_WIDTH_INCHES = 148 / 25.4;
const PPTX_HEIGHT_INCHES = 263 / 25.4;
const BLUE = "#2456ff";
const BLUE_LIGHT = "#4696eb";
const INK = "#0d2348";
const MUTED = "#65748b";
const PALE = "#eaf4ff";
const LINE = "#b8d6ff";

interface PptxSlide {
  addImage(options: { data: string; x: number; y: number; w: number; h: number }): void;
}

interface PptxDocument {
  author: string;
  company: string;
  subject: string;
  title: string;
  lang: string;
  layout: string;
  defineLayout(options: { name: string; width: number; height: number }): void;
  addSlide(): PptxSlide;
  writeFile(options: { fileName: string }): Promise<void>;
}

declare global {
  interface Window {
    PptxGenJS?: new () => PptxDocument;
  }
}

type AssetName =
  | "icon-conf.png"
  | "icon-date.png"
  | "icon-dept.png"
  | "icon-format.png"
  | "icon-manager.png"
  | "icon-pay.png"
  | "job-offer.png"
  | "logo.png"
  | "pattern-large.png"
  | "pattern-small.png"
  | "robot.png";

const ASSET_NAMES: AssetName[] = [
  "icon-conf.png",
  "icon-date.png",
  "icon-dept.png",
  "icon-format.png",
  "icon-manager.png",
  "icon-pay.png",
  "job-offer.png",
  "logo.png",
  "pattern-large.png",
  "pattern-small.png",
  "robot.png",
];

let assetPromise: Promise<Record<AssetName, HTMLImageElement>> | null = null;

function loadImage(name: AssetName): Promise<HTMLImageElement> {
  return fetch(`/offer-assets/${name}`, { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`Не загрузился фирменный элемент: ${name}`);
      return response.blob();
    })
    .then(
      (blob) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const objectUrl = URL.createObjectURL(blob);
          const image = new Image();
          image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
          };
          image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`Не удалось прочитать фирменный элемент: ${name}`));
          };
          image.src = objectUrl;
        }),
    );
}

function loadAssets(): Promise<Record<AssetName, HTMLImageElement>> {
  if (assetPromise) return assetPromise;
  assetPromise = Promise.all(ASSET_NAMES.map(async (name) => [name, await loadImage(name)] as const))
    .then((items) => Object.fromEntries(items) as Record<AssetName, HTMLImageElement>)
    .catch((error) => {
      assetPromise = null;
      throw error;
    });
  return assetPromise;
}

function createPageCanvas(): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH * RENDER_SCALE;
  canvas.height = PAGE_HEIGHT * RENDER_SCALE;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Браузер не поддерживает экспорт изображения.");
  context.scale(RENDER_SCALE, RENDER_SCALE);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  context.textBaseline = "top";
  return { canvas, context };
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  const paragraphs = String(text || "—").split("\n");

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      return;
    }
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (!line || context.measureText(candidate).width <= maxWidth) {
        line = candidate;
        return;
      }
      lines.push(line);
      line = word;
    });
    if (line) lines.push(line);
  });
  return lines;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = wrapText(context, text, maxWidth);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return lines.length * lineHeight;
}

function drawRolePill(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  font: string,
): void {
  const gradient = context.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, BLUE);
  gradient.addColorStop(1, BLUE_LIGHT);
  roundedRect(context, x, y, width, height, height / 2);
  context.fillStyle = gradient;
  context.fill();
  context.save();
  roundedRect(context, x, y, width, height, height / 2);
  context.clip();
  context.fillStyle = "#ffffff";
  context.font = font;
  context.textAlign = "center";
  context.fillText(text || "[Должность]", x + width / 2, y + 5, width - 20);
  context.restore();
  context.textAlign = "left";
}

function drawInfoBlock(
  context: CanvasRenderingContext2D,
  assets: Record<AssetName, HTMLImageElement>,
  icon: AssetName,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): void {
  context.drawImage(assets[icon], x, y, 22, 22);
  context.fillStyle = MUTED;
  context.font = "13px Arial, Helvetica, sans-serif";
  context.fillText(label, x + 30, y + 3);
  context.fillStyle = INK;
  context.font = "14px Arial, Helvetica, sans-serif";
  drawWrappedText(context, value || "—", x + 28, y + 31, width - 28, 18);
}

function drawFirstPage(
  draft: OfferDraft,
  assets: Record<AssetName, HTMLImageElement>,
): HTMLCanvasElement {
  const { canvas, context } = createPageCanvas();

  context.drawImage(assets["pattern-small.png"], 0, 0, PAGE_WIDTH, 197);
  context.drawImage(assets["logo.png"], 27, 23, 252, 54);
  context.drawImage(assets["job-offer.png"], 269, 109, 273, 52);

  context.fillStyle = INK;
  context.font = "800 31px Arial, Helvetica, sans-serif";
  context.fillText(`${draft.candidateName.trim() || "[Имя]"}, привет!`, 29, 221);

  context.font = "16px Arial, Helvetica, sans-serif";
  context.fillText("Мы приглашаем тебя в команду ivideon на позицию", 29, 258);

  const roleWidth = Math.min(410, Math.max(235, context.measureText(draft.position).width + 30));
  drawRolePill(
    context,
    draft.position.trim() || "[Должность]",
    29,
    284,
    roleWidth,
    29,
    "16px Arial, Helvetica, sans-serif",
  );

  context.fillStyle = INK;
  context.font = "800 29px Arial, Helvetica, sans-serif";
  context.fillText("Вот что мы предлагаем:", 29, 337);

  drawInfoBlock(
    context,
    assets,
    "icon-dept.png",
    "Подразделение",
    draft.department,
    29,
    383,
    235,
  );
  drawInfoBlock(
    context,
    assets,
    "icon-date.png",
    "Дата выхода",
    displayDate(draft.startDate),
    302,
    383,
    238,
  );
  drawInfoBlock(
    context,
    assets,
    "icon-format.png",
    "Формат",
    buildWorkFormat(draft),
    29,
    470,
    235,
  );
  drawInfoBlock(
    context,
    assets,
    "icon-manager.png",
    "Руководитель",
    `${draft.manager.trim() || "—"}\n${draft.managerRole.trim() || "—"}`,
    302,
    470,
    238,
  );

  context.drawImage(assets["icon-pay.png"], 29, 576, 22, 22);
  context.fillStyle = MUTED;
  context.font = "13px Arial, Helvetica, sans-serif";
  context.fillText("Оплата труда", 59, 579);

  const rows = getPaymentRows(draft);
  const rowLineCounts = rows.map((row) => {
    context.font = row.main
      ? "700 13.2px Arial, Helvetica, sans-serif"
      : "12.4px Arial, Helvetica, sans-serif";
    return wrapText(context, row.text, 471).length;
  });
  const payHeight =
    12 +
    rowLineCounts.reduce((sum, count) => sum + Math.max(16, count * 15) + 10, 0);
  roundedRect(context, 29, 605, 511, payHeight, 15);
  context.fillStyle = PALE;
  context.fill();
  context.strokeStyle = LINE;
  context.lineWidth = 1;
  context.stroke();

  let rowY = 612;
  rows.forEach((row, index) => {
    if (index > 0) {
      context.strokeStyle = "#bdd6f7";
      context.beginPath();
      context.moveTo(43, rowY - 5);
      context.lineTo(526, rowY - 5);
      context.stroke();
    }
    context.fillStyle = row.main ? BLUE : INK;
    context.font = row.main
      ? "700 13.2px Arial, Helvetica, sans-serif"
      : "12.4px Arial, Helvetica, sans-serif";
    const height = drawWrappedText(context, row.text, 43, rowY, 471, 15);
    rowY += Math.max(16, height) + 10;
  });

  roundedRect(context, 29, 753, 511, 42, 18);
  context.strokeStyle = BLUE;
  context.lineWidth = 1.5;
  context.stroke();
  context.fillStyle = INK;
  context.font = "700 14px Arial, Helvetica, sans-serif";
  context.fillText("ДМС", 42, 766);
  context.fillStyle = "#6f7784";
  context.font = "10px Arial, Helvetica, sans-serif";
  context.fillText('Страховая компания "Лучи"', 78, 769);
  context.fillStyle = BLUE;
  context.font = "20px Arial, Helvetica, sans-serif";
  context.fillText("+", 231, 761);
  context.fillStyle = INK;
  context.font = "700 14px Arial, Helvetica, sans-serif";
  context.fillText("Английский язык", 259, 766);
  context.fillStyle = "#6f7784";
  context.font = "10px Arial, Helvetica, sans-serif";
  context.fillText("SkyEng", 386, 769);

  context.drawImage(assets["pattern-large.png"], 0, 804, PAGE_WIDTH, 209);
  context.fillStyle = "#ffffff";
  context.font = "35px Arial, Helvetica, sans-serif";
  context.fillText("Будем рады видеть", 31, 845);
  context.fillText("тебя в команде!", 31, 879);
  context.font = "17px Arial, Helvetica, sans-serif";
  context.fillText(`Ждём твой ответ до ${displayDate(draft.answerDate)}`, 31, 928);

  context.drawImage(assets["icon-conf.png"], 31, 968, 22, 22);
  context.font = "10px Arial, Helvetica, sans-serif";
  context.fillText("это сообщение конфиденциально", 63, 969);
  context.fillText("и не предназначено для распространения", 63, 981);
  context.drawImage(assets["robot.png"], 371, 840, 170, 173);

  return canvas;
}

function taskCardHeight(context: CanvasRenderingContext2D, item: OfferTask): number {
  context.font = "13px Arial, Helvetica, sans-serif";
  const taskLines = wrapText(context, item.task.trim(), 430).length;
  let height = 44 + taskLines * 18;
  if (item.result.trim()) {
    context.font = "12px Arial, Helvetica, sans-serif";
    const resultLines = wrapText(context, item.result.trim(), 430).length;
    height += 33 + resultLines * 17;
  }
  return Math.max(88, height);
}

function drawTaskCard(
  context: CanvasRenderingContext2D,
  item: OfferTask,
  number: number,
  y: number,
): number {
  const height = taskCardHeight(context, item);
  roundedRect(context, 34, y, 501, height, 10);
  context.fillStyle = "#ffffff";
  context.fill();
  context.strokeStyle = LINE;
  context.lineWidth = 1;
  context.stroke();

  context.beginPath();
  context.arc(59, y + 24, 11.5, 0, Math.PI * 2);
  context.fillStyle = BLUE;
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "800 11px Arial, Helvetica, sans-serif";
  context.textAlign = "center";
  context.fillText(String(number), 59, y + 18);
  context.textAlign = "left";

  context.fillStyle = BLUE;
  context.font = "800 12px Arial, Helvetica, sans-serif";
  context.fillText("Задача", 78, y + 18);

  context.fillStyle = INK;
  context.font = "13px Arial, Helvetica, sans-serif";
  const taskHeight = drawWrappedText(context, item.task.trim(), 78, y + 49, 430, 18);

  if (item.result.trim()) {
    const lineY = y + 57 + taskHeight;
    context.strokeStyle = "#d7e7fb";
    context.beginPath();
    context.moveTo(78, lineY);
    context.lineTo(522, lineY);
    context.stroke();

    roundedRect(context, 78, lineY + 9, 128, 18, 5);
    context.fillStyle = "#eef6ff";
    context.fill();
    context.fillStyle = BLUE;
    context.font = "800 10px Arial, Helvetica, sans-serif";
    context.fillText("Ожидаемый результат", 85, lineY + 13);

    context.fillStyle = INK;
    context.font = "12px Arial, Helvetica, sans-serif";
    drawWrappedText(context, item.result.trim(), 78, lineY + 34, 430, 17);
  }

  return height;
}

function drawTaskPage(
  draft: OfferDraft,
  tasks: OfferTask[],
  pageIndex: number,
  assets: Record<AssetName, HTMLImageElement>,
): HTMLCanvasElement {
  const { canvas, context } = createPageCanvas();
  context.drawImage(assets["pattern-small.png"], 0, 0, PAGE_WIDTH, 58);
  context.drawImage(assets["logo.png"], 24, 14, 104, 22);
  context.fillStyle = "#ffffff";
  context.font = "800 10px Arial, Helvetica, sans-serif";
  context.textAlign = "right";
  context.fillText("JOB OFFER", 545, 18);
  context.textAlign = "left";

  context.fillStyle = INK;
  context.font = "800 29px Arial, Helvetica, sans-serif";
  context.fillText(pageIndex === 0 ? "Твои задачи" : "Твои задачи — продолжение", 34, 79);

  let y = 119;
  if (pageIndex === 0 && draft.tasksSubtitle.trim()) {
    context.fillStyle = "#526784";
    context.font = "14px Arial, Helvetica, sans-serif";
    const subtitleHeight = drawWrappedText(
      context,
      draft.tasksSubtitle.trim(),
      34,
      y,
      501,
      19,
    );
    y += subtitleHeight + 14;
  }
  if (pageIndex === 0) {
    context.font = "15px Arial, Helvetica, sans-serif";
    const roleWidth = Math.min(390, Math.max(255, context.measureText(draft.position).width + 32));
    drawRolePill(
      context,
      draft.position.trim() || "[Должность]",
      34,
      y,
      roleWidth,
      29,
      "15px Arial, Helvetica, sans-serif",
    );
    y += 54;
  }

  tasks.forEach((item, index) => {
    y += drawTaskCard(context, item, pageIndex * 4 + index + 1, y) + 10;
  });

  context.drawImage(assets["pattern-large.png"], 0, 991, PAGE_WIDTH, 22);
  return canvas;
}

async function renderPages(draft: OfferDraft): Promise<HTMLCanvasElement[]> {
  await document.fonts?.ready;
  const assets = await loadAssets();
  const canvases = [drawFirstPage(draft, assets)];
  getOfferPages(draft).forEach((tasks, pageIndex) => {
    canvases.push(drawTaskPage(draft, tasks, pageIndex, assets));
  });
  return canvases;
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Не удалось создать файл."))),
      type,
      quality,
    );
  });
}

function downloadBlob(blob: Blob, name: string): void {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.remove();
  }, 1500);
}

function safeFileBase(candidateName: string, position: string): string {
  const raw = `Job Offer_${candidateName.trim() || "Кандидат"}_${position.trim() || "Должность"}`;
  return raw.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 100);
}

function crc32(bytes: Uint8Array): number {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
    }
  }
  return (value ^ 0xffffffff) >>> 0;
}

function uint16(value: number): Uint8Array {
  return new Uint8Array([value & 255, (value >>> 8) & 255]);
}

function uint32(value: number): Uint8Array {
  return new Uint8Array([
    value & 255,
    (value >>> 8) & 255,
    (value >>> 16) & 255,
    (value >>> 24) & 255,
  ]);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export async function buildStoredZip(files: Array<{ name: string; blob: Blob }>): Promise<Blob> {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(data);
    const local = concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(checksum),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      name,
      data,
    ]);
    locals.push(local);

    const central = concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(checksum),
      uint32(data.length),
      uint32(data.length),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      name,
    ]);
    centrals.push(central);
    offset += local.length;
  }

  const body = concat(locals);
  const directory = concat(centrals);
  const end = concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(directory.length),
    uint32(body.length),
    uint16(0),
  ]);
  return new Blob(
    [toArrayBuffer(body), toArrayBuffer(directory), toArrayBuffer(end)],
    { type: "application/zip" },
  );
}

function jpegBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function buildRasterPdf(canvases: HTMLCanvasElement[]): Blob {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let position = 0;

  const push = (value: string | Uint8Array) => {
    const bytes = typeof value === "string" ? encoder.encode(value) : value;
    chunks.push(bytes);
    position += bytes.length;
  };
  const object = (number: number, body: string) => {
    offsets[number] = position;
    push(`${number} 0 obj\n${body}\nendobj\n`);
  };

  push("%PDF-1.4\n");
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  const imageIds: number[] = [];
  let nextObject = 3;
  canvases.forEach(() => {
    pageIds.push(nextObject++);
    contentIds.push(nextObject++);
    imageIds.push(nextObject++);
  });

  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(
    2,
    `<< /Type /Pages /Count ${canvases.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`,
  );

  canvases.forEach((canvas, index) => {
    const image = jpegBytes(canvas.toDataURL("image/jpeg", 0.98));
    const stream = `q\n${PDF_WIDTH_POINTS} 0 0 ${PDF_HEIGHT_POINTS} 0 0 cm\n/Im${index + 1} Do\nQ\n`;
    object(
      pageIds[index],
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH_POINTS} ${PDF_HEIGHT_POINTS}] /Resources << /XObject << /Im${index + 1} ${imageIds[index]} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`,
    );
    object(contentIds[index], `<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream`);

    offsets[imageIds[index]] = position;
    push(
      `${imageIds[index]} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`,
    );
    push(image);
    push("\nendstream\nendobj\n");
  });

  const xrefPosition = position;
  push(`xref\n0 ${nextObject}\n0000000000 65535 f \n`);
  for (let index = 1; index < nextObject; index += 1) {
    push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  push(
    `trailer\n<< /Size ${nextObject} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`,
  );
  return new Blob(chunks.map(toArrayBuffer), { type: "application/pdf" });
}

let pptxLoader: Promise<void> | null = null;

function loadPptxGenJs(): Promise<void> {
  if (window.PptxGenJS) return Promise.resolve();
  if (pptxLoader) return pptxLoader;

  pptxLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "/vendor/pptxgen.bundle.js";
    script.async = true;
    script.onload = () =>
      window.PptxGenJS ? resolve() : reject(new Error("Модуль PPTX не загрузился."));
    script.onerror = () => reject(new Error("Не удалось загрузить модуль PPTX."));
    document.head.appendChild(script);
  });
  return pptxLoader;
}

async function exportPptx(canvases: HTMLCanvasElement[], fileName: string): Promise<void> {
  await loadPptxGenJs();
  if (!window.PptxGenJS) throw new Error("Модуль PPTX недоступен.");

  const pptx = new window.PptxGenJS();
  pptx.defineLayout({
    name: "IVIDEON_OFFER",
    width: PPTX_WIDTH_INCHES,
    height: PPTX_HEIGHT_INCHES,
  });
  pptx.layout = "IVIDEON_OFFER";
  pptx.author = "Ivideon HR Hub";
  pptx.company = "Ivideon";
  pptx.subject = "Job Offer";
  pptx.title = fileName;
  pptx.lang = "ru-RU";

  canvases.forEach((canvas) => {
    const slide = pptx.addSlide();
    slide.addImage({
      data: canvas.toDataURL("image/png"),
      x: 0,
      y: 0,
      w: PPTX_WIDTH_INCHES,
      h: PPTX_HEIGHT_INCHES,
    });
  });
  await pptx.writeFile({ fileName: `${fileName}.pptx` });
}

export async function exportOffer(
  kind: OfferExportKind,
  draft: OfferDraft,
): Promise<void> {
  const fileName = safeFileBase(draft.candidateName, draft.position);
  const canvases = await renderPages(draft);

  if (kind === "pdf") {
    downloadBlob(buildRasterPdf(canvases), `${fileName}.pdf`);
    return;
  }

  if (kind === "png") {
    const files: Array<{ name: string; blob: Blob }> = [];
    for (let index = 0; index < canvases.length; index += 1) {
      files.push({
        name: `${fileName}_${index + 1}.png`,
        blob: await canvasBlob(canvases[index]),
      });
    }
    downloadBlob(await buildStoredZip(files), `${fileName}_PNG.zip`);
    return;
  }

  await exportPptx(canvases, fileName);
}
