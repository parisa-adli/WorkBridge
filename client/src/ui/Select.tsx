import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import Field, { selectClass, type FieldProps } from "./Field";
import type { SelectOption } from "./RHFSelect";

type SelectProps = ComponentProps<"select"> & FieldProps & { options: SelectOption[] };

// A native <select> on purpose (docs/design.md §9): styled like shadcn's Select trigger, keeps RHF register and the browser's own picker.
export default function Select({ id, label, error, required, options, className, ...props }: SelectProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => (
        <select data-slot="select" {...props} {...control} className={cn(selectClass, className)}>
          {options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
