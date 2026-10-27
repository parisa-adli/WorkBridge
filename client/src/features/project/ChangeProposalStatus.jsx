import { useForm } from "react-hook-form";
import StatusSelect from "../../ui/StatusSelect";
import useChangeProposalStatus from "./useChangeProposalStatus";
import Loading from "../../ui/Loading";

function ChangeProposalStatus({ proposalId, onClose, proposalStatus }) {
  const { register, handleSubmit } = useForm({
    defaultValues: { status: proposalStatus },
  });
  const { changeProposalStatuscode, isUpdating } = useChangeProposalStatus();

  const onSubmit = (data) => {
    changeProposalStatuscode({ id: proposalId, data }, { onSuccess: onClose });
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
export default ChangeProposalStatus;
