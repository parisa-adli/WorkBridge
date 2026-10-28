import useAppMutation from "../../hooks/useAppMutation";
import { createProjectApi } from "../../services/projectService";

export default function useCreateProject() {
  const { isPending: isCreating, mutate: createProject } = useAppMutation(
    createProjectApi,
    [["owner-projects"], ["projects"]]
  );
  return { isCreating, createProject };
}
