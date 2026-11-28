"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { api, getErrorMessage, setAccessToken } from "@/lib/api";
import type { Role, UserProfile } from "@/types";

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

function toUserProfile(user: Record<string, unknown>): UserProfile {
  return {
    _id: String(user._id ?? user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    role: (user.role as Role) ?? "student",
    plan: (user.plan as "free" | "pro") ?? "free",
    image: typeof user.image === "string" ? user.image : undefined,
    phone: typeof user.phone === "string" ? user.phone : undefined,
    bio: typeof user.bio === "string" ? user.bio : undefined,
    savedTuitions: Array.isArray(user.savedTuitions)
      ? user.savedTuitions.filter((id): id is string => typeof id === "string")
      : [],
  };
}

// Exchanges the Better Auth cookie for the JWT used by every Express API call.
async function requestAccessToken() {
  const response = await fetch("/api/auth/token", { cache: "no-store" });
  const payload = (await response.json().catch(() => ({}))) as {
    token?: string;
    user?: Record<string, unknown>;
    message?: string;
  };
  if (!response.ok || !payload.token || !payload.user) {
    throw new Error(payload.message ?? "Could not create an API session.");
  }
  setAccessToken(payload.token);
  return toUserProfile(payload.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const sessionUserId = session?.user?.id ?? null;

  const loadApiUser = useCallback(async () => {
    const profile = await api<UserProfile>("/auth/me");
    const normalized = toUserProfile(profile as unknown as Record<string, unknown>);
    setUser(normalized);
    return normalized;
  }, []);

  // Once Better Auth resolves, trade its session for a JWT and load the
  // authoritative profile from the Express users collection.
  useEffect(() => {
    let active = true;
    if (isPending) return () => { active = false; };

    if (!sessionUserId) {
      setAccessToken(null);
      return () => { active = false; };
    }

    requestAccessToken()
      .then((profile) => {
        if (active) {
          setAuthError(null);
          setUser(profile);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setAccessToken(null);
        setUser(null);
        setAuthError(getErrorMessage(error));
      });

    return () => { active = false; };
  }, [isPending, sessionUserId]);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const result = await authClient.signIn.email({ email, password, rememberMe: true });
    if (result.error) {
      const message = result.error.message ?? "Sign in failed.";
      setAuthError(message);
      throw new Error(message);
    }
    const profile = await requestAccessToken();
    setUser(profile);
    return profile;
  }, []);

  const signUp = useCallback(async (profile: UserProfile, password: string) => {
    setAuthError(null);
    const result = await authClient.signUp.email({
      name: profile.name,
      email: profile.email,
      password,
      role: profile.role,
    });
    if (result.error) {
      const message = result.error.message ?? "Sign up failed.";
      setAuthError(message);
      throw new Error(message);
    }
    const created = await requestAccessToken();
    setUser(created);
    return created;
  }, []);

  const signOut = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setAuthError(null);
    void authClient.signOut().catch(() => {});
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const payload: Record<string, string> = {};
    for (const key of ["name", "phone", "bio", "image"] as const) {
      if (typeof updates[key] === "string") payload[key] = updates[key];
    }
    const updated = await api<UserProfile>("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    setUser(toUserProfile(updated as unknown as Record<string, unknown>));
  }, []);

  const toggleBookmark = useCallback(async (tuitionId: string) => {
    const result = await api<{ saved: boolean }>(`/bookmarks/${tuitionId}`, { method: "POST" });
    setUser((current) => {
      if (!current) return current;
      const savedTuitions = result.saved
        ? [...new Set([...(current.savedTuitions ?? []), tuitionId])]
        : (current.savedTuitions ?? []).filter((id) => id !== tuitionId);
      return { ...current, savedTuitions };
    });
    return result.saved;
  }, []);

  const refreshUser = useCallback(() => loadApiUser(), [loadApiUser]);
  const hasSession = Boolean(sessionUserId);
  // A session without a loaded API user is still "not ready", which prevents
  // protected pages from redirecting while the JWT exchange is in flight.
  const ready = !isPending && (!hasSession || Boolean(user) || Boolean(authError));

  return (
    <AuthContext.Provider
      value={{
        // Do not expose a cached API profile after the Better Auth session ends.
        user: sessionUserId ? user : null,
        ready,
        authError,
        signIn,
        signUp,
        signOut,
        updateProfile,
        toggleBookmark,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
