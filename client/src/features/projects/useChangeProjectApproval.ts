import useAppMutation from "../../hooks/useAppMutation";
import { changeProjectApprovalApi } from "../../services/projectService";

export default function useChangeProjectApproval() {
  const { isPending: isUpdating, mutate: changeProjectApproval } = useAppMutation(
    changeProjectApprovalApi,
    [["owner-projects"], ["projects"], ["project"]]
  );
  return { isUpdating, changeProjectApproval };
}
