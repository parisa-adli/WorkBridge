function RadioInput({
  label,
  name,
  id,
  value,
  register,
  checked,
  validationSchema,
  errors,
  watch,
}) {
  return (
    <div className="flex items-center text-secondary-600 gap-x-2">
      <input
        className="form-radio h-5 w-5 text-primary-900 focus:ring-0 focus:ring-offset-0"
        type="radio"
        name={name}
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
