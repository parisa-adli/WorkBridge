import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const { register, handleSubmit } = useForm<StatusInput, unknown, StatusValues>({
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
        <StatusSelect register={register} />
        <div className="mt-8!">
          {isUpdating ? (
            <Loading />
          ) : (
            <button type="submit" className="btn btn--primary w-full">
              {t("common.confirm")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
export default ChangeUserStatus;
