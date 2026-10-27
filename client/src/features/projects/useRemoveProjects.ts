import useAppMutation from "../../hooks/useAppMutation";
import { removeProjectApi } from "../../services/projectService";

export default function useRemoveProject() {
  const { mutate: removeProject, isPending: isDeleting } = useAppMutation(
    removeProjectApi,
    [["owner-projects"], ["projects"]]
  );
  return { removeProject, isDeleting };
}
