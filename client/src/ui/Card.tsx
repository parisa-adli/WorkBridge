import type { ComponentProps } from "react";

function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-lg border border-border bg-surface p-4 text-text md:p-6 ${className}`} {...props} />;
}
export default Card;
