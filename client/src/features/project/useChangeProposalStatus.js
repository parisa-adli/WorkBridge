import { useMutation } from "@tanstack/react-query";
import { changeProposalStatusApi } from "../../services/proposalServis";
import toast from "react-hot-toast";

export default function useChangeProposalStatus() {
  const { isPending: isUpdating, mutate: changeProposalStatuscode } =
    useMutation({
      mutationFn: changeProposalStatusApi,
      onSuccess: (data) => {
        toast.success(data.message);
      },
      onError: (err) => toast.error(err?.response?.data?.message),
    });
  return { isUpdating, changeProposalStatuscode };
}
