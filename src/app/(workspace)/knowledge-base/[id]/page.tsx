import { notFound } from "next/navigation";
import { AccessDenied } from "@/components/access/AccessDenied";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { KnowledgeItemDetail } from "@/components/knowledge-base/KnowledgeItemDetail";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { getKnowledgeItem, KNOWLEDGE_ITEMS } from "@/lib/knowledge-base/data";

export function generateStaticParams() {
  return KNOWLEDGE_ITEMS.map((i) => ({ id: i.id }));
}

export default async function KnowledgeItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const item = getKnowledgeItem(id);
  if (!item) notFound();

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Моя работа", href: "/" },
          { label: "База знаний", href: "/knowledge-base" },
          { label: item.title },
        ]}
      />
      <KnowledgeItemDetail item={item} />
    </div>
  );
}
