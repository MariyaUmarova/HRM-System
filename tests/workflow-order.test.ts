import { describe, expect, it } from "vitest";
import { WORKFLOW_STAGES } from "@/lib/workflow/stages";

/**
 * The 10-stage order is a non-negotiable product rule (CLAUDE.md → "Required
 * recruiter workflow order"). Stages 5 and 6 are intentionally swapped versus
 * the read-only Ivideon Recruit v7.4 HTML source.
 */
const REQUIRED_ORDER = [
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
];

describe("WORKFLOW_STAGES", () => {
  it("has exactly 10 stages", () => {
    expect(WORKFLOW_STAGES).toHaveLength(10);
  });

  it("matches the required order and titles exactly", () => {
    expect(WORKFLOW_STAGES.map((s) => s.title)).toEqual(REQUIRED_ORDER);
  });

  it("numbers stages 1..10 without gaps, matching array position", () => {
    WORKFLOW_STAGES.forEach((stage, index) => {
      expect(stage.order).toBe(index + 1);
    });
  });

  it("puts 'Показываю кандидата заказчику' immediately before 'Провожу совместное интервью с заказчиком'", () => {
    const presentationIndex = WORKFLOW_STAGES.findIndex((s) => s.id === "candidate-presentation");
    const jointInterviewIndex = WORKFLOW_STAGES.findIndex((s) => s.id === "joint-interview");
    expect(presentationIndex).toBe(4); // 5th stage, 0-indexed
    expect(jointInterviewIndex).toBe(5); // 6th stage, 0-indexed
    expect(jointInterviewIndex).toBe(presentationIndex + 1);
  });

  it("every stage has all six required content blocks non-empty", () => {
    for (const stage of WORKFLOW_STAGES) {
      expect(stage.entry.length, `${stage.title}: entry`).toBeGreaterThan(0);
      expect(stage.participants.length, `${stage.title}: participants`).toBeGreaterThan(0);
      expect(stage.whatToDo.length, `${stage.title}: whatToDo`).toBeGreaterThan(0);
      expect(stage.howTo.length, `${stage.title}: howTo`).toBeGreaterThan(0);
      expect(stage.sla.length, `${stage.title}: sla`).toBeGreaterThan(0);
      expect(stage.doneWhen.length, `${stage.title}: doneWhen`).toBeGreaterThan(0);
    }
  });

  it("has unique stage ids", () => {
    const ids = WORKFLOW_STAGES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe("stage 7 — Согласовываю оффер", () => {
    const stage = WORKFLOW_STAGES.find((s) => s.id === "offer-approval");
    if (!stage) throw new Error("offer-approval stage not found");

    it("entry names Customer, Recruiter, HRBP and Head of Recruitment as agreeing evaluators", () => {
      const entryText = stage.entry.join(" ");
      expect(entryText).toContain("Заказчик");
      expect(entryText).toContain("рекрутер");
      expect(entryText).toContain("HRBP");
      expect(entryText).toContain("Руководитель подбора");
      expect(entryText).toContain("другие участники оценки");
    });

    it("lists the full business-process participant roster", () => {
      const participantsText = stage.participants.join(" ");
      expect(participantsText).toContain("Рекрутер");
      expect(participantsText).toContain("Руководитель подбора");
      expect(participantsText).toContain("HRBP");
      expect(participantsText).toContain("HRD / директор по персоналу");
      expect(participantsText).toContain("Генеральный директор");
      expect(participantsText).toContain("Кадры");
    });

    it("keeps email routing (To Head+HRD, CC KDP) separate from the participants list", () => {
      const participantsText = stage.participants.join(" ");
      expect(participantsText).not.toContain("Алена Алешова");
      expect(participantsText).not.toContain("Мария Комиссарова");
      expect(participantsText).not.toContain("КДП");

      const howToText = stage.howTo.join(" ");
      expect(howToText).toContain("кому — Руководитель подбора и HRD");
      expect(howToText).toContain("в копии — направление КДП: Алена Алешова и Мария Комиссарова");
    });

    it("restores the detailed recruiter checklist and email contents/files", () => {
      const howToText = stage.howTo.join(" ");
      expect(howToText).toContain("Собрать оффер");
      expect(howToText).toContain("Добавьте задачи роли на отдельную страницу оффера");
      expect(howToText).toContain("Проверьте этапы интервью и источник кандидата");
      expect(howToText).toContain("Получите очищенное CV с предпросмотром внесённых изменений");
      expect(howToText).toContain("очищенный PDF резюме");
      expect(howToText).toContain("финальный PDF оффера");
      expect(howToText).toContain("контрольный экран");
    });

    it("requires HRD approval, General Director approval, an exact saved PDF version, and readiness to present", () => {
      const doneWhenText = stage.doneWhen.join(" ");
      expect(doneWhenText).toContain("согласован HRD");
      expect(doneWhenText).toContain("согласован Генеральным директором");
      expect(doneWhenText).toContain("та версия PDF, которая была согласована");
      expect(doneWhenText).toContain("готов к презентации кандидату");
    });

    it("starts reapproval on material change after approval", () => {
      const doneWhenText = stage.doneWhen.join(" ");
      expect(doneWhenText).toContain("создаётся новая версия и запускается повторное согласование");
    });
  });
});
