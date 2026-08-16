import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { OfferCenterBuilder } from "@/components/offer-center/OfferCenterBuilder";
import {
  buildRasterPdf,
  buildStoredZip,
} from "@/components/offer-center/offer-export";
import {
  getMissingFields,
  getOfferPages,
  INITIAL_DRAFT,
  type OfferDraft,
} from "@/components/offer-center/offer-model";
import { __resetStoreForTests } from "@/lib/adapters/requests.store";

beforeEach(() => {
  window.localStorage.clear();
  __resetStoreForTests();
});

function readBlob(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

describe("offer model", () => {
  it("treats an expected result as optional", () => {
    expect(getMissingFields(INITIAL_DRAFT)).not.toContain("ожидаемый результат");
  });

  it("requires a task only when a result was entered for it", () => {
    const draft: OfferDraft = {
      ...INITIAL_DRAFT,
      tasks: [{ id: "result-only", task: "", result: "Готово" }],
    };
    expect(getMissingFields(draft)).toContain(
      "задача для заполненного ожидаемого результата",
    );
  });

  it("creates continuation pages without changing task content", () => {
    const draft: OfferDraft = {
      ...INITIAL_DRAFT,
      tasks: Array.from({ length: 5 }, (_, index) => ({
        id: `task-${index}`,
        task: `Задача ${index + 1}`,
        result: "",
      })),
    };
    expect(getOfferPages(draft).map((page) => page.length)).toEqual([4, 1]);
  });
});

describe("offer export containers", () => {
  it("builds a readable stored ZIP with every supplied filename", async () => {
    const archive = await buildStoredZip([
      { name: "offer_1.png", blob: new Blob(["page-one"]) },
      { name: "offer_2.png", blob: new Blob(["page-two"]) },
    ]);
    const bytes = new Uint8Array(await readBlob(archive));
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const content = new TextDecoder().decode(bytes);
    expect(content).toContain("offer_1.png");
    expect(content).toContain("offer_2.png");
  });

  it("builds a two-page PDF with a valid header and page tree", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1707;
    canvas.height = 3039;
    canvas.toDataURL = () => "data:image/jpeg;base64,/9j/2Q==";
    const pdf = buildRasterPdf([canvas, canvas]);
    const content = new TextDecoder().decode(new Uint8Array(await readBlob(pdf)));
    expect(content.startsWith("%PDF-1.4")).toBe(true);
    expect(content).toContain("/Count 2");
    expect(content).toContain("/MediaBox");
    expect(content.endsWith("%%EOF")).toBe(true);
  });
});

describe("OfferCenterBuilder", () => {
  it("shows a fixed first page and a separate tasks page", () => {
    render(<OfferCenterBuilder />);

    expect(screen.getByLabelText("Предпросмотр оффера, страница 1")).toHaveTextContent(
      "Алексей, привет!",
    );
    const tasksPage = screen.getByLabelText("Предпросмотр оффера, страница 2");
    expect(tasksPage).toHaveTextContent("Твои задачи");
    expect(tasksPage).toHaveTextContent("Тестовая задача без ожидаемого результата");
    expect(within(tasksPage).getAllByText("Задача")).toHaveLength(2);
    expect(within(tasksPage).getAllByText("Ожидаемый результат")).toHaveLength(1);
  });

  it("keeps the task label when an optional result stays empty", async () => {
    const user = userEvent.setup();
    render(<OfferCenterBuilder />);

    const taskInputs = screen.getAllByRole("textbox", { name: "Задача" });
    await user.clear(taskInputs[0]);
    await user.type(taskInputs[0], "Задача без результата");

    const tasksPage = screen.getByLabelText("Предпросмотр оффера, страница 2");
    expect(tasksPage).toHaveTextContent("Задача без результата");
    expect(within(tasksPage).getAllByText("Задача")).toHaveLength(2);
  });

  it("prefills only position and department from an assigned request", async () => {
    const user = userEvent.setup();
    render(<OfferCenterBuilder />);

    await user.selectOptions(screen.getByLabelText("Заявка в поиске"), "req-3");

    expect(screen.getByRole("textbox", { name: "Должность" })).toHaveValue(
      "Инженер техподдержки 2-й линии",
    );
    expect(screen.getByRole("textbox", { name: "Подразделение" })).toHaveValue(
      "Инфраструктура",
    );
    expect(screen.getByRole("textbox", { name: "Имя кандидата" })).toHaveValue("Алексей");
  });

  it("requires a human check before enabling every export", async () => {
    const user = userEvent.setup();
    render(<OfferCenterBuilder />);

    const pdf = screen.getByRole("button", { name: "Скачать PDF" });
    const png = screen.getByRole("button", { name: "Все страницы PNG" });
    const pptx = screen.getByRole("button", { name: "Скачать PPTX" });
    expect(pdf).toBeDisabled();
    expect(png).toBeDisabled();
    expect(pptx).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", {
        name: /Я проверил\(а\) все страницы, даты, формат работы, оплату и задачи/,
      }),
    );

    expect(pdf).toBeEnabled();
    expect(png).toBeEnabled();
    expect(pptx).toBeEnabled();
  });

  it("blocks export and identifies a missing required field", () => {
    render(<OfferCenterBuilder />);

    fireEvent.change(screen.getByRole("textbox", { name: "Основной блок" }), {
      target: { value: "" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Я проверил\(а\) все страницы, даты, формат работы, оплату и задачи/,
      }),
    );

    expect(screen.getByRole("button", { name: "Скачать PDF" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Осталось заполнить: основной блок оплаты.",
    );
  });
});
