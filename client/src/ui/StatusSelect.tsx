import type { UseFormRegister } from "react-hook-form";
import type { Status } from "../types/api";
import { STATUS_BADGES } from "../constants";
import RHFSelect from "./RHFSelect";

const options = Object.entries(STATUS_BADGES).map(([value, { label }]) => ({
  value: Number(value),
  label,
}));

function StatusSelect({
  register,
}: {
  register: UseFormRegister<{ status: Status }>;
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
