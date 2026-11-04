import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getProjectApi } from "../../services/projectService";
import { useParams } from "react-router-dom";

export default function useProject() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["project", id],
    // the routes are /<role>/projects/:id, so id is always set
    queryFn: () => getProjectApi(id!),
    retry: false,
  });

  const { project } = data || {};
  // a 4xx (missing, bad id, not yours) reads as not found; only a server or network failure is a load error
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const isError = !!error && !(status && status < 500);

  return { project, isLoading, isError };
}
