"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconBookmark } from "./Icon";

const SAVED_KEY = "papan-lowongan-tersimpan";

export default function SavedButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SAVED_KEY);
      setCount(raw ? JSON.parse(raw).length : 0);
    } catch {
      /* penyimpanan diblokir - ikon tetap tampil, cuma tanpa angka */
    }

    // Angkanya ikut berubah kalau disimpan/dihapus di tab yang sama.
    const onStorage = () => {
      try {
        const raw = window.localStorage.getItem(SAVED_KEY);
        setCount(raw ? JSON.parse(raw).length : 0);
      } catch {
        /* diabaikan */
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("saved-jobs-changed", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("saved-jobs-changed", onStorage);
    };
  }, []);

  return (
    <Link
      href="/lowongan?tersimpan=1"
      className="btn btn-ghost btn-icon"
      aria-label={count > 0 ? `Lowongan tersimpan, ${count} item` : "Lowongan tersimpan"}
      title="Lowongan tersimpan"
    >
      <IconBookmark filled={count > 0} />
      {count > 0 && <span className="saved-count">{count}</span>}
    </Link>
  );
}
