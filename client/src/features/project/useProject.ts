import { useQuery } from "@tanstack/react-query";
import { getProjectApi } from "../../services/projectService";
import { useParams } from "react-router-dom";

export default function useProject() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["project", id],
    // the route is /owner/projects/:id, so id is always set
    queryFn: () => getProjectApi(id!),
    retry: false,
  });

  const { project } = data || {};

  return { project, isLoading };
}
