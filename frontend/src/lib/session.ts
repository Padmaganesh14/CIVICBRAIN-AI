import { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = "citizen" | "officer";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOKEN_KEY = "tn_token";
const USER_KEY = "tn_user";

/** Normalizes the API base URL from VITE_API_URL env var, avoiding trailing slashes and /api duplication. */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env["VITE_API_URL"];
  let raw = envUrl && envUrl.trim() ? envUrl.trim() : "http://localhost:5000";
  // Strip trailing slashes
  raw = raw.replace(/\/+$/, "");
  // If VITE_API_URL ends with /api, strip it to prevent /api/api path duplication
  if (raw.endsWith("/api")) {
    raw = raw.slice(0, -4);
  }
  return raw;
}

/** Constructs a clean API or asset URL avoiding double slashes. */
export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("tn-auth-change"));
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("tn-auth-change"));
}

export function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

// ─── API fetch helper ─────────────────────────────────────────────────────────

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers || {}) as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const targetUrl = buildApiUrl(path);

  // Remove Content-Type for FormData (browser sets it with boundary automatically)
  if (options.body instanceof FormData) {
    const { "Content-Type": _removed, ...rest } = headers;
    return fetch(targetUrl, { ...options, headers: rest });
  }

  return fetch(targetUrl, { ...options, headers });
}

// ─── Auth actions ─────────────────────────────────────────────────────────────

/** Sign in and persist JWT + user profile */
export function signInWithToken(token: string, user: AuthUser) {
  setToken(token);
  saveUser(user);
}

/** Call backend logout, then clear local state */
export async function signOut(): Promise<void> {
  const token = getToken();
  if (token) {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout — still clear locally
    }
  }
  clearAuth();
}

/** Validate existing token via GET /api/auth/me. Returns user or null. */
export async function validateSession(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await apiFetch("/api/auth/me");
    if (!res.ok) {
      clearAuth();
      return null;
    }
    const json = await res.json();
    if (json.success && json.data) {
      const user: AuthUser = {
        id: json.data._id || json.data.id,
        username: json.data.username,
        name: json.data.name,
        role: json.data.role,
        phone: json.data.phone,
        department: json.data.department,
      };
      saveUser(user);
      return user;
    }
    clearAuth();
    return null;
  } catch {
    // Network error — keep local state intact to avoid logout on reconnect
    return readUser();
  }
}

// ─── React hook ───────────────────────────────────────────────────────────────

export function useSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  const sync = useCallback(() => setUser(readUser()), []);

  useEffect(() => {
    sync();
    setReady(true);
    window.addEventListener("tn-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("tn-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return { user, ready };
}

// ─── Legacy shim ──────────────────────────────────────────────────────────────
/** @deprecated Use `user` instead of `session`. */
export type Session = {
  role: "citizen" | "officer";
  name: string;
  detail: string;
};
