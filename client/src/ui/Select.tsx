import type { ComponentProps } from "react";
import Field, { controlClass, type FieldProps } from "./Field";
import type { SelectOption } from "./RHFSelect";

type SelectProps = ComponentProps<"select"> & FieldProps & { options: SelectOption[] };

export default function Select({ id, label, error, required, options, className = "", ...props }: SelectProps) {
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => (
        <select {...props} {...control} className={`${controlClass} ${className}`}>
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
