import type { ReactNode } from "react";

/**
 * Estado vacío sin emoji: una frase que orienta y, si se puede actuar,
 * la acción al lado. `role="status"` para que el cambio se anuncie.
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-lush border border-dashed border-line-strong px-6 py-16 text-center"
    >
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
