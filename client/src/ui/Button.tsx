import type { ComponentProps } from "react";
import { Button as ShadcnButton, buttonVariants } from "@/components/ui/button";

// The Phase 29 variant and size names, mapped onto shadcn's.
const VARIANTS = { primary: "default", secondary: "secondary", outline: "outline", danger: "destructive", ghost: "ghost" } as const;
const SIZES = { md: "default", sm: "sm", icon: "icon" } as const;

type Look = { variant?: keyof typeof VARIANTS; size?: keyof typeof SIZES };

// Also styles links that look like buttons: <Link className={buttonClass()}>.
export function buttonClass({ variant = "primary", size = "md" }: Look = {}) {
  return buttonVariants({ variant: VARIANTS[variant], size: SIZES[size] });
}

type ButtonProps = ComponentProps<"button"> & Look;

function Button({ variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return <ShadcnButton type={type} variant={VARIANTS[variant]} size={SIZES[size]} {...props} />;
}
export default Button;
