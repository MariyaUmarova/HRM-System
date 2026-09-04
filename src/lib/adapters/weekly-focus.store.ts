"use client";

import { createWeeklyFocusSeed } from "./weekly-focus.seed";
import type { HuntflowVacancyRef, WeeklyFocus, WeeklyFocusItem } from "./types";

const STORAGE_KEY = "ivideon_hr_hub_weekly_focus_v1";
const SERVER_SNAPSHOT = createWeeklyFocusSeed();
let cache: WeeklyFocus = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as WeeklyFocus;
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    }
  } catch {
    // Keep the in-memory seed if browser storage is unavailable.
  }
}

function writeFocus(next: WeeklyFocus) {
  cache = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The in-memory store remains usable even when browser storage is blocked.
    }
  }
  listeners.forEach((listener) => listener());
}

export function subscribeWeeklyFocus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWeeklyFocusSnapshot(): WeeklyFocus {
  ensureHydrated();
  return cache;
}

export function getWeeklyFocusServerSnapshot(): WeeklyFocus {
  return SERVER_SNAPSHOT;
}

export interface WeeklyFocusDraft {
  id?: string;
  title: string;
  priorityNote: string;
  ownerRecruiterId: string;
  vacancyRef: HuntflowVacancyRef;
}

export function upsertWeeklyFocusItem(draft: WeeklyFocusDraft): WeeklyFocusItem {
  const current = getWeeklyFocusSnapshot();
  const id = draft.id ?? `focus-${Date.now()}-${current.items.length + 1}`;
  const item: WeeklyFocusItem = {
    id,
    title: draft.title.trim(),
    priorityNote: draft.priorityNote.trim(),
    ownerRecruiterId: draft.ownerRecruiterId,
    vacancyRef: {
      externalId: draft.vacancyRef.externalId.trim(),
      title: draft.vacancyRef.title.trim(),
      department: draft.vacancyRef.department.trim(),
      huntflowUrl: draft.vacancyRef.huntflowUrl.trim(),
    },
  };

  const exists = current.items.some((candidate) => candidate.id === id);
  writeFocus({
    ...current,
    items: exists
      ? current.items.map((candidate) => (candidate.id === id ? item : candidate))
      : [...current.items, item],
  });
  return item;
}

export function closeWeeklyFocusItem(id: string): void {
  const current = getWeeklyFocusSnapshot();
  writeFocus({ ...current, items: current.items.filter((item) => item.id !== id) });
}

export function __resetWeeklyFocusStoreForTests() {
  cache = createWeeklyFocusSeed();
  hydrated = false;
}
