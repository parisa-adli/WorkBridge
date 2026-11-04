import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getUsersApi } from "../../services/authService";
import { LIMITS } from "../../constants";

export default function useUsers() {
  // the URL's query string carries the page like the other filters
  const { search } = useLocation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", search],
    queryFn: () => getUsersApi(search),
  });

  const { items: users = [], total = 0, page = 1, limit = LIMITS.PAGE_SIZE } = data || {};

  return { users, total, page, limit, isLoading, isError };
}
