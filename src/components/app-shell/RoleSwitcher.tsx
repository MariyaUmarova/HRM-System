"use client";

import { setPreviewRole } from "@/lib/auth/actions";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/roles";

export function RoleSwitcher({ role }: { role: Role }) {
  return (
    <form action={setPreviewRole} className="flex min-w-0 items-center gap-1 sm:gap-2">
      <label htmlFor="preview-role" className="hidden whitespace-nowrap text-xs font-medium text-muted sm:inline">
        Предпросмотр роли (dev)
      </label>
      <select
        id="preview-role"
        name="role"
        defaultValue={role}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="w-28 min-w-0 rounded-md border border-border bg-surface px-2 py-1.5 text-sm text-foreground sm:w-auto"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </form>
  );
}
