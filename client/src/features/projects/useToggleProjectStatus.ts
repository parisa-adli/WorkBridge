import useAppMutation from "../../hooks/useAppMutation";
import { toggleProjectStatusApi } from "../../services/projectService";

export default function useToggleProjectStatus() {
  const { isPending: isUpdating, mutate: toggleProjectStatus } =
    useAppMutation(toggleProjectStatusApi, [["owner-projects"]]);
  return { isUpdating, toggleProjectStatus };
}
