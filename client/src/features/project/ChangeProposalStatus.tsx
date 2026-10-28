import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import StatusSelect from "../../ui/StatusSelect";
import useChangeProposalStatus from "./useChangeProposalStatus";
import Loading from "../../ui/Loading";
import type { Status } from "../../types/api";
import { proposalStatusSchema, type StatusInput, type StatusValues } from "../../schemas/status";

type ChangeProposalStatusProps = {
  proposalId: string;
  onClose: () => void;
  proposalStatus: Status;
};

function ChangeProposalStatus({ proposalId, onClose, proposalStatus }: ChangeProposalStatusProps) {
  const { register, handleSubmit } = useForm<StatusInput, unknown, StatusValues>({
    defaultValues: { status: proposalStatus },
    resolver: zodResolver(proposalStatusSchema),
  });
  const { changeProposalStatuscode, isUpdating } = useChangeProposalStatus();

  const onSubmit = (data: StatusValues) => {
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
