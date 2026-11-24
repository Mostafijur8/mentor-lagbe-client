"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { getClientStoreSnapshot, readClientStore, subscribeClientStore, writeClientStore } from "@/lib/client-store";

export const bookmarksKey = "mentorlagbe-demo-bookmarks";

// Students can save up to five listings on Free or save without a limit on Pro.
export function BookmarkButton({ tuitionId }: { tuitionId: string }) {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const bookmarksJson = useSyncExternalStore(
    (callback) => subscribeClientStore(bookmarksKey, callback),
    () => getClientStoreSnapshot(bookmarksKey, [] as string[]),
    () => JSON.stringify([]),
  );
  const saved = (JSON.parse(bookmarksJson) as string[]).includes(tuitionId);

  function toggle() {
    if (!user) { toast("Sign in as a student to save this tuition.", "info"); router.push("/sign-in"); return; }
    if (user.role !== "student") { toast("Only student accounts can save tuitions.", "info"); return; }
    const current = readClientStore<string[]>(bookmarksKey, []);
    if (current.includes(tuitionId)) {
      writeClientStore(bookmarksKey, current.filter((id) => id !== tuitionId)); window.dispatchEvent(new Event("mentorlagbe-bookmarks")); toast("Removed from your saved tuitions.", "info"); return;
    }
    if (user.plan === "free" && current.length >= 5) { toast("Free accounts can save up to 5 tuitions. Explore Pro for unlimited saves.", "info"); return; }
    writeClientStore(bookmarksKey, [...current, tuitionId]); window.dispatchEvent(new Event("mentorlagbe-bookmarks")); toast("Saved to your learning list.");
  }

  return <button type="button" className={`bookmark-button ${saved ? "saved" : ""}`} aria-label={saved ? "Remove saved tuition" : "Save tuition"} aria-pressed={saved} onClick={toggle}>{saved ? "♥" : "♡"}</button>;
}
