import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "md" | "sm" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-surface-muted text-text border-border hover:border-border-strong",
  outline: "text-text border-border-strong hover:bg-surface-muted",
  danger: "text-error border-error hover:bg-error-soft",
  ghost: "text-primary hover:bg-primary-soft",
};

const SIZES: Record<Size, string> = {
  md: "min-h-11 px-4 py-2.5 text-base",
  sm: "min-h-9 px-3 py-1.5 text-sm",
  icon: "h-9 w-9",
};

// Also styles links that look like buttons: <Link className={buttonClass()}>.
export function buttonClass({ variant = "primary", size = "md" }: { variant?: Variant; size?: Size } = {}) {
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]}`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

function Button({ variant, size, className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${buttonClass({ variant, size })} ${className}`} {...props} />;
}
export default Button;
