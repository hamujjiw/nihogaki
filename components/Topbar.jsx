import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import SavedButton from "./SavedButton";

const NAV = [
  { href: "/lowongan", label: "Lowongan" },
  { href: "/statistik", label: "Statistik" },
  { href: "/panduan", label: "Panduan" },
];

export default function Topbar({ active }) {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">〒</span>
          <span>Nihogaki</span>
        </Link>

        <nav className="topbar-nav" aria-label="Navigasi utama">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="topbar-link"
              aria-current={active === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="topbar-actions">
          <SavedButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
