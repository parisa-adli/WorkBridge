import { useQuery } from "@tanstack/react-query";
import { getPublicStatsApi } from "../services/statsService";

export default function usePublicStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["public-stats"],
    queryFn: getPublicStatsApi,
  });
  return { stats, isLoading };
}
