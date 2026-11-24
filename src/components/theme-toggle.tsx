"use client";

import { useEffect, useSyncExternalStore } from "react";
import { readClientStore, subscribeClientStore, writeClientStore } from "@/lib/client-store";

type Theme = "light" | "dark";
const themeKey = "mentorlagbe-theme";
const readTheme = (): Theme =>
  readClientStore<unknown>(themeKey, "light") === "dark" ? "dark" : "light";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    (callback) => subscribeClientStore(themeKey, callback),
    readTheme,
    (): Theme => "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    writeClientStore(themeKey, nextTheme);
  }

  const nextTheme = theme === "light" ? "dark" : "light";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={theme === "dark"}
      title={`Switch to ${nextTheme} theme`}
      onClick={toggleTheme}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
    </button>
  );
}
