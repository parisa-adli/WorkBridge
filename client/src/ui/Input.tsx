import type { ComponentProps } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import Field, { type FieldProps } from "./Field";

type InputProps = ComponentProps<"input"> & FieldProps;

function Input({ id, label, error, required, ...props }: InputProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => <ShadcnInput {...props} {...control} />}
    </Field>
  );
}
export default Input;
