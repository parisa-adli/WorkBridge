import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getOwnerProjectsApi } from "../../services/projectService";
import { LIMITS } from "../../constants";

// qs defaults to the URL's query string, which carries the page like the other filters.
export default function useOwnerProjects(qs?: string) {
  const { search } = useLocation();
  const query = qs ?? search;
  const { data, isLoading } = useQuery({
    queryKey: ["owner-projects", query],
    queryFn: () => getOwnerProjectsApi(query),
    retry: false,
  });

  const { items: projects = [], total = 0, page = 1, limit = LIMITS.PAGE_SIZE } = data || {};

  return { projects, total, page, limit, isLoading };
}
