import { useForm } from "react-hook-form";
import Loading from "../../../ui/Loading";
import StatusSelect from "../../../ui/StatusSelect";
import useChangeUserStatus from "./useChangeUserStatus";
import type { Status } from "../../../types/api";

type ChangeUserStatusProps = {
  userId: string;
  onClose: () => void;
  userStatus: Status;
};

function ChangeUserStatus({ userId, onClose, userStatus }: ChangeUserStatusProps) {
  const { register, handleSubmit } = useForm<{ status: Status }>({
    defaultValues: { status: userStatus },
  });
  const { changeUserStatus, isUpdating } = useChangeUserStatus();

  const onSubmit = (data: { status: Status }) => {
    changeUserStatus(
      { userId, data }, // data:{status:0,1,2}
      { onSuccess: onClose }
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <StatusSelect register={register} />
        <div className="!mt-8">
          {isUpdating ? (
            <Loading />
          ) : (
            <button type="submit" className="btn btn--primary w-full">
              تایید
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
export default ChangeUserStatus;
