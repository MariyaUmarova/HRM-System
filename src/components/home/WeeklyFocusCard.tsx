import { Card, CardHeader } from "@/components/ui/Card";
import { HelpTooltip } from "@/components/ui/HelpTooltip";
import { StatusPill } from "@/components/ui/StatusPill";
import { recruiterName } from "@/lib/adapters/weekly-focus.seed";
import type { WeeklyFocus } from "@/lib/adapters/types";
import { formatDateRange } from "@/lib/format";

export function WeeklyFocusCard({ focus, showOwner = false }: { focus: WeeklyFocus; showOwner?: boolean }) {
  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            Фокусы недели
            <HelpTooltip label="Что такое фокусы недели">
              Приоритетные поиски, которые Руководитель подбора поставил в приоритет. Уточняются на
              командных точках контроля в понедельник и четверг.
            </HelpTooltip>
          </span>
        }
        description={formatDateRange(focus.rangeStart, focus.rangeEnd)}
      />
      {focus.items.length === 0 ? (
        <p className="text-sm text-muted">На эту неделю фокусы ещё не назначены.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {focus.items.map((item) => (
            <li key={item.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.priorityNote}</p>
                  {showOwner && <StatusPill tone="neutral">{recruiterName(item.ownerRecruiterId)}</StatusPill>}
                </div>
                <a
                  href={item.vacancyRef.huntflowUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-xs font-medium text-brand hover:underline"
                >
                  Открыть в Хантфлоу →
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
