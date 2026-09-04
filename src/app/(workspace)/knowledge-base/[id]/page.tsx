import { redirect } from "next/navigation";
import { referenceForId } from "@/lib/recruit-content/catalog";
import { contentHref } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";

export default async function LegacyKnowledgeItemRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reference = referenceForId(getRecruitContent(), id);
  redirect(reference ? contentHref(reference) : "/scenarios");
}
