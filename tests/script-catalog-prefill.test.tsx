import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScriptCatalog } from "@/components/recruit/ScriptCatalog";
import type { RecruitScript } from "@/lib/recruit-content/types";

const scripts: RecruitScript[] = [
  {
    id: "candidate-message",
    title: "Сообщение кандидату",
    category: "Кандидат",
    channel: "Telegram",
    text: "Здравствуйте! Хотим обсудить с вами вакансию.",
  },
  {
    id: "manager-message",
    title: "Сообщение заказчику",
    category: "Заказчик",
    channel: "Email",
    text: "Добрый день! Возвращаемся с обновлением по вакансии.",
  },
];

describe("ScriptCatalog prefilled search", () => {
  it("uses the quick-action query immediately", () => {
    render(<ScriptCatalog scripts={scripts} initialQuery="кандидат" />);

    expect(screen.getByRole("searchbox", { name: "Найти скрипт или фразу" })).toHaveValue("кандидат");
    expect(screen.getByText("Сообщение кандидату")).toBeInTheDocument();
    expect(screen.queryByText("Сообщение заказчику")).not.toBeInTheDocument();
  });
});
