import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { MockNotice } from "@/components/ui/MockNotice";

export function PlaceholderScreen({
  breadcrumbs,
  title,
  description,
  mocked,
  children,
}: {
  breadcrumbs: Crumb[];
  title: string;
  description: string;
  mocked: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      <div className="mt-4 max-w-2xl">
        <MockNotice>{mocked}</MockNotice>
      </div>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
