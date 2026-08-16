export type OfferExportKind = "pdf" | "png" | "pptx";

const PAGE_WIDTH = 569;
const PAGE_HEIGHT = 1013;
const RENDER_SCALE = 3;
const PDF_WIDTH_POINTS = (148 / 25.4) * 72;
const PDF_HEIGHT_POINTS = (263 / 25.4) * 72;
const PPTX_WIDTH_INCHES = 148 / 25.4;
const PPTX_HEIGHT_INCHES = 263 / 25.4;

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

function waitForTwoFrames(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function waitForImages(root: ParentNode): Promise<void[]> {
  return Promise.all(
    Array.from(root.querySelectorAll("img")).map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete && image.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          window.setTimeout(done, 3000);
        }),
    ),
  );
}

function inlineComputedStyles(source: HTMLElement, clone: HTMLElement): void {
  const sourceElements = [source, ...Array.from(source.querySelectorAll<HTMLElement>("*"))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>("*"))];

  sourceElements.forEach((element, index) => {
    const target = cloneElements[index];
    if (!target) return;
    const computed = window.getComputedStyle(element);
    let cssText = "";
    for (let styleIndex = 0; styleIndex < computed.length; styleIndex += 1) {
      const property = computed.item(styleIndex);
      if (property === "transform" || property === "transition" || property === "box-shadow") {
        continue;
      }
      cssText += `${property}:${computed.getPropertyValue(property)};`;
    }
    target.setAttribute("style", cssText);
  });

  clone.style.width = `${PAGE_WIDTH}px`;
  clone.style.height = `${PAGE_HEIGHT}px`;
  clone.style.margin = "0";
  clone.style.overflow = "hidden";
  clone.style.position = "relative";
  clone.style.transform = "none";
  clone.style.boxShadow = "none";
}

function imageAsDataUrl(image: HTMLImageElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Браузер не смог подготовить фирменную графику.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function embedImages(source: HTMLElement, clone: HTMLElement): void {
  const sourceImages = Array.from(source.querySelectorAll("img"));
  const cloneImages = Array.from(clone.querySelectorAll("img"));
  sourceImages.forEach((image, index) => {
    const target = cloneImages[index];
    if (!target) return;
    target.removeAttribute("srcset");
    target.removeAttribute("sizes");
    target.src = imageAsDataUrl(image);
  });
}

async function pageToCanvas(page: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForImages(page);
  const clone = page.cloneNode(true) as HTMLElement;
  inlineComputedStyles(page, clone);
  embedImages(page, clone);

  const host = document.createElement("div");
  host.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  host.style.cssText =
    `width:${PAGE_WIDTH}px;height:${PAGE_HEIGHT}px;overflow:hidden;margin:0;padding:0;background:#fff;position:relative;`;
  host.appendChild(clone);

  const markup = new XMLSerializer().serializeToString(host);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}" viewBox="0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}"><foreignObject x="0" y="0" width="${PAGE_WIDTH}" height="${PAGE_HEIGHT}">${markup}</foreignObject></svg>`;
  const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const rendered = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Не удалось отрисовать страницу оффера."));
      image.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = PAGE_WIDTH * RENDER_SCALE;
    canvas.height = PAGE_HEIGHT * RENDER_SCALE;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Браузер не поддерживает экспорт изображения.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(rendered, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function renderPages(pages: HTMLElement[]): Promise<HTMLCanvasElement[]> {
  if (pages.length === 0) throw new Error("Страницы предпросмотра не найдены.");
  await document.fonts?.ready;
  await waitForImages(document);
  await waitForTwoFrames();

  const canvases: HTMLCanvasElement[] = [];
  for (const page of pages) {
    canvases.push(await pageToCanvas(page));
  }
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

async function makeZip(files: Array<{ name: string; blob: Blob }>): Promise<Blob> {
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
  return new Blob([body, directory, end], { type: "application/zip" });
}

function jpegBytes(dataUrl: string): Uint8Array {
  const binary = atob(dataUrl.split(",")[1]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function makePdf(canvases: HTMLCanvasElement[]): Blob {
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
  return new Blob(chunks, { type: "application/pdf" });
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
  pages: HTMLElement[],
  candidateName: string,
  position: string,
): Promise<void> {
  const fileName = safeFileBase(candidateName, position);
  const canvases = await renderPages(pages);

  if (kind === "pdf") {
    downloadBlob(makePdf(canvases), `${fileName}.pdf`);
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
    downloadBlob(await makeZip(files), `${fileName}_PNG.zip`);
    return;
  }

  await exportPptx(canvases, fileName);
}
