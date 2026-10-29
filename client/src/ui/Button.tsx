import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Also styles links that look like buttons: <Link className={buttonClass()}>.
export const buttonClass = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        secondary: "bg-surface-muted text-text border-border hover:border-border-strong",
        outline: "text-text border-border-strong hover:bg-surface-muted",
        danger: "text-error border-error hover:bg-error-soft",
        ghost: "text-primary hover:bg-primary-soft",
      },
      size: {
        md: "min-h-11 px-4 py-2.5 text-base",
        sm: "min-h-9 px-3 py-1.5 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonClass>;

function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button data-slot="button" type={type} className={cn(buttonClass({ variant, size }), className)} {...props} />;
}
export default Button;
