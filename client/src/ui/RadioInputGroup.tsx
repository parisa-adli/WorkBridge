import type { FieldErrors, FieldValues } from "react-hook-form";
import RadioInput, { type RadioInputProps } from "./RadioInput";

type RadioInputGroupProps<T extends FieldValues> = Pick<
  RadioInputProps<T>,
  "register" | "watch"
> & {
  errors?: FieldErrors<T>;
  configs: Pick<RadioInputProps<T>, "name" | "validationSchema"> & {
    options: { value: string; label: string }[];
  };
};

function RadioInputGroup<T extends FieldValues>({
  register,
  watch,
  errors,
  configs,
}: RadioInputGroupProps<T>) {
  const { name, validationSchema = {}, options } = configs;

  return (
    <div>
      <div className="flex items-center justify-center gap-x-10">
        {options.map(({ value, label }) => (
          <RadioInput
            key={value}
            label={label}
            value={value}
            id={value}
            name={name}
            register={register}
            watch={watch}
            validationSchema={validationSchema}
          />
        ))}
      </div>
      {errors && errors[name] && (
        <span className="text-error block text-sm mt-2">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
}
export default RadioInputGroup;
