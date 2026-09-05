import { NextRequest, NextResponse } from "next/server";
import { PREVIEW_ROLE_COOKIE, ROLES, type Role } from "@/lib/auth/roles";

export async function GET(request: NextRequest, context: { params: Promise<{ role: string }> }) {
  const { role } = await context.params;
  if (!(ROLES as readonly string[]).includes(role)) {
    return new NextResponse("Unknown UAT role", { status: 404 });
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/uat-review", origin));
  response.cookies.set(PREVIEW_ROLE_COOKIE, role as Role, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return response;
}
