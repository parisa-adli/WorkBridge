import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";

export type FieldProps = {
  label: string;
  error?: string;
};

type ControlProps = {
  id: string;
  "aria-required"?: true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

// A native <select> styled like shadcn's SelectTrigger until Phase 39d; options get the popover colors so dark mode stays readable.
export const selectClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40 [&_option]:bg-popover [&_option]:text-popover-foreground";

// Label, error and their ids for one form control (docs/design.md §6: visible label, error linked by aria-describedby).
function Field({
  id,
  label,
  error,
  required,
  children,
}: FieldProps & { id?: string; required?: boolean; children: (control: ControlProps) => ReactNode }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={fieldId}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children({
        id: fieldId,
        "aria-required": required || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
export default Field;
