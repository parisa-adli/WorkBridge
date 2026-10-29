import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import Field, { controlClass, type FieldProps } from "./Field";

type InputProps = ComponentProps<"input"> & FieldProps;

function Input({ id, label, error, required, className, ...props }: InputProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => <input data-slot="input" {...props} {...control} className={cn(controlClass, className)} />}
    </Field>
  );
}
export default Input;
