export const RECRUIT_SOURCE_LABELS: Record<string, string> = {
  confirmed: "Подтверждено внутренним документом",
  inferred: "Выведено из нескольких документов",
  proposed: "Предлагаемая практика — нужно согласование Head",
  mixed: "Часть подтверждена, часть требует согласования",
  legal: "Требует юридической проверки",
  approved: "Практика утверждена Head",
  returned: "Возвращено на доработку",
  rejected: "Отклонено Head of Recruitment",
};

export function recruitSourceLabel(confidence?: string): string {
  if (!confidence) return "";
  return RECRUIT_SOURCE_LABELS[confidence] ?? confidence;
}
