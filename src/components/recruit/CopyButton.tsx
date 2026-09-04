"use client";

import { useState } from "react";

type CopyState = "idle" | "copied" | "failed";

export function CopyButton({ text, label = "Скопировать" }: { text: string; label?: string }) {
  const [state, setState] = useState<CopyState>("idle");

  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API is unavailable");
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 1600);
  }

  const buttonLabel = state === "copied" ? "Скопировано" : state === "failed" ? "Не удалось скопировать" : label;

  return (
    <button className="rr-copy-btn" type="button" onClick={copy} aria-live="polite">
      {buttonLabel}
    </button>
  );
}
