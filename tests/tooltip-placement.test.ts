import { describe, expect, it } from "vitest";
import { computeTooltipPlacement } from "@/lib/ui/tooltip-placement";

describe("computeTooltipPlacement", () => {
  const viewport = { width: 1200, height: 800 };

  it("opens below and left-aligned when there is plenty of room", () => {
    const rect = { top: 100, bottom: 120, left: 100, right: 120 };
    const placement = computeTooltipPlacement(rect, viewport);
    expect(placement).toEqual({ vertical: "bottom", horizontal: "left" });
  });

  it("flips to open above when there is not enough space below", () => {
    const rect = { top: 780, bottom: 795, left: 100, right: 120 };
    const placement = computeTooltipPlacement(rect, viewport);
    expect(placement.vertical).toBe("top");
  });

  it("flips to right-aligned when the trigger is near the right edge", () => {
    const rect = { top: 100, bottom: 120, left: 1150, right: 1170 };
    const placement = computeTooltipPlacement(rect, viewport);
    expect(placement.horizontal).toBe("right");
  });

  it("stays within a small mobile viewport (320px wide)", () => {
    const mobileViewport = { width: 320, height: 640 };
    const rect = { top: 10, bottom: 30, left: 280, right: 300 };
    const placement = computeTooltipPlacement(rect, mobileViewport);
    expect(placement.horizontal).toBe("right");
  });
});
