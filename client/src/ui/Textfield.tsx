import type {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

type TextfieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  validationSchema?: RegisterOptions<T, Path<T>>;
  type?: string;
  required?: boolean;
  errors?: FieldErrors<T>;
};

function Textfield<T extends FieldValues>({
  label,
  name,
  register,
  validationSchema,
  type = "text",
  required,
  errors,
}: TextfieldProps<T>) {
  // console.log(register(name));
  return (
    <div>
      <label className="mb-2 block text-secondary-700" htmlFor={name}>
        {label} {required && <span className="text-error">*</span>}
      </label>
      <input
        {...register(name, validationSchema)}
        id={name}
        className="textField__input"
        type={type}
        autoComplete="off"
      />
      {errors && errors[name] && (
        <span className="text-error block text-sm mt-2">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
}

export default Textfield;
