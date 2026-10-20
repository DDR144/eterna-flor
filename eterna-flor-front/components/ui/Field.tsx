"use client";

import { cloneElement, useId } from "react";
import type { ComponentProps, ReactElement } from "react";

const control =
  "w-full rounded-tight border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink transition-colors duration-150 placeholder:text-ink-muted/60 focus-visible:border-blossom focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blossom aria-invalid:border-danger aria-invalid:focus-visible:outline-danger";

interface ControlProps {
  id?: string;
  name?: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
}

interface FieldProps {
  /** Etiqueta visible. Nunca se sustituye por un placeholder. */
  label: string;
  /** Nombre del campo en el formulario; se inyecta en el control. */
  name: string;
  children: ReactElement<ControlProps>;
  hint?: string;
  error?: string;
  required?: boolean;
}

/**
 * Etiqueta, control y mensaje en una sola pieza: `htmlFor`/`id` se generan
 * juntos, y el error se anuncia con `role="alert"`. Es la corrección de raíz
 * de los 24 `<label>` sin `htmlFor` que tenía `app/admin`.
 */
export function Field({
  label,
  name,
  children,
  hint,
  error,
  required = false,
}: FieldProps) {
  const id = useId();
  const describedBy = hint || error ? `${id}-desc` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        ) : null}
      </label>
      {cloneElement(children, {
        id,
        name,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {error ? (
        <p id={describedBy} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={describedBy} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${control} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${control} ${className}`} {...props} />;
}
