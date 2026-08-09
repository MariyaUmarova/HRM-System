import { cookies } from "next/headers";
import { DEFAULT_ROLE, PREVIEW_ROLE_COOKIE, parseRole, type Role } from "./roles";

/** Reads the development-only preview role from the request cookie. Server-only. */
export async function getPreviewRole(): Promise<Role> {
  const store = await cookies();
  return parseRole(store.get(PREVIEW_ROLE_COOKIE)?.value ?? DEFAULT_ROLE);
}
