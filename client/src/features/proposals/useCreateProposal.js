import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createProposalsApi } from "../../services/proposalServis";

export default function useCreateProposal() {
    const queryClient = useQueryClient();

  const { isPending: isCreating, mutate: createProposal } = useMutation({
    mutationFn: createProposalsApi,
    onSuccess: (data) => {
        toast.success(data.message),
          
        queryClient.invalidateQueries({
          queryKey: ["proposals"],
        });
    },

    onError: (err) => toast.error(err?.response?.data?.message),
  });
  return { isCreating, createProposal };
  
}