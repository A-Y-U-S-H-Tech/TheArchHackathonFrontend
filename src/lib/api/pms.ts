import { apiRequest } from "../apiClient";
import { Product, ProductStatus } from "@/types";

export interface CreateProductPayload {
  PNM: string;
  PCAT: string;
  PDES: string;
  PSTA: ProductStatus;
}

export interface UpdateProductPayload {
  PSTA: ProductStatus | false;
  PDES: string | false;
}

export const PmsApi = {
  create: (payload: CreateProductPayload) => apiRequest<Product>("/PMS/Create", { method: "POST", body: payload }),

  delete: (productId: string) => apiRequest(`/PMS/${encodeURIComponent(productId)}/Delete`, { method: "POST" }),

  update: (productId: string, payload: UpdateProductPayload) =>
    apiRequest<Product>(`/PMS/${encodeURIComponent(productId)}/Update`, { method: "POST", body: payload }),

  getAll: (i: number, j: number) => apiRequest<Product[]>("/PMS/Get_ALL", { method: "POST", body: { i, j } }),

  getOne: (productId: string) => apiRequest<Product>(`/PMS/${encodeURIComponent(productId)}/Get`),
};
