import { LinkButton } from "@/components/ui/Button";

export function KnowledgeBaseEntryCard() {
  return (
    <div className="rounded-xl border border-brand/30 bg-brand-tint p-5">
      <p className="text-sm font-semibold text-brand-dark">База знаний</p>
      <p className="mt-1 text-sm text-brand-dark/80">
        Инструкции, регламенты, шаблоны, чек-листы, скрипты и помощники для каждого этапа маршрута.
      </p>
      <LinkButton href="/knowledge-base" variant="primary" className="mt-4">
        Открыть базу знаний
      </LinkButton>
    </div>
  );
}
