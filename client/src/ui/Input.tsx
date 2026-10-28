import type { ComponentProps } from "react";
import Field, { controlClass, type FieldProps } from "./Field";

type InputProps = ComponentProps<"input"> & FieldProps;

function Input({ id, label, error, required, className = "", ...props }: InputProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => <input {...props} {...control} className={`${controlClass} ${className}`} />}
    </Field>
  );
}
export default Input;
