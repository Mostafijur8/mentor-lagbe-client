const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
export const ACCESS_TOKEN_KEY = "mentorlagbe-access-token";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "ApiError"; }
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent("mentorlagbe:storage", { detail: { key: ACCESS_TOKEN_KEY } }));
}

export function hasAccessToken() {
  return typeof window !== "undefined" && Boolean(window.localStorage.getItem(ACCESS_TOKEN_KEY));
}

// All frontend requests share the backend URL and attach the server-issued JWT when available.
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new ApiError(payload.message ?? "The request could not be completed.", response.status);
  return payload as T;
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
