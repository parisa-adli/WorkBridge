import useAppMutation from "../../hooks/useAppMutation";
import { createProposalsApi } from "../../services/proposalService";

export default function useCreateProposal() {
  const { isPending: isCreating, mutate: createProposal } = useAppMutation(
    createProposalsApi,
    [["proposals"], ["projects"]]
  );
  return { isCreating, createProposal };
}
