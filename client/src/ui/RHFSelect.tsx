import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

export type SelectOption = { value: string | number; label: string };

type RHFSelectProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  options: SelectOption[];
  required?: boolean;
};

function RHFSelect<T extends FieldValues>({
  label,
  name,
  register,
  options,
  required,
}: RHFSelectProps<T>) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-secondary-700">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <select
        {...register(name)}
        id={name}
        className="textField__input"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
export default RHFSelect;
