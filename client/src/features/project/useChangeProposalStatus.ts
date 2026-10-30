import useAppMutation from "../../hooks/useAppMutation";
import { changeProposalStatusApi } from "../../services/proposalService";

export default function useChangeProposalStatus() {
  // ["project"] covers every project page; accepting assigns the freelancer, closes the project
  // and rejects the other proposals, all shown in the project and proposal lists
  const { isPending: isUpdating, mutate: changeProposalStatuscode } = useAppMutation(
    changeProposalStatusApi,
    [["project"], ["owner-projects"], ["projects"], ["proposals"]]
  );
  return { isUpdating, changeProposalStatuscode };
}
