import { apiRequest } from "../apiClient";
import { TriageResult, DashboardOverview, AgentSteps, SystemStats, Complaint, Ticket } from "@/types";

export const CtasApi = {
  analyze: (complaintId: string) => apiRequest<TriageResult>("/CTAS/analyze", { method: "POST", body: { CID: complaintId } }),
};

export const DasApi = {
  overview: () => apiRequest<DashboardOverview>("/DAS/overview"),
  agentSteps: () => apiRequest<AgentSteps>("/DAS/agent_steps"),
};

export const StatApi = {
  get: () => apiRequest<SystemStats>("/STAT"),
};

export const UrssApi = {
  returnAllComplaints: (i: number, j: number) =>
    apiRequest<Complaint[]>("/URSS/Complain/return_all", { method: "POST", body: { i, j } }),

  latestComplaint: () => apiRequest<Complaint>("/URSS/Complain/latest"),

  complaintProgress: (complaintId: string) =>
    apiRequest<Ticket[]>(`/URSS/Complain_Progress/${encodeURIComponent(complaintId)}`),
};
