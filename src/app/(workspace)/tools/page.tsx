import Link from "next/link";
import { AccessDenied } from "@/components/access/AccessDenied";
import { checkAccess } from "@/lib/auth/require-role";
import { getPreviewRole } from "@/lib/auth/session";
import { contentHref } from "@/lib/recruit-content/links";
import { getRecruitContent } from "@/lib/recruit-content/source";

export default async function ToolsPage() {
  const role = await getPreviewRole();
  const gate = checkAccess(role, "knowledge_base");
  if (!gate.allowed) return <AccessDenied requiredRoleLabel={gate.requiredRoleLabel} />;

  const { tools } = getRecruitContent();
  return (
    <div>
      <div className="rr-page-head">
        <div>
          <div className="rr-eyebrow rr-eyebrow-blue">Сделать прямо сейчас</div>
          <h1>Интерактивные помощники</h1>
          <p>Ответьте на несколько вопросов и получите готовый текст или проверку готовности. ИИ-анализ интервью уже умеет выполнять локальный предварительный анализ; подключение корпоративного AI сделает оценку глубже.</p>
        </div>
      </div>

      <div className="rr-grid rr-grid-4">
        {tools.map((tool) => (
          <article className="rr-card rr-tool-card" key={tool.id}>
            <div className="rr-tool-icon" aria-hidden="true">{tool.icon ?? "✦"}</div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
            <Link className="rr-btn rr-btn-secondary" href={contentHref({ kind: "tool", id: tool.id })}>
              {tool.buttonLabel ?? "Открыть"}
            </Link>
          </article>
        ))}
      </div>

      <div className="rr-callout" style={{ marginTop: 20 }}>
        <strong>Важно:</strong> помощники используют рабочие компоненты HR Hub. Анализ интервью остаётся предварительным и требует проверки рекрутером; конструктор оффера генерирует файлы в браузере и не отправляет их автоматически.
      </div>
    </div>
  );
}
