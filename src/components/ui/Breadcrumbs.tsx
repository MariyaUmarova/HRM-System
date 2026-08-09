import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * Hierarchical back navigation: nested material -> parent instruction -> stage ->
 * full route -> home. Each crumb links to its real URL so context (query params,
 * scroll position) is preserved rather than relying on browser history state.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-brand hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-foreground" : ""}>{item.label}</span>
            )}
            {!isLast && <span aria-hidden="true">/</span>}
          </span>
        );
      })}
    </nav>
  );
}
