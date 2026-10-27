import { useForm } from "react-hook-form";
import Loading from "../../../ui/Loading";
import StatusSelect from "../../../ui/StatusSelect";
import useChangeUserStatus from "./useChangeUserStatus";

function ChangeUserStatus({ userId, onClose, userStatus }) {
  const { register, handleSubmit } = useForm({
    defaultValues: { status: userStatus },
  });
  const { changeUserStatus, isUpdating } = useChangeUserStatus();

  const onSubmit = (data) => {
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
