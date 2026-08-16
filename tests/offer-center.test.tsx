import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OfferCenterBuilder } from "@/components/offer-center/OfferCenterBuilder";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OfferCenterBuilder", () => {
  it("shows the synthetic draft in a live one-page preview", () => {
    render(<OfferCenterBuilder />);

    expect(screen.getByLabelText("Предпросмотр оффера")).toHaveTextContent("Алексей, привет!");
    expect(screen.getByLabelText("Предпросмотр оффера")).toHaveTextContent("ПРОДУКТОВЫЙ АНАЛИТИК");
    expect(screen.getByText("Прототип · 1 страница")).toBeInTheDocument();
  });

  it("updates the preview when a recruiter edits a field", async () => {
    const user = userEvent.setup();
    render(<OfferCenterBuilder />);

    const candidateInput = screen.getByRole("textbox", { name: "Имя кандидата" });
    await user.clear(candidateInput);
    await user.type(candidateInput, "Марина");

    expect(screen.getByLabelText("Предпросмотр оффера")).toHaveTextContent("Марина, привет!");
  });

  it("requires an explicit human check before opening print", async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<OfferCenterBuilder />);

    const printButton = screen.getByRole("button", { name: "Печать / сохранить PDF" });
    expect(printButton).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", {
        name: /Я проверил\(а\) имя, должность, даты, формат работы и условия оплаты/,
      }),
    );

    expect(printButton).toBeEnabled();
    await user.click(printButton);
    expect(printSpy).toHaveBeenCalledOnce();
  });

  it("blocks print and explains which required field is missing", () => {
    render(<OfferCenterBuilder />);

    fireEvent.change(screen.getByRole("textbox", { name: "Оклад" }), { target: { value: "" } });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /Я проверил\(а\) имя, должность, даты, формат работы и условия оплаты/,
      }),
    );

    expect(screen.getByRole("button", { name: "Печать / сохранить PDF" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Осталось заполнить: оклад.");
  });
});
