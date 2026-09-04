import { NextResponse } from "next/server";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { getEmbeddedTemplateDownload } from "@/lib/recruit-content/template-download";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return new NextResponse("Forbidden", { status: 403 });

  const { id } = await context.params;
  const file = getEmbeddedTemplateDownload(id);
  if (!file) return new NextResponse("Template file is not available", { status: 404 });

  return new NextResponse(new Uint8Array(file.bytes), {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.fileName}"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
