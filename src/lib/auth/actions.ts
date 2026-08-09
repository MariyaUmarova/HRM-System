"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PREVIEW_ROLE_COOKIE, parseRole } from "./roles";

const DEMO_CUSTOMER_TOKEN = "demo-token-genstoret";

/** Dev-only: sets the preview role cookie and lands the user on the right shell. */
export async function setPreviewRole(formData: FormData) {
  const role = parseRole(formData.get("role")?.toString());
  const store = await cookies();
  store.set(PREVIEW_ROLE_COOKIE, role, { path: "/", sameSite: "lax" });

  if (role === "customer") {
    redirect(`/c/${DEMO_CUSTOMER_TOKEN}`);
  }
  redirect("/");
}
