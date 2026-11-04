import { useQuery } from "@tanstack/react-query";
import { getProjectsApi } from "../services/projectService";
import { useLocation } from "react-router-dom";
import { LIMITS } from "../constants";

export default function useProjects() {
  const { search } = useLocation();

  // const queryObject = queryString.parse(search);
  const queryObject = Object.fromEntries(new URLSearchParams(search));

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects", queryObject],
    queryFn: () => getProjectsApi(search),
  });

  const { items: projects = [], total = 0, page = 1, limit = LIMITS.PAGE_SIZE } = data || {};

  return { projects, total, page, limit, isLoading, isError };
}
