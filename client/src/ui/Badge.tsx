import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const badgeClass = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 py-0.5 text-xs font-medium before:h-1.5 before:w-1.5 before:rounded-full before:bg-current",
  {
    variants: {
      variant: {
        primary: "bg-primary-soft text-primary",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        error: "bg-error-soft text-error",
        neutral: "bg-surface-muted text-text-muted",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

// Status is never color-only: a badge always carries text (docs/design.md §6).
function Badge({ variant, children }: VariantProps<typeof badgeClass> & { children: ReactNode }) {
  return (
    <span data-slot="badge" className={badgeClass({ variant })}>
      {children}
    </span>
  );
}
export default Badge;
