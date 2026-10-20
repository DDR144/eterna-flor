import type { ComponentProps } from "react";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary: "bg-blossom text-ink hover:bg-blossom-deep active:scale-[0.98]",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-petal",
  ghost: "text-ink-muted hover:bg-petal hover:text-ink",
  danger: "border border-danger/40 bg-surface text-danger hover:bg-danger/5",
} as const;

const sizes = {
  sm: "h-9 rounded-tight px-3 text-sm",
  md: "h-11 rounded-soft px-5 text-sm",
  icon: "h-9 w-9 rounded-tight",
} as const;

interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

/**
 * `size="icon"` exige un `aria-label`: sin texto visible, es la única
 * forma de que un lector de pantalla anuncie la acción.
 */
export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
