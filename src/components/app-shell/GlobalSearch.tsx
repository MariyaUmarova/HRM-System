"use client";

import { useEffect, useRef } from "react";

export function GlobalSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <form className="rr-searchbox" action="/search" role="search">
      <span aria-hidden="true">⌕</span>
      <input
        ref={inputRef}
        aria-label="Глобальный поиск"
        name="q"
        placeholder="Найти инструкцию, скрипт или шаблон"
        type="search"
      />
      <kbd>Ctrl K</kbd>
    </form>
  );
}
