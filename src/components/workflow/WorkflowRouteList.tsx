import Link from "next/link";
import { WORKFLOW_STAGES } from "@/lib/workflow/stages";

export function WorkflowRouteList() {
  return (
    <ol className="flex flex-col gap-2">
      {WORKFLOW_STAGES.map((stage) => (
        <li key={stage.id}>
          <Link
            href={`/workflow/${stage.id}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand hover:bg-brand-tint/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand-dark">
              {String(stage.order).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{stage.title}</span>
              <span className="block truncate text-xs text-muted">{stage.shortDescription}</span>
            </span>
            <span aria-hidden="true" className="shrink-0 text-muted">
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
