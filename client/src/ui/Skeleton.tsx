import { Skeleton as ShadcnSkeleton } from "@/components/ui/skeleton";

// A loading placeholder; size it with className (e.g. "h-4 w-32"). The list around it sets aria-busy.
function Skeleton({ className = "h-3.5 w-full" }: { className?: string }) {
  return <ShadcnSkeleton aria-hidden="true" className={className} />;
}
export default Skeleton;
