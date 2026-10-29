import type {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

export type RadioInputProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  id: string;
  value: string;
  register: UseFormRegister<T>;
  validationSchema?: RegisterOptions<T, Path<T>>;
  watch: UseFormWatch<T>;
};

function RadioInput<T extends FieldValues>({
  label,
  name,
  id,
  value,
  register,
  validationSchema,
  watch,
}: RadioInputProps<T>) {
  return (
    <div className="flex items-center text-secondary-600 gap-x-2">
      <input
        className="form-radio h-5 w-5 border-input text-primary-900 not-checked:bg-transparent focus:ring-0 focus:ring-offset-0"
        type="radio"
        value={value}
        id={id}
        {...register(name, validationSchema)}
        checked={watch(name) === value}
      />
      <label htmlFor={id}>{label}</label>
       </div>
  );
}
export default RadioInput;
