import http from "./httpService";
import type { ApiResponse, MessageData, Role, Status, User } from "../types/api";

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

export function changeUserStatusApi({ userId, data }: { userId: string; data: { status: Status } }) {
  return http
    .patch<ApiResponse<MessageData>>(`/admin/user/verify/${userId}`, data)
    .then(({ data }) => data.data);
}
