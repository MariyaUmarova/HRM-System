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
    expect(vacancy?.steps?.[0]).toContain("Подтвердить Руководителю подбора, что вакансия принята");
  });

  it("imports only the two approved working helpers", () => {
    const content = getRecruitContent();
    expect(content.tools.map((tool) => tool.id).sort()).toEqual([
      "candidate-interview-analyzer",
      "offer-builder",
    ]);
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
