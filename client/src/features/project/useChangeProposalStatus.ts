import useAppMutation from "../../hooks/useAppMutation";
import { changeProposalStatusApi } from "../../services/proposalService";

export default function useChangeProposalStatus() {
  // ["project"] covers every project page; accepting assigns the freelancer shown in the owner's project list
  const { isPending: isUpdating, mutate: changeProposalStatuscode } =
    useAppMutation(changeProposalStatusApi, [["project"], ["owner-projects"]]);
  return { isUpdating, changeProposalStatuscode };
}
