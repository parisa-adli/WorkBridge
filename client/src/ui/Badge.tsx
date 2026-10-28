import type { ReactNode } from "react";

type Variant = "primary" | "success" | "warning" | "error" | "neutral";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error",
  neutral: "bg-surface-muted text-text-muted",
};

// Status is never color-only: a badge always carries text (docs/design.md §6).
function Badge({ variant = "neutral", children }: { variant?: Variant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 py-0.5 text-xs font-medium before:h-1.5 before:w-1.5 before:rounded-full before:bg-current ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
export default Badge;
