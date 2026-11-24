"use client";

import { useAuth } from "@/components/providers/auth-provider";

// This hook exposes the current frontend session and whether browser hydration is complete.
export function useSession() {
  return useAuth();
}
