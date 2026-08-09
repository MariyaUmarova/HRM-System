import type { ReactNode } from "react";

/**
 * Isolated customer shell. Deliberately does not import AppShell/Nav — the
 * customer must never see internal navigation, other requests, or any portal
 * area besides their own request (CLAUDE.md: "Customer cannot see internal
 * navigation").
 */
export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-2 px-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            iH
          </span>
          <span className="text-sm font-semibold text-foreground">Ivideon HR Hub — заявка на подбор</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
