import type { ComponentProps } from "react";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import Field, { type FieldProps } from "./Field";

type TextareaProps = ComponentProps<"textarea"> & FieldProps;

function Textarea({ id, label, error, required, ...props }: TextareaProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => <ShadcnTextarea {...props} {...control} />}
    </Field>
  );
}
export default Textarea;
