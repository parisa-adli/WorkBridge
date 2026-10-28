import type { ChangeEventHandler } from "react";
import type { SelectOption } from "./RHFSelect";

type SelectProps = {
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption[];
};

export default function Select({ value, onChange, options }: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="textField__input py-2 text-xs bg-secondary-0"
    >
      {options.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
