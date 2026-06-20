"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionUser, UserRole } from "@/types";
import { AmsApi, LoginPayload, SignupPayload } from "@/lib/api/ams";

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload, role?: UserRole) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "fmcg_session_user";

// The backend authenticates purely via an httpOnly-style JWT cookie, which
// JS cannot read. We mirror minimal, non-sensitive session info (name/role)
// in localStorage purely for UI purposes (showing the right nav, role
// gating in the client). The cookie remains the actual source of truth for
// every API call's auth; if it expires, the backend will reject requests
// with 401 regardless of what's cached here.
function readCachedUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function writeCachedUser(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(readCachedUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload, role: UserRole = "CUS") => {
    await AmsApi.login(payload);
    // The design doc's AMS/login response doesn't include a user/role object,
    // so the frontend asks the person which role they're logging in as (the
    // login form presents this as a selector) and trusts the backend to
    // reject any request that the JWT's actual role doesn't permit. This
    // value only drives which nav/pages are shown client-side — it is not a
    // security boundary on its own.
    const sessionUser: SessionUser = { NAM: payload.NAM, EMA: "", ROL: role };
    writeCachedUser(sessionUser);
    setUser(sessionUser);
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    await AmsApi.signup(payload);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AmsApi.logout();
    } finally {
      writeCachedUser(null);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleLabel(role: UserRole): string {
  switch (role) {
    case "CUS":
      return "Customer";
    case "CSE":
      return "Service Executive";
    case "SUP":
      return "Supervisor";
    default:
      return role;
  }
}
