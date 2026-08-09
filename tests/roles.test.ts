import { describe, expect, it } from "vitest";
import { canAccess, homeAreaFor, isManagementRole, MANAGEMENT_ROLES, type AppArea, type Role } from "@/lib/auth/roles";
import { checkAccess } from "@/lib/auth/require-role";

const ROLES: Role[] = ["recruiter", "head_of_recruitment", "hrd", "customer"];
const AREAS: AppArea[] = [
  "recruiter_home",
  "management_home",
  "workflow",
  "knowledge_base",
  "offer_center",
  "interview_analysis",
  "hr_radar",
  "requests_inbox",
  "platform_management",
];

describe("role visibility matrix", () => {
  it("Head of Recruitment and HRD always have identical area access (no separate Admin role)", () => {
    for (const area of AREAS) {
      expect(canAccess("head_of_recruitment", area)).toBe(canAccess("hrd", area));
    }
    expect(MANAGEMENT_ROLES).toEqual(["head_of_recruitment", "hrd"]);
  });

  it("recruiter cannot access management-only screens", () => {
    expect(canAccess("recruiter", "requests_inbox")).toBe(false);
    expect(canAccess("recruiter", "platform_management")).toBe(false);
    expect(canAccess("recruiter", "management_home")).toBe(false);
  });

  it("recruiter can access their own daily-work screens", () => {
    expect(canAccess("recruiter", "recruiter_home")).toBe(true);
    expect(canAccess("recruiter", "workflow")).toBe(true);
    expect(canAccess("recruiter", "knowledge_base")).toBe(true);
    expect(canAccess("recruiter", "offer_center")).toBe(true);
    expect(canAccess("recruiter", "interview_analysis")).toBe(true);
    expect(canAccess("recruiter", "hr_radar")).toBe(true);
  });

  it("Head of Recruitment / HRD can access requests inbox and platform management", () => {
    for (const role of MANAGEMENT_ROLES) {
      expect(canAccess(role, "requests_inbox")).toBe(true);
      expect(canAccess(role, "platform_management")).toBe(true);
      expect(canAccess(role, "management_home")).toBe(true);
      expect(canAccess(role, "recruiter_home")).toBe(false);
    }
  });

  it("customer has zero access to every internal area", () => {
    for (const area of AREAS) {
      expect(canAccess("customer", area), `customer should not access ${area}`).toBe(false);
    }
  });

  it("isManagementRole matches MANAGEMENT_ROLES for every role", () => {
    for (const role of ROLES) {
      expect(isManagementRole(role)).toBe(MANAGEMENT_ROLES.includes(role));
    }
  });

  it("homeAreaFor routes recruiter to recruiter_home and leads to management_home", () => {
    expect(homeAreaFor("recruiter")).toBe("recruiter_home");
    expect(homeAreaFor("head_of_recruitment")).toBe("management_home");
    expect(homeAreaFor("hrd")).toBe("management_home");
  });

  it("checkAccess mirrors canAccess and always returns a human-readable required role label", () => {
    for (const role of ROLES) {
      for (const area of AREAS) {
        const gate = checkAccess(role, area);
        expect(gate.allowed).toBe(canAccess(role, area));
        expect(gate.requiredRoleLabel.length).toBeGreaterThan(0);
      }
    }
  });
});
