"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { Nav } from "./Nav";

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="flex h-16 items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-foreground hover:bg-background md:hidden"
              aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((value) => !value)}
            >
              <span aria-hidden="true">{mobileOpen ? "✕" : "☰"}</span>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                iH
              </span>
              <span className="text-sm font-semibold text-foreground">Ivideon HR Hub</span>
            </Link>
          </div>

          <div
            aria-label={"Текущий профиль: " + ROLE_LABELS[role]}
            className="flex min-w-0 shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-7 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand"
            >
              ТП
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block text-[11px] leading-tight text-muted">Тестовый профиль</span>
              <span className="block max-w-44 truncate text-sm font-medium leading-tight text-foreground">
                {ROLE_LABELS[role]}
              </span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <aside
          className={"fixed inset-0 z-30 bg-black/30 md:static md:z-auto md:block md:w-56 md:shrink-0 md:bg-transparent " +
            (mobileOpen ? "block" : "hidden")}
          onClick={(event) => {
            if (event.target === event.currentTarget) setMobileOpen(false);
          }}
        >
          <div className="h-full w-64 max-w-[80vw] bg-surface p-4 md:h-auto md:w-full md:rounded-xl md:border md:border-border md:bg-surface">
            <Nav role={role} onNavigate={() => setMobileOpen(false)} />
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
