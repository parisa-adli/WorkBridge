import type { ComponentProps } from "react";
import Field, { controlClass, type FieldProps } from "./Field";

type TextareaProps = ComponentProps<"textarea"> & FieldProps;

function Textarea({ id, label, error, required, className = "", ...props }: TextareaProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => (
        <textarea {...props} {...control} className={`${controlClass} min-h-28 resize-y ${className}`} />
      )}
    </Field>
  );
}
export default Textarea;
