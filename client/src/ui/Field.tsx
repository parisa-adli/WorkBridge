import { useId, type ReactNode } from "react";
import { CircleAlert } from "lucide-react";

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

export const controlClass =
  "w-full min-h-11 rounded-md border border-border-strong bg-surface px-4 py-2.5 text-base text-text transition-colors placeholder:text-text-muted hover:border-text-muted focus-visible:border-primary aria-invalid:border-error disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted";

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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-text">
        {label}
        {required && (
          <span aria-hidden="true" className="ms-0.5 text-error">
            *
          </span>
        )}
      </label>
      {children({
        id: fieldId,
        "aria-required": required || undefined,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm text-error">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
export default Field;
