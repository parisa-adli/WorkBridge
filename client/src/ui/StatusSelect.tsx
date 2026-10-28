import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <RHFSelect
      name="status"
      label={t("common.changeStatus")}
      register={register}
      required
      options={options}
    />
  );
}
export default StatusSelect;
