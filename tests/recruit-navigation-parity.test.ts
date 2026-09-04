import { describe, expect, it } from "vitest";
import { NAV_ITEMS } from "@/components/app-shell/nav-items";

const sourceFacing = [
  { href: "/scenarios", label: "Рабочие ситуации", icon: "⚡", group: "Рабочий процесс" },
  { href: "/scripts", label: "Скрипты", icon: "✎", group: "Материалы" },
  { href: "/templates", label: "Шаблоны и чек-листы", icon: "⬇", group: "Материалы" },
  { href: "/tools", label: "Помощники", icon: "✦", group: "Материалы" },
];

describe("Recruit sidebar navigation parity", () => {
  it("keeps the selected standalone navigation labels, icons and groups", () => {
    expect(
      NAV_ITEMS.filter((item) => sourceFacing.some(({ href }) => href === item.href)).map(({ href, label, icon, group }) => ({ href, label, icon, group })),
    ).toEqual(sourceFacing);
  });

  it("keeps HR Radar as the explicitly preserved HRM extension", () => {
    expect(NAV_ITEMS).toContainEqual({
      href: "/hr-radar",
      label: "HR Radar",
      area: "hr_radar",
      icon: "▤",
      group: "Материалы",
    });
  });

  it("does not restore excluded legacy sidebar sections", () => {
    const labels = NAV_ITEMS.map((item) => item.label);
    expect(labels).not.toContain("База знаний");
    expect(labels).not.toContain("Адаптация");
    expect(labels).not.toContain("Избранное");
    expect(labels).not.toContain("Качество знаний");
  });

  it("keeps Home role-aware without duplicating it for a single rendered role", () => {
    const homeItems = NAV_ITEMS.filter((item) => item.href === "/");
    expect(homeItems.map((item) => item.area).sort()).toEqual(["management_home", "recruiter_home"]);
    expect(new Set(homeItems.map((item) => item.label))).toEqual(new Set(["Главная"]));
    expect(new Set(homeItems.map((item) => item.icon))).toEqual(new Set(["⌂"]));
  });
});
