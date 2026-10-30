import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../../ui/Button";
import Loading from "../../../ui/Loading";
import StatusSelect from "../../../ui/StatusSelect";
import useChangeUserStatus from "./useChangeUserStatus";
import type { Status } from "../../../types/api";
import { userStatusSchema, type StatusInput, type StatusValues } from "../../../schemas/status";

type ChangeUserStatusProps = {
  userId: string;
  // omitted when the form sits in the page rather than a modal
  onClose?: () => void;
  userStatus: Status;
};

function ChangeUserStatus({ userId, onClose, userStatus }: ChangeUserStatusProps) {
  const { t } = useTranslation();
  const { control, handleSubmit } = useForm<StatusInput, unknown, StatusValues>({
    defaultValues: { status: userStatus },
    resolver: zodResolver(userStatusSchema),
  });
  const { changeUserStatus, isUpdating } = useChangeUserStatus();

  const onSubmit = (data: StatusValues) => {
    changeUserStatus(
      { userId, data }, // data:{status:0,1,2}
      { onSuccess: onClose }
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <StatusSelect control={control} />
        <div className="mt-8!">
          {isUpdating ? (
            <Loading />
          ) : (
            <Button type="submit" className="w-full">
              {t("common.confirm")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
export default ChangeUserStatus;
