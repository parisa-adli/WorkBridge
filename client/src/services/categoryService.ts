import http from "./httpService";
import type { ApiResponse, Category } from "../types/api";

export function getCategoryApi() {
  return http
    .get<ApiResponse<{ categories: Category[] }>>("/category/list")
    .then(({ data }) => data.data);
}
