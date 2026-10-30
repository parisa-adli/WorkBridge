import type { ComponentProps } from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import Field, { type FieldProps } from "./Field";

export type SelectOption = { value: string | number; label: string };

type SelectProps = FieldProps & {
  id?: string;
  required?: boolean;
  options: SelectOption[];
  value?: string | number;
  onValueChange: (value: string) => void;
} & Pick<ComponentProps<typeof SelectTrigger>, "onBlur" | "ref"> &
  Pick<ComponentProps<typeof ShadcnSelect>, "name" | "disabled">;

// Radix forbids an item with value "", so the empty option (e.g. "no parent") travels under this stand-in.
const EMPTY = "__empty__";

export default function Select({
  id,
  label,
  error,
  required,
  options,
  value,
  onValueChange,
  onBlur,
  ref,
  ...props
}: SelectProps) {
  const { t } = useTranslation();
  const hasEmpty = options.some((item) => String(item.value) === "");
  return (
    <Field id={id} label={label} error={error} required={required}>
      {(control) => (
        <ShadcnSelect
          {...props}
          // no empty option: "" shows the placeholder (the native select silently took the first option)
          value={String(value ?? "") || (hasEmpty ? EMPTY : "")}
          onValueChange={(next) => onValueChange(next === EMPTY ? "" : next)}
        >
          <SelectTrigger {...control} ref={ref} onBlur={onBlur} className="w-full">
            <SelectValue placeholder={t("common.select")} />
          </SelectTrigger>
          <SelectContent>
            {options.map((item) => (
              <SelectItem key={item.value} value={String(item.value) || EMPTY}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </ShadcnSelect>
      )}
    </Field>
  );
}
