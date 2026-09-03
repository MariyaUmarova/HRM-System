"use client";

import Link from "next/link";
import { Fragment } from "react";
import { usePathname } from "next/navigation";
import { canAccess, type Role } from "@/lib/auth/roles";
import { NAV_ITEMS } from "./nav-items";

export function Nav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => canAccess(role, item.area));
  let lastGroup: string | undefined;

  return (
    <nav aria-label="Основная навигация" className="rr-nav">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const showGroup = Boolean(item.group && item.group !== lastGroup);
        lastGroup = item.group;

        return (
          <Fragment key={`${item.area}:${item.href}`}>
            {showGroup ? <div className="rr-nav-label">{item.group}</div> : null}
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`rr-nav-link${active ? " active" : ""}`}
            >
              <span className="rr-nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}
