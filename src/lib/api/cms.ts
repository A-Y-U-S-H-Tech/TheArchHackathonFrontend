import { apiRequest } from "../apiClient";
import { Complaint } from "@/types";

export interface CreateComplaintPayload {
  CUS: string;
  PID: string;
  CDES: string;
}

export interface UpdateComplaintPayload {
  CDES: string;
  CST: string;
}

export const CmsApi = {
  create: (payload: CreateComplaintPayload) => apiRequest<Complaint>("/CMS/Create", { method: "POST", body: payload }),

  returnAll: (i: number, j: number) =>
    apiRequest<Complaint[]>("/CMS/return_all", { method: "POST", body: { i, j } }),

  getOne: (complaintId: string) => apiRequest<Complaint>(`/CMS/${encodeURIComponent(complaintId)}`),

  update: (complaintId: string, payload: UpdateComplaintPayload) =>
    apiRequest<Complaint>(`/CMS/${encodeURIComponent(complaintId)}/Update`, { method: "POST", body: payload }),
};
