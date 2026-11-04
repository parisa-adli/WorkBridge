import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function Loading({ className }: { className?: string }) {
  return (
    <div className="flex justify-center">
      <Spinner className={cn("size-6", className)} />
    </div>
  );
}

export default Loading;
