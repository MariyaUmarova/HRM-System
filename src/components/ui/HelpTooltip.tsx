"use client";

import { useEffect, useId, useRef, useState } from "react";
import { computeTooltipPlacement, type TooltipPlacement } from "@/lib/ui/tooltip-placement";

interface HelpTooltipProps {
  /** Accessible label announced for the trigger, e.g. "Пояснение к SLA" */
  label: string;
  children: React.ReactNode;
}

/**
 * Shared `?` contextual help control.
 * Desktop: opens on mouse hover while the pointer stays on the trigger, closes on
 * pointer leave. Keyboard: opens on focus, closes on blur. Mobile: opens on tap,
 * closes on outside tap. Escape always closes. Placement flips near viewport edges.
 */
export function HelpTooltip({ label, children }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<TooltipPlacement>({ vertical: "bottom", horizontal: "left" });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastPointerType = useRef<string>("mouse");
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPlacement(
      computeTooltipPlacement(rect, { width: window.innerWidth, height: window.innerHeight }),
    );
  }, [open]);

  return (
    <span className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        aria-label={label}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-semibold text-muted hover:border-brand hover:text-brand"
        onPointerDown={(e) => {
          lastPointerType.current = e.pointerType;
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          if (lastPointerType.current !== "mouse") setOpen((v) => !v);
        }}
      >
        ?
      </button>
      {open && (
        <div
          ref={panelRef}
          role="tooltip"
          id={id}
          className={`absolute z-30 w-64 max-w-[80vw] rounded-lg border border-border bg-surface p-3 text-sm leading-snug text-foreground shadow-lg ${
            placement.vertical === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          } ${placement.horizontal === "left" ? "left-0" : "right-0"}`}
        >
          {children}
        </div>
      )}
    </span>
  );
}
