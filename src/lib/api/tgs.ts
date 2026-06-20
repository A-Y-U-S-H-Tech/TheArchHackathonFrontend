import { apiRequest } from "../apiClient";
import { Ticket } from "@/types";

export interface CreateTicketPayload {
  CID: string;
  PRI: string;
  DEP: string;
  DES: string;
}

export const TgsApi = {
  create: (payload: CreateTicketPayload) => apiRequest<Ticket>("/TGS/create_ticket", { method: "POST", body: payload }),

  update: (ticketId: string, payload: Partial<Ticket>) =>
    apiRequest<Ticket>(`/TGS/${encodeURIComponent(ticketId)}/Update`, { method: "POST", body: payload }),

  escalate: (ticketId: string) => apiRequest<Ticket>(`/TGS/${encodeURIComponent(ticketId)}/Escalate`, { method: "POST" }),

  close: (ticketId: string) => apiRequest<Ticket>(`/TGS/${encodeURIComponent(ticketId)}/Close`, { method: "POST" }),

  returnAll: (i: number, j: number) => apiRequest<Ticket[]>("/TGS/return_all", { method: "POST", body: { i, j } }),

  getOne: (ticketId: string) => apiRequest<Ticket>(`/TGS/${encodeURIComponent(ticketId)}/return`),
};
