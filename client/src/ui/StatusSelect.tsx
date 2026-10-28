import type { UseFormRegister } from "react-hook-form";
import type { StatusInput } from "../schemas/status";
import { STATUS_BADGES } from "../constants";
import RHFSelect from "./RHFSelect";

const options = Object.entries(STATUS_BADGES).map(([value, { label }]) => ({
  value: Number(value),
  label,
}));

function StatusSelect({
  register,
}: {
  register: UseFormRegister<StatusInput>;
}) {
  return (
    <RHFSelect
      name="status"
      label="تغییر وضعیت"
      register={register}
      required
      options={options}
    />
  );
}
export default StatusSelect;
