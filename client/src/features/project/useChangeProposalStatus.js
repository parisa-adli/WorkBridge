import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeProposalStatusApi } from "../../services/proposalService";
import toast from "react-hot-toast";

export default function useChangeProposalStatus() {
  const queryClient = useQueryClient();

  const { isPending: isUpdating, mutate: changeProposalStatuscode } =
    useMutation({
      mutationFn: changeProposalStatusApi,
      onSuccess: (data) => {
        toast.success(data.message);
        // accepting assigns the freelancer shown in the owner's project list
        queryClient.invalidateQueries({ queryKey: ["owner-projects"] });
      },
      onError: (err) => toast.error(err?.response?.data?.message),
    });
  return { isUpdating, changeProposalStatuscode };
}
