/**
 * Indicador de carga con texto. El punto suspensivo es `…`, no `...`,
 * y el texto va en un `role="status"` para que se anuncie una sola vez.
 */
export function Spinner({ label = "Cargando" }: { label?: string }) {
  return (
    <span
      role="status"
      className="inline-flex items-center gap-2 text-sm text-ink-muted"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="h-4 w-4 animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="3"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span>{label}…</span>
    </span>
  );
}
