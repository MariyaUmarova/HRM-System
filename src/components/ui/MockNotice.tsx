export function MockNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-brand/40 bg-brand-tint px-4 py-3 text-sm text-brand-dark">
      <strong className="font-semibold">Что здесь замокано: </strong>
      {children}
    </div>
  );
}
