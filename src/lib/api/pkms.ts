import { apiRequest } from "../apiClient";
import { KnowledgeDocument } from "@/types";

export interface UploadDocumentMeta {
  DID: string;
  DNM: string;
  DTYPE: string; // e.g. "cat1/subcat2/"
}

export const PkmsApi = {
  upload: (file: File, meta: UploadDocumentMeta) => {
    const form = new FormData();
    form.append("Ufile", file);
    form.append("metaData", JSON.stringify(meta));
    return apiRequest("/PKMS/upload_document", { method: "POST", body: form, isFormData: true });
  },

  allDocuments: () => apiRequest<KnowledgeDocument[]>("/PKMS/all_documents"),

  delete: (documentId: string) => apiRequest(`/PKMS/${encodeURIComponent(documentId)}/Delete`, { method: "POST" }),
};
