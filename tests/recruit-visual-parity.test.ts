import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("Recruit standalone visual anchors", () => {
  it("keeps the uploaded standalone palette and shell geometry", () => {
    const css = read("src/app/recruit.css");

    expect(css).toContain("--rr-blue:#2053f8");
    expect(css).toContain("--rr-bg:#f6f8fc");
    expect(css).toContain("--rr-radius:18px;--rr-sidebar:264px");
    expect(css).toContain("--rr-shadow:0 14px 36px rgba(31,43,74,.09)");
    expect(css).toContain("height:76px;padding:12px 30px");
    expect(css).toContain("max-width:740px");
  });

  it("keeps the final home cascade rather than the older generic hero values", () => {
    const css = read("src/app/recruit.css");

    expect(css).toContain(".rr-hero{position:relative;overflow:hidden;border-radius:26px;padding:38px 42px");
    expect(css).toContain("margin-bottom:22px");
    expect(css).toContain(".rr-hero h1{font-size:clamp(38px,4vw,58px)");
    expect(css).toContain(".rr-hero-search{display:flex;max-width:560px");
  });

  it("keeps the standalone Home sequence before HRM-specific operational blocks", () => {
    const home = read("src/components/recruit/RecruitHome.tsx");
    const hero = home.indexOf('className="rr-hero"');
    const route = home.indexOf('className="rr-home-route-card"');
    const resources = home.indexOf('className="rr-resource-grid"');
    const operations = home.indexOf('{operations ? <section className="rr-ops">');

    expect(hero).toBeGreaterThanOrEqual(0);
    expect(route).toBeGreaterThan(hero);
    expect(resources).toBeGreaterThan(route);
    expect(operations).toBeGreaterThan(resources);
    expect(home).toContain('title="Скрипты и шаблоны"');
    expect(home).toContain('description="Готовые тексты, файлы и чек-листы."');
    expect(home).toContain('secondaryLabel="Шаблоны и чек-листы"');
    expect(home).toContain('<span className="rr-route-arrow">→</span>');
    expect(home).not.toContain('<span className="rr-route-arrow">›</span>');
  });

  it("pins final standalone typography, focus treatment and route detail metrics", () => {
    const parity = read("src/app/recruit-reference-parity.css");

    expect(parity).toContain(
      'font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    );
    expect(parity).toContain(".rr-app button:focus-visible");
    expect(parity).toContain("outline:3px solid rgba(32,83,248,.28);outline-offset:2px");
    expect(parity).toContain(".rr-full-route-summary .rr-route-number{width:40px;height:40px}");
    expect(parity).toContain(".rr-material>span{min-width:0}");
    expect(parity).toContain(".rr-material strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}");
    expect(parity).toContain(".rr-template-card h3{margin:2px 0 7px}");
    expect(parity).toContain("@media(max-width:720px)");
    expect(parity).toContain(".rr-material strong{white-space:normal}");
  });

  it("does not let the scenarios desktop toolbar override the mobile breakpoint", () => {
    const parity = read("src/app/recruit-reference-parity.css");
    const catalog = read("src/components/recruit/ScenarioCatalog.tsx");

    expect(catalog).toContain('className="rr-toolbar rr-toolbar-scenarios"');
    expect(catalog).not.toContain('style={{ gridTemplateColumns: "1fr 260px" }}');
    expect(parity).toContain(".rr-toolbar-scenarios{grid-template-columns:minmax(0,1fr) 260px}");
    expect(parity).toContain(".rr-toolbar-scenarios>input,.rr-toolbar-scenarios>select{min-width:0;width:100%}");
    expect(parity).toContain("@media(max-width:900px)");
    expect(parity).toContain(".rr-toolbar-scenarios{grid-template-columns:minmax(0,1fr)}");
  });
});
