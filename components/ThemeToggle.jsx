"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "./Icon";

const KEY = "papan-tema";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "light");
  }, []);

  function flip() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      window.localStorage.setItem(KEY, next);
    } catch {
      /* penyimpanan diblokir — tema tetap berubah untuk sesi ini */
    }
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-icon"
      onClick={flip}
      aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
