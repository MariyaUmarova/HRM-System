import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LocalInterviewTextAnalyzer } from "@/components/interview-analysis/LocalInterviewTextAnalyzer";
import { createLocalInterviewAnalysis } from "@/components/interview-analysis/interview-analysis-model";

describe("local interview analysis", () => {
  it("links direct text evidence to criteria and turns missing evidence into a question", () => {
    const result = createLocalInterviewAnalysis({
      vacancyTitle: "B2B Sales",
      criteria: "Опыт B2B-продаж\nПереговоры с ЛПР\nАнглийский язык",
      notes:
        "Кандидат: Последние три года я работал в B2B-продажах. Кандидат: На крупных сделках проводил переговоры с директорами компаний.",
    });

    expect(result.facts.some((item) => item.text.includes("Опыт B2B-продаж"))).toBe(true);
    expect(result.facts.some((item) => item.evidence?.includes("B2B-продажах"))).toBe(true);
    expect(result.risks.some((item) => item.text.includes("Английский язык"))).toBe(true);
    expect(result.questions.some((item) => item.text.includes("Английский язык"))).toBe(true);
    expect(result.huntflowDraft).toContain("Не является AI-оценкой");
  });

  it("never converts missing evidence into a negative candidate judgement", () => {
    const result = createLocalInterviewAnalysis({
      criteria: "Управление командой",
      notes: "Кандидат: Я отвечал за собственные проекты и еженедельные отчёты.",
    });

    expect(result.conclusions).toHaveLength(0);
    expect(result.risks[0]?.text).toContain("пробел в материале, а не отрицательная оценка кандидата");
  });

  it("analyses arbitrary de-identified text in the browser instead of requiring the fixed demo", async () => {
    const user = userEvent.setup();
    render(<LocalInterviewTextAnalyzer />);

    await user.type(screen.getByRole("textbox", { name: "Локальный анализ — критерии" }), "Опыт B2B-продаж\nАнглийский язык");
    await user.type(
      screen.getByRole("textbox", { name: "Локальный анализ — материал" }),
      "Кандидат: Последние три года я работал в B2B-продажах с корпоративными клиентами.",
    );
    await user.click(screen.getByRole("button", { name: "Сформировать предварительный анализ" }));

    expect(screen.getByText("Локальный evidence-based результат")).toBeInTheDocument();
    expect(screen.getAllByText(/Опыт B2B-продаж/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Английский язык/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("status")).toHaveTextContent("Никакой внешний AI не вызывался");
    expect(screen.getByRole("button", { name: "Отправить в Huntflow" })).toBeDisabled();
  });
});
