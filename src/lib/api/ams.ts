import { apiRequest } from "../apiClient";
import { UserRole } from "@/types";

export interface LoginPayload {
  NAM: string;
  PAS: string;
}

export interface SignupPayload {
  NAM: string;
  PAS: string;
  EMA: string;
  ROL: UserRole;
}

export interface UpdatePayload {
  EMA: string | false;
  PAS: string | false;
  ROL?: boolean;
}

export const AmsApi = {
  login: (payload: LoginPayload) => apiRequest("/AMS/login", { method: "POST", body: payload }),

  signup: (payload: SignupPayload) => apiRequest("/AMS/signup", { method: "POST", body: payload }),

  update: (userName: string, payload: UpdatePayload) =>
    apiRequest(`/AMS/${encodeURIComponent(userName)}/Update`, { method: "POST", body: payload }),

  logout: () => apiRequest("/AMS/logout", { method: "POST" }),
};
