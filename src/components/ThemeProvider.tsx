"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => {},
});

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(resolved: "light" | "dark", targetKey?: string) {
  if (typeof window === "undefined") return;

  // Temporarily disable CSS transitions to prevent any visual flash or animation jump
  const css = window.document.createElement("style");
  css.appendChild(
    window.document.createTextNode(`
      * {
        -webkit-transition: none !important;
        -moz-transition: none !important;
        -o-transition: none !important;
        -ms-transition: none !important;
        transition: none !important;
      }
    `)
  );
  window.document.head.appendChild(css);

  try {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.backgroundColor = "#070913";
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.backgroundColor = "#f8fafc";
      root.style.colorScheme = "light";
    }
  } finally {
    // Force browser reflow to flush styles synchronously
    const _ = window.getComputedStyle(css).opacity;
    window.document.head.removeChild(css);
  }
}

export function useSrevoxTheme(storageKey: string = "srevox_docs_theme", defaultTheme: Theme = "dark") {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem(storageKey) as Theme) || defaultTheme;
    const resolved = saved === "system" ? getSystemTheme() : saved;
    setThemeState(saved);
    setResolvedTheme(resolved);
    setMounted(true);
    applyTheme(resolved, storageKey);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem(storageKey) as Theme) === "system") {
        const nr = getSystemTheme();
        setResolvedTheme(nr);
        applyTheme(nr, storageKey);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [storageKey, defaultTheme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(storageKey, t);
    const resolved = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(resolved);
    applyTheme(resolved, storageKey);
  };

  return { theme, resolvedTheme, setTheme, mounted, isLight: mounted && resolvedTheme === "light" };
}
