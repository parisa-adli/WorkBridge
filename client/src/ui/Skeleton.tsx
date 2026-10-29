import { cn } from "@/lib/utils";

// A loading placeholder; size it with className (e.g. "h-4 w-32"). The list around it sets aria-busy.
function Skeleton({ className = "h-3.5 w-full" }: { className?: string }) {
  return <div data-slot="skeleton" aria-hidden="true" className={cn("animate-pulse rounded-sm bg-surface-muted", className)} />;
}
export default Skeleton;
