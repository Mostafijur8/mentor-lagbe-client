"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { ApiError, ACCESS_TOKEN_KEY, api, getErrorMessage, setAccessToken } from "@/lib/api";
import { subscribeClientStore } from "@/lib/client-store";
import type { UserProfile } from "@/types";

type AuthContextValue = {
  user: UserProfile | null;
  ready: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (user: UserProfile, password: string) => Promise<UserProfile>;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  toggleBookmark: (tuitionId: string) => Promise<boolean>;
  refreshUser: () => Promise<UserProfile>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

// Restores server sessions and centralizes authenticated account actions for the client.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const token = useSyncExternalStore(
    (callback) => subscribeClientStore(ACCESS_TOKEN_KEY, callback),
    () => typeof window === "undefined" ? null : window.localStorage.getItem(ACCESS_TOKEN_KEY),
    () => "__loading__",
  );

  useEffect(() => {
    let active = true;
    if (!token || token === "__loading__") return () => { active = false; };
    api<UserProfile>("/auth/me")
      .then((profile) => { if (active) setUser(profile); })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof ApiError && cause.status === 401) setAccessToken(null);
        else setAuthError(getErrorMessage(cause));
      });
    return () => { active = false; };
  }, [token]);

  const ready = token !== "__loading__" && (!token || Boolean(user) || Boolean(authError));

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const result = await api<{ token: string; user: UserProfile }>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const signUp = useCallback(async (profile: UserProfile, password: string) => {
    setAuthError(null);
    const result = await api<{ token: string; user: UserProfile }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ ...profile, password }),
    });
    setAccessToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const profile = await api<UserProfile>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    setUser(profile);
  }, []);

  const toggleBookmark = useCallback(async (tuitionId: string) => {
    const result = await api<{ saved: boolean }>(`/bookmarks/${encodeURIComponent(tuitionId)}`, {
      method: "POST",
    });
    setUser((current) => {
      if (!current) return current;
      const currentIds = current.savedTuitions ?? [];
      return {
        ...current,
        savedTuitions: result.saved
          ? [...new Set([...currentIds, tuitionId])]
          : currentIds.filter((id) => id !== tuitionId),
      };
    });
    return result.saved;
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await api<UserProfile>("/auth/me");
    setUser(profile);
    return profile;
  }, []);

  return <AuthContext.Provider value={{ user, ready, authError, signIn, signUp, signOut, updateProfile, toggleBookmark, refreshUser }}>{children}</AuthContext.Provider>;
}

// Pages use this hook to read or update the local demo session.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
