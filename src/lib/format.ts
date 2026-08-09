const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

/** Returns the Monday..Friday range containing `reference` as ISO date strings. */
export function currentWorkWeek(reference = new Date()): { start: string; end: string } {
  const date = new Date(reference);
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { start: monday.toISOString(), end: friday.toISOString() };
}

export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return `${DATE_FORMATTER.format(start)} — ${DATE_FORMATTER.format(end)}`;
}

export function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
