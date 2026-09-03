"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Скопировать" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button className="rr-copy-btn" type="button" onClick={copy}>
      {copied ? "Скопировано" : label}
    </button>
  );
}
