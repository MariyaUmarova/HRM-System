import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { getPreviewRole } from "@/lib/auth/session";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const role = await getPreviewRole();
  return <AppShell role={role}>{children}</AppShell>;
}
