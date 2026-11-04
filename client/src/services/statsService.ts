import http from "./httpService";
import type { ApiResponse, PublicStats } from "../types/api";

export function getPublicStatsApi() {
  return http.get<ApiResponse<PublicStats>>("/stats/public").then(({ data }) => data.data);
}
