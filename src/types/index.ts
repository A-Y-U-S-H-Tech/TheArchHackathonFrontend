// Entity types mirrored from the FMCG Operations Copilot backend design doc.

export type ProductStatus = "Active" | "Deactive" | "Archived";

export interface Product {
  PID: string;
  PNM: string;
  PCAT: string;
  PDES: string;
  PSTA: ProductStatus;
}

export type ComplaintSeverity = "Low" | "Medium" | "High" | "Critical" | string;

export interface Complaint {
  CID: string;
  CUS: string;
  PID: string;
  CDES: string;
  CST: boolean | string; // true = resolved, else pending
  CSEV: ComplaintSeverity;
  CDT: string;
}

export type TicketStatus = "Open" | "In Progress" | "Escalated" | "Closed" | string;
export type Priority = "Low" | "Medium" | "High" | "Critical" | string;

export interface Ticket {
  TID: string;
  CID: string;
  DES: string;
  DEP: string;
  PRI: Priority;
  STA: TicketStatus;
  CRT: string;
  ITO: boolean;
}

export interface KnowledgeDocument {
  DID: string;
  DNM: string;
  DTYPE: string;
  DPATH?: string;
}

export type UserRole = "CUS" | "CSE" | "SUP";

export interface SessionUser {
  NAM: string;
  EMA: string;
  ROL: UserRole;
}

export interface TriageAnalysis {
  complaint_id: string;
  user_name: string;
  product_id: string;
  product_name: string;
  issue_summary: string;
  classification: string;
  risk_level: string;
  reasoning: string;
}

export interface ToolUsed {
  tool: string;
  reason: string;
}

export interface SampleTicket {
  TID: string;
  CID: string;
  DEP: string;
  PRI: string;
  STA: string;
  DES: string;
}

export interface ToolTrace {
  step: number;
  tool: string;
  reason: string;
  observation: string;
}

export interface TriageResult {
  triage_analysis: TriageAnalysis;
  tools_used: ToolUsed[];
  sample_ticket: SampleTicket;
  cid: string;
  complaint_found: boolean;
  product_found: boolean;
  complaint: Complaint | Record<string, unknown>;
  product: Product | Record<string, unknown>;
  retrieval: {
    query: string;
    retrieved_context: string;
  };
  triage: Record<string, unknown>;
  ticket: {
    should_create: boolean;
    reason: string;
  };
  tool_trace: ToolTrace[];
}

export interface DashboardOverview {
  total_complaints: number;
  resolved_complaints: number;
  open_complaints: number;
  high_severity: number;
}

export interface AgentSteps {
  Step1: string;
  Step2: string;
  Step3: string;
  Step4: string;
  Step5: string;
}

export interface SystemStats {
  total_products: number;
  total_documents: number;
  total_complaints: number;
  total_tickets: number;
  total_resolved: number;
}
