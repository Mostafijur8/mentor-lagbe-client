"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { demoUsers } from "@/lib/mock-data";
import type { Role, UserProfile } from "@/types";

type AuthContextValue = {
  user: UserProfile | null;
  ready: boolean;
  signIn: (email: string, role?: Role) => UserProfile;
  signUp: (user: UserProfile) => UserProfile;
  signOut: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "mentorlagbe-demo-user";

// This client-only session keeps all interface flows usable until the backend is connected.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved) as UserProfile);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  const save = useCallback((next: UserProfile | null) => {
    setUser(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const signIn = useCallback((email: string, role: Role = "student") => {
    const existing = demoUsers.find((item) => item.email === email);
    const profile: UserProfile = existing ? { ...existing, role } : { name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), email, role, plan: "free" };
    save(profile);
    return profile;
  }, [save]);

  const signUp = useCallback((profile: UserProfile) => { save(profile); return profile; }, [save]);
  const signOut = useCallback(() => save(null), [save]);
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return <AuthContext.Provider value={{ user, ready, signIn, signUp, signOut, updateProfile }}>{children}</AuthContext.Provider>;
}

// Pages use this hook to read or update the local demo session.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
