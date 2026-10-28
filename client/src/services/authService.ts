import http from "./httpService";
import type { ApiResponse, MessageData, Project, Proposal, Role, Status, Translations, User } from "../types/api";

export function getOtp(data: { phoneNumber: string }) {
  return http
    .post<ApiResponse<MessageData & { otp?: number }>>("/user/get-otp", data)
    .then(({ data }) => data.data);
}

export function checkOtp(data: { phoneNumber: string; otp: string }) {
  return http
    .post<ApiResponse<MessageData & { user: User }>>("/user/check-otp", data)
    .then(({ data }) => data.data);
}

export function demoLoginApi(data: { username: string; password: string }) {
  return http
    .post<ApiResponse<MessageData & { user: User }>>("/user/demo-login", data)
    .then(({ data }) => data.data);
}

export function completeProfile(data: { name: string; email: string; role: Role }) {
  return http
    .post<ApiResponse<MessageData & { user: User }>>("/user/complete-profile", data)
    .then(({ data }) => data.data);
}

export function getUser() {
  return http
    .get<ApiResponse<{ user: User }>>("/user/profile")
    .then(({ data }) => data.data);
}

export function updateProfileApi(data: { name: string; email: string; biography?: string }) {
  return http
    .patch<ApiResponse<MessageData>>("/user/update", data)
    .then(({ data }) => data.data);
}

// The server reads the file as the raw body and checks its type and size (jpg/png/webp, 2 MB).
export function updateAvatarApi(file: File) {
  return http
    .patch<ApiResponse<MessageData & { avatarUrl: string }>>("/user/avatar", file, {
      headers: { "Content-Type": file.type },
    })
    .then(({ data }) => data.data);
}

export function logoutApi() {
  return http
    .post<ApiResponse<MessageData>>("/user/logout")
    .then(({ data }) => data.data);
}

export function getUsersApi() {
  return http
    .get<ApiResponse<{ users: User[] }>>("/admin/user/list")
    .then(({ data }) => data.data);
}

export type UserProfile = {
  user: User;
  createdProjects: Project[];
  completedProjects: Project[];
  // the project is populated with its title only
  proposals: (Omit<Proposal, "project"> & { project: { _id: string; title: string } & Translations<{ title: string }> })[];
};

export function getUserProfileApi(userId: string) {
  return http
    .get<ApiResponse<UserProfile>>(`/admin/user/profile/${userId}`)
    .then(({ data }) => data.data);
}

export function changeUserStatusApi({ userId, data }: { userId: string; data: { status: Status } }) {
  return http
    .patch<ApiResponse<MessageData>>(`/admin/user/verify/${userId}`, data)
    .then(({ data }) => data.data);
}
