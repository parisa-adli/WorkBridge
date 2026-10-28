import http from "./httpService";
import type { ApiResponse, MessageData, Project, ProjectStatus } from "../types/api";

export type NewProject = {
  title: string;
  description: string;
  budget: number;
  tags: string[];
  category: string;
  deadline: string;
};

export function getOwnerProjectsApi() {
  return http
    .get<ApiResponse<{ projects: Project[] }>>("project/owner-projects")
    .then(({ data }) => data.data);
}

export function removeProjectApi(id: string) {
  return http
    .delete<ApiResponse<MessageData>>(`/project/${id}`)
    .then(({ data }) => data.data);
}

export function createProjectApi(data: NewProject) {
  return http
    .post<ApiResponse<MessageData & { project: Project }>>("/project/add", data)
    .then(({ data }) => data.data);
}

export function editProjectApi({ id, newProject }: { id: string; newProject: NewProject }) {
  return http
    .patch<ApiResponse<MessageData>>(`/project/update/${id}`, newProject)
    .then(({ data }) => data.data);
}

export function toggleProjectStatusApi({ id, data }: { id: string; data: { status: ProjectStatus } }) {
  return http
    .patch<ApiResponse<MessageData>>(`/project/${id}`, data)
    .then(({ data }) => data.data);
}

export function getProjectApi(id: string) {
  return http
    .get<ApiResponse<{ project: Project }>>(`/project/${id}`)
    .then(({ data }) => data.data);
}

export function getProjectsApi(qs: string) {
  return http
    .get<ApiResponse<{ projects: Project[] }>>(`/project/list${qs}`)
    .then(({ data }) => data.data);
}
