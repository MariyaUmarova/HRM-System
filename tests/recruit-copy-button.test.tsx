import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CopyButton } from "@/components/recruit/CopyButton";

function setClipboard(writeText: (value: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

describe("Recruit copy action", () => {
  it("shows success feedback after copying", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);
    render(<CopyButton text="Готовый скрипт" />);

    fireEvent.click(screen.getByRole("button", { name: "Скопировать" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("Готовый скрипт"));
    expect(screen.getByRole("button", { name: "Скопировано" })).toBeInTheDocument();
  });

  it("shows failure feedback instead of throwing silently", async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<CopyButton text="Готовый скрипт" />);

    fireEvent.click(screen.getByRole("button", { name: "Скопировать" }));

    expect(await screen.findByRole("button", { name: "Не удалось скопировать" })).toBeInTheDocument();
  });
});
