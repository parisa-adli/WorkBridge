import useAppMutation from "../../hooks/useAppMutation";
import { editProjectApi } from "../../services/projectService";

export default function useEditProject() {
  const { isPending: isEditing, mutate: editProject } = useAppMutation(
    editProjectApi,
    [["owner-projects"], ["projects"]]
  );
  return { isEditing, editProject };
}
