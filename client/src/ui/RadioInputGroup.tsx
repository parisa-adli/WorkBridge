import { useId } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type RadioInputGroupProps<T extends FieldValues> = {
  // the group's accessible name; the options carry the visible labels
  label: string;
  name: Path<T>;
  control: Control<T>;
  options: { value: string; label: string }[];
  // runs after the form value changes
  onValueChange?: (value: string) => void;
};

function RadioInputGroup<T extends FieldValues>({ label, name, control, options, onValueChange }: RadioInputGroupProps<T>) {
  const errorId = `${useId()}-error`;
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <RadioGroup
            name={field.name}
            value={field.value ?? ""}
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            aria-label={label}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="flex items-center justify-center gap-x-10"
          >
            {options.map(({ value, label }) => (
              <div key={value} className="flex items-center gap-x-2">
                {/* RHF focuses field.ref on a validation error, so it goes on the first radio */}
                <RadioGroupItem value={value} id={value} ref={value === options[0].value ? field.ref : undefined} />
                <Label htmlFor={value}>{label}</Label>
              </div>
            ))}
          </RadioGroup>
          {error && (
            <span id={errorId} role="alert" className="mt-2 block text-sm text-destructive">
              {error.message}
            </span>
          )}
        </div>
      )}
    />
  );
}
export default RadioInputGroup;
