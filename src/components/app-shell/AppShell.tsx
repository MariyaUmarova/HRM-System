"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { isManagementRole, ROLE_LABELS, type Role } from "@/lib/auth/roles";
import { GlobalSearch } from "./GlobalSearch";
import { Nav } from "./Nav";

function profileInitials(role: Role): string {
  if (role === "head_of_recruitment") return "РП";
  if (role === "hrd") return "HR";
  return "Р";
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="rr-app">
      {mobileOpen ? (
        <button
          type="button"
          className="rr-sidebar-overlay"
          aria-label="Закрыть меню"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside className={`rr-sidebar${mobileOpen ? " open" : ""}`}>
        <div className="rr-sidebar-head">
          <Link href="/" className="rr-brand" onClick={() => setMobileOpen(false)}>
            ivideon <span>recruit</span>
          </Link>
          <button
            aria-label="Закрыть меню"
            className="rr-icon rr-mobile"
            type="button"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
        </div>

        <Nav role={role} onNavigate={() => setMobileOpen(false)} />

        <div
          className="rr-user"
          aria-label={`Текущий профиль: ${ROLE_LABELS[role]}`}
        >
          <div className="rr-avatar" aria-hidden="true">{profileInitials(role)}</div>
          <div className="min-w-0">
            <strong>Рабочий профиль</strong>
            <small>{ROLE_LABELS[role]}</small>
          </div>
          {isManagementRole(role) ? (
            <Link
              href="/platform-management"
              className="rr-icon"
              aria-label="Управление платформой"
              title="Управление платформой"
              onClick={() => setMobileOpen(false)}
            >
              ⚙
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </div>
      </aside>

      <main className="rr-main">
        <header className="rr-topbar">
          <button
            aria-label="Открыть меню"
            className="rr-icon rr-mobile"
            type="button"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>
          <GlobalSearch />
        </header>
        <div className="rr-content">{children}</div>
      </main>
    </div>
  );
}
