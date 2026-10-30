import { useTranslation } from "react-i18next";
import type { Control } from "react-hook-form";
import type { StatusInput } from "../schemas/status";
import { STATUS_BADGES } from "../constants";
import RHFSelect from "./RHFSelect";

function StatusSelect({
  control,
}: {
  control: Control<StatusInput>;
}) {
  const { t } = useTranslation();
  const options = Object.entries(STATUS_BADGES).map(([value, { label }]) => ({
    value: Number(value),
    label: t(label),
  }));
  return (
    <RHFSelect
      name="status"
      label={t("common.changeStatus")}
      control={control}
      required
      options={options}
    />
  );
}
export default StatusSelect;
