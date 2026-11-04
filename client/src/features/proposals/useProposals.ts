import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { getProposalsApi } from "../../services/proposalService";
import { LIMITS } from "../../constants";

// qs defaults to the URL's query string, which carries the page like the other filters.
export default function useProposals(qs?: string) {
  const { search } = useLocation();
  const query = qs ?? search;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["proposals", query],
    queryFn: () => getProposalsApi(query),
  });

  const { items: proposals = [], total = 0, page = 1, limit = LIMITS.PAGE_SIZE } = data || {};
  return { proposals, total, page, limit, isLoading, isError };
}
