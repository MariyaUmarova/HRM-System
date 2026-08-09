import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HelpTooltip } from "@/components/ui/HelpTooltip";

function renderTooltip() {
  return render(
    <HelpTooltip label="Пояснение к SLA">Срок считается в рабочих днях.</HelpTooltip>,
  );
}

/**
 * jsdom does not implement the `PointerEvent` constructor, so
 * @testing-library/dom's `fireEvent.pointerOver(el, { pointerType })` silently
 * drops `pointerType` (it falls back to the plain `Event` constructor, which
 * ignores unknown init properties). Dispatching a plain Event and attaching
 * `pointerType` directly is the reliable way to exercise pointerType-aware
 * handlers under jsdom.
 */
function firePointerEvent(target: Element, type: string, pointerType: "mouse" | "touch") {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  fireEvent(target, event);
}

describe("HelpTooltip", () => {
  it("is closed by default", () => {
    renderTooltip();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("desktop: opens on mouse hover and closes on pointer leave", () => {
    renderTooltip();
    const trigger = screen.getByRole("button", { name: "Пояснение к SLA" });

    firePointerEvent(trigger, "pointerover", "mouse");
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    firePointerEvent(trigger, "pointerout", "mouse");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("keyboard: opens on focus and closes on blur", () => {
    renderTooltip();
    const trigger = screen.getByRole("button", { name: "Пояснение к SLA" });

    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("mobile: opens on tap and closes on outside tap", () => {
    renderTooltip();
    const trigger = screen.getByRole("button", { name: "Пояснение к SLA" });

    firePointerEvent(trigger, "pointerdown", "touch");
    fireEvent.click(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    firePointerEvent(document.body, "pointerdown", "touch");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("mobile: tapping the trigger again closes it", () => {
    renderTooltip();
    const trigger = screen.getByRole("button", { name: "Пояснение к SLA" });

    firePointerEvent(trigger, "pointerdown", "touch");
    fireEvent.click(trigger);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    firePointerEvent(trigger, "pointerdown", "touch");
    fireEvent.click(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    renderTooltip();
    const trigger = screen.getByRole("button", { name: "Пояснение к SLA" });

    firePointerEvent(trigger, "pointerover", "mouse");
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not hide the essential content of the trigger's task — it is supplementary only", () => {
    renderTooltip();
    // The trigger itself must have an accessible name independent of the tooltip content,
    // so critical instructions are never hidden exclusively inside the popover.
    expect(screen.getByRole("button", { name: "Пояснение к SLA" })).toBeInTheDocument();
  });
});
