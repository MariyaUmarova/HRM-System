import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("preserved HR Hub modules remain discoverable", () => {
  it("keeps Offer Center visible from both recruiter and management home", () => {
    const recruiterHome = read("src/components/home/RecruiterHome.tsx");
    const leadHome = read("src/components/home/LeadHome.tsx");

    for (const source of [recruiterHome, leadHome]) {
      expect(source).toContain('href="/offer-center"');
      expect(source).toContain("Центр офферов");
    }
  });

  it("keeps customer-request entry points visible only in management home", () => {
    const recruiterHome = read("src/components/home/RecruiterHome.tsx");
    const leadHome = read("src/components/home/LeadHome.tsx");

    expect(leadHome).toContain("Новые заявки заказчиков");
    expect(leadHome).toContain('href="/requests"');
    expect(leadHome).toContain("Все заявки заказчиков");

    expect(recruiterHome).not.toContain('href="/requests"');
    expect(recruiterHome).not.toContain("Все заявки заказчиков");
  });

  it("keeps platform management as the management-only gear entry", () => {
    const shell = read("src/components/app-shell/AppShell.tsx");

    expect(shell).toContain('href="/platform-management"');
    expect(shell).toContain('aria-label="Управление платформой"');
    expect(shell).toContain("isManagementRole(role)");
  });
});
