// Resolves the backend base URL from environment variables.
// Priority: NEXT_PUBLIC_API_BASE_URL (full override) > PROTOCOL+HOST+PORT.
//
// All NEXT_PUBLIC_* vars are inlined at build time by Next.js, so they must be
// set in the environment BEFORE `next build` runs (e.g. in Vercel's
// Environment Variables panel, or in a local .env.local file).

function resolveBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (explicit && explicit.trim().length > 0) {
    return explicit.replace(/\/+$/, "");
  }

  const protocol = process.env.NEXT_PUBLIC_API_PROTOCOL || "http";
  const host = process.env.NEXT_PUBLIC_API_HOST || "127.0.0.1";
  const port = process.env.NEXT_PUBLIC_API_PORT;

  const portSegment = port ? `:${port}` : "";
  return `${protocol}://${host}${portSegment}`;
}

export const API_BASE_URL = resolveBaseUrl();

export function apiUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
