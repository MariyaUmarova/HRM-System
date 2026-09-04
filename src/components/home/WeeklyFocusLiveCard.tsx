"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getWeeklyFocusServerSnapshot,
  getWeeklyFocusSnapshot,
  subscribeWeeklyFocus,
} from "@/lib/adapters/weekly-focus.store";
import { WeeklyFocusCard } from "./WeeklyFocusCard";

export function WeeklyFocusLiveCard({
  recruiterId,
  showOwner = false,
}: {
  recruiterId?: string;
  showOwner?: boolean;
}) {
  const focus = useSyncExternalStore(
    subscribeWeeklyFocus,
    getWeeklyFocusSnapshot,
    getWeeklyFocusServerSnapshot,
  );

  const visibleFocus = useMemo(
    () =>
      recruiterId
        ? { ...focus, items: focus.items.filter((item) => item.ownerRecruiterId === recruiterId) }
        : focus,
    [focus, recruiterId],
  );

  return <WeeklyFocusCard focus={visibleFocus} showOwner={showOwner} />;
}
