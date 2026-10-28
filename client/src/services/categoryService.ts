import http from "./httpService";
import type { ApiResponse, Category, MessageData } from "../types/api";

export type NewCategory = {
  title: string;
  englishTitle: string;
  description: string;
  type: string;
  parentId?: string;
};

export function getCategoryApi() {
  return http
    .get<ApiResponse<{ categories: Category[] }>>("/category/list")
    .then(({ data }) => data.data);
}

export function createCategoryApi(data: NewCategory) {
  return http
    .post<ApiResponse<MessageData>>("/admin/category/add", data)
    .then(({ data }) => data.data);
}

export function editCategoryApi({ id, data }: { id: string; data: NewCategory }) {
  return http
    .patch<ApiResponse<MessageData>>(`/admin/category/update/${id}`, data)
    .then(({ data }) => data.data);
}

export function removeCategoryApi(id: string) {
  return http
    .delete<ApiResponse<MessageData>>(`/admin/category/remove/${id}`)
    .then(({ data }) => data.data);
}
