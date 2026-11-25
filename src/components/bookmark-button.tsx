"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { getErrorMessage } from "@/lib/api";

// Bookmark controls use the account's server-synced saved tuition identifiers.
export function BookmarkButton({ tuitionId }: { tuitionId: string }) {
  const { user, toggleBookmark } = useAuth();
  const toast = useToast();
  const saved = (user?.savedTuitions ?? []).includes(tuitionId);

  async function toggle() {
    if (!user) { toast("Sign in as a student to save this tuition.", "info"); return; }
    if (user.role !== "student") { toast("Only student accounts can save tuitions.", "info"); return; }
    try {
      const isSaved = await toggleBookmark(tuitionId);
      toast(isSaved ? "Saved to your learning list." : "Removed from your saved tuitions.", isSaved ? "success" : "info");
    } catch (error) {
      toast(getErrorMessage(error), "error");
    }
  }

  return <button type="button" className={`bookmark-button ${saved ? "saved" : ""}`} aria-label={saved ? "Remove saved tuition" : "Save tuition"} aria-pressed={saved} onClick={toggle}>{saved ? "♥" : "♡"}</button>;
}
