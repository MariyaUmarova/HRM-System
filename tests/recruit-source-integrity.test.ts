import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getRecruitContent } from "@/lib/recruit-content/source";

describe("Recruit standalone source integration", () => {
  it("keeps the approved ten-stage route while preserving source wording", () => {
    const content = getRecruitContent();
    expect(content.workflow).toHaveLength(10);
    expect(content.workflow.map((stage) => stage.title)).toEqual([
      "Получена новая вакансия",
      "Провожу бриф",
      "Ищу кандидатов",
      "Провожу HR-интервью",
      "Показываю кандидата заказчику",
      "Провожу совместное интервью с заказчиком",
      "Согласовываю оффер",
      "Делаю оффер кандидату",
      "Готовлю выход сотрудника",
      "Сопровождаю адаптацию",
    ]);

    const vacancy = content.scenarios.find((item) => item.id === "new-vacancy-assigned");
    expect(vacancy?.trigger).toBe("Руководитель подбора официально передал вакансию конкретному рекрутеру.");
    expect(vacancy?.steps?.[0]).toBe(
      "Подтвердить Руководителю подбора, что вакансия принята, и уточнить ответственного заказчика, подразделение, доступную информацию об условиях и дату активного старта.",
    );
  });

  it("imports only the two approved working helpers with supplied reference copy", () => {
    const content = getRecruitContent();
    expect(content.tools.map((tool) => tool.id).sort()).toEqual([
      "candidate-interview-analyzer",
      "offer-builder",
    ]);

    const interview = content.tools.find((tool) => tool.id === "candidate-interview-analyzer");
    expect(interview).toMatchObject({
      title: "ИИ-анализ интервью",
      description:
        "Сравнивает транскрипцию, видеоинтервью или заметки рекрутера с профилем вакансии и формирует доказательную оценку кандидата.",
      buttonLabel: "Проанализировать кандидата",
      generator: "candidate-analysis",
    });

    const offer = content.tools.find((tool) => tool.id === "offer-builder");
    expect(offer).toMatchObject({
      title: "Конструктор оффера",
      description:
        "Формирует готовый оффер Ivideon по корпоративному шаблону: подставляет данные кандидата, условия работы, оклад и бонус.",
      buttonLabel: "Создать оффер",
      generator: "offer-builder",
    });
  });

  it("treats the standalone HTML as data and never executes its JavaScript", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/lib/recruit-content/source.ts"),
      "utf8",
    );
    expect(source).not.toContain('from "node:vm"');
    expect(source).not.toContain("runInNewContext");
    expect(source).not.toContain("eval(");
  });

  it("keeps adaptation content out of the imported catalog", () => {
    const content = getRecruitContent();
    expect(content.articles.some((item) => item.category === "Адаптация")).toBe(false);
    expect(content.scenarios.some((item) => item.category === "Адаптация")).toBe(false);
    expect(content.scripts.some((item) => item.category === "Адаптация")).toBe(false);
    expect(content.checklists.some((item) => item.stage === "Адаптация")).toBe(false);
  });

  it("keeps constructors out of templates and preserves source scripts", () => {
    const content = getRecruitContent();
    expect(content.templates.some((item) => item.type === "Конструктор")).toBe(false);
    expect(content.scripts.some((item) => item.id === "manager-brief-invite")).toBe(true);
  });
});
