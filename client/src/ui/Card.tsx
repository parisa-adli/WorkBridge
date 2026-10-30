import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Card as ShadcnCard } from "@/components/ui/card";

// Callers put their content straight in the card, so it gets CardContent's px-6 itself.
function Card({ className, ...props }: ComponentProps<"div">) {
  return <ShadcnCard className={cn("px-6", className)} {...props} />;
}
export default Card;
