import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import Select, { type SelectOption } from "./Select";

type RHFSelectProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  options: SelectOption[];
  required?: boolean;
};

// The shadcn Select is not a native <select>, so it joins the form through Controller instead of register.
function RHFSelect<T extends FieldValues>({ label, name, control, options, required }: RHFSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Select
          label={label}
          required={required}
          options={options}
          name={field.name}
          value={field.value ?? ""}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
          disabled={field.disabled}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
export default RHFSelect;
