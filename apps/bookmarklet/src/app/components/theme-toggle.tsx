"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "breakpoint-overlay-theme";

const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  if (typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initial =
      stored === "light" || stored === "dark" ? stored : getSystemTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const handleToggle = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Toggle dark mode"
      className="relative inline-flex h-8 w-14 items-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-1 shadow-sm transition hover:border-[var(--card-border)]"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card-text)] text-[var(--card-bg)] shadow-sm transition ${
          theme === "dark" ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="currentColor"
          >
            <path d="M21.64 13a1 1 0 0 0-1.05-.14 7 7 0 0 1-8.45-8.45 1 1 0 0 0-1.19-1.19A9 9 0 1 0 20.83 14a1 1 0 0 0 .81-1Z" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="currentColor"
          >
            <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm10-7a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1ZM5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm13.66-6.66a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 0 1-1.41-1.42l1.41-1.41a1 1 0 0 1 1.42 0Zm-11.31 11.3a1 1 0 0 1 0 1.42L5.93 19.5a1 1 0 0 1-1.42-1.41l1.42-1.42a1 1 0 0 1 1.41 0Zm11.31 1.42a1 1 0 0 1-1.42 0l-1.41-1.42a1 1 0 1 1 1.41-1.41l1.42 1.41a1 1 0 0 1 0 1.42ZM7.34 6.76a1 1 0 0 1-1.41 0L4.51 5.34a1 1 0 0 1 1.42-1.42l1.41 1.42a1 1 0 0 1 0 1.42Z" />
          </svg>
        )}
      </span>
    </button>
  );
}
