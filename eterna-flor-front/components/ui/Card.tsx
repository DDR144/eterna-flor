import type { ReactNode } from "react";

/**
 * Compound component: la jerarquía la da la composición, no los booleanos
 * (`elevated`, `bordered`, `compact`). Un solo radio y una sola sombra
 * —ninguna— para todas las tarjetas: la jerarquía se expresa con tipografía
 * y espaciado, no con cinco variantes del mismo gris.
 */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lush border border-line bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
      <div>
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
      {children}
    </div>
  );
}
