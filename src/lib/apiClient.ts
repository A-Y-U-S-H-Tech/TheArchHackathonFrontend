import { apiUrl } from "./config";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
}

/**
 * Core request helper.
 * - Always sends credentials: "include" so the JWT cookie set by AMS/login
 *   is attached to every subsequent request (per the backend's cookie-based
 *   auth model).
 * - Throws ApiError on non-2xx responses so callers can branch on status
 *   (e.g. 401 -> redirect to login, 400 -> show inline error).
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, isFormData = false } = options;

  const headers: Record<string, string> = {};
  if (!isFormData && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers,
      credentials: "include",
      body: body === undefined ? undefined : isFormData ? (body as BodyInit) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Could not reach the backend. Check the API host/port configuration and that the server is running.");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>).message)
        : undefined) || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}
