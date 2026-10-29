import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import Field, { controlClass, type FieldProps } from "./Field";

type TextareaProps = ComponentProps<"textarea"> & FieldProps;

function Textarea({ id, label, error, required, className, ...props }: TextareaProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => (
        <textarea
          data-slot="textarea"
          {...props}
          {...control}
          className={cn(controlClass, "min-h-28 resize-y", className)}
        />
      )}
    </Field>
  );
}
export default Textarea;
