"use client";

import { RECRUITERS } from "./seed";
import { createWeeklyFocusSeed } from "./weekly-focus.seed";
import type { HuntflowVacancyRef, WeeklyFocus, WeeklyFocusItem } from "./types";

const STORAGE_KEY = "ivideon_hr_hub_weekly_focus_v1";
const SERVER_SNAPSHOT = createWeeklyFocusSeed();
let cache: WeeklyFocus = SERVER_SNAPSHOT;
let hydrated = false;
const listeners = new Set<() => void>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAllowedHuntflowUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return (
      host === "huntflow.example" ||
      host === "huntflow.ru" ||
      host.endsWith(".huntflow.ru") ||
      host === "huntflow.kz" ||
      host.endsWith(".huntflow.kz") ||
      host === "huntflow.uz" ||
      host.endsWith(".huntflow.uz")
    );
  } catch {
    return false;
  }
}

function isSafeItem(value: unknown): value is WeeklyFocusItem {
  if (!isRecord(value) || !isRecord(value.vacancyRef)) return false;
  const vacancy = value.vacancyRef;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.priorityNote === "string" &&
    typeof value.ownerRecruiterId === "string" &&
    RECRUITERS.some((recruiter) => recruiter.id === value.ownerRecruiterId) &&
    typeof vacancy.externalId === "string" &&
    typeof vacancy.title === "string" &&
    typeof vacancy.department === "string" &&
    typeof vacancy.huntflowUrl === "string" &&
    isAllowedHuntflowUrl(vacancy.huntflowUrl)
  );
}

function readStoredFocus(raw: string, currentWeek: WeeklyFocus): WeeklyFocus | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.items)) return null;
    if (parsed.rangeStart !== currentWeek.rangeStart || parsed.rangeEnd !== currentWeek.rangeEnd) return null;
    if (!parsed.items.every(isSafeItem)) return null;
    return {
      rangeStart: currentWeek.rangeStart,
      rangeEnd: currentWeek.rangeEnd,
      items: parsed.items,
    };
  } catch {
    return null;
  }
}

function persist(next: WeeklyFocus) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The in-memory store remains usable even when browser storage is blocked.
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const currentWeek = createWeeklyFocusSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const stored = raw ? readStoredFocus(raw, currentWeek) : null;
    cache = stored ?? currentWeek;
    if (!stored) persist(cache);
  } catch {
    cache = currentWeek;
  }
}

function writeFocus(next: WeeklyFocus) {
  cache = next;
  persist(next);
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

function assertSafeDraft(draft: WeeklyFocusDraft) {
  if (!draft.title.trim() || !draft.priorityNote.trim()) throw new Error("Weekly focus text is required");
  if (!RECRUITERS.some((recruiter) => recruiter.id === draft.ownerRecruiterId)) throw new Error("Unknown recruiter");
  if (!draft.vacancyRef.externalId.trim() || !draft.vacancyRef.title.trim()) throw new Error("Huntflow reference is required");
  if (!isAllowedHuntflowUrl(draft.vacancyRef.huntflowUrl)) throw new Error("Unsafe Huntflow URL");
}

export function upsertWeeklyFocusItem(draft: WeeklyFocusDraft): WeeklyFocusItem {
  assertSafeDraft(draft);
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
