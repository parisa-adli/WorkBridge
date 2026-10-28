import http from "./httpService";
import type { ApiResponse, MessageData, Proposal, Status } from "../types/api";

export function changeProposalStatusApi({ id, data }: { id: string; data: { status: Status } }) {
  return http
    .patch<ApiResponse<MessageData>>(`/proposal/${id}`, data)
    .then(({ data }) => data.data);
}

export function getProposalsApi() {
  return http
    .get<ApiResponse<{ proposals: Proposal[] }>>(`/proposal/list`)
    .then(({ data }) => data.data);
}

export type NewProposal = { description: string; price: number; duration: number; projectId: string };

export function createProposalsApi(data: NewProposal) {
  return http
    .post<ApiResponse<MessageData>>(`/proposal/add`, data)
    .then(({ data }) => data.data);
}
