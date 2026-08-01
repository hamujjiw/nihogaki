"use client";

import { DEFAULT_FILTERS } from "@/lib/filters";
import { JLPT_CHOICES } from "@/lib/match";
import { IconSearch } from "./Icon";

// Batas bersifat maksimum: memilih N3 ikut menampilkan yang N4, N5, dan
// yang belum menuntut bahasa Jepang sama sekali.
const JP_LIMITS = [
  { value: "", label: "Bebas" },
  { value: "none", label: "Belum bisa" },
  { value: "n5", label: "s/d N5" },
  { value: "n4", label: "s/d N4" },
  { value: "n3", label: "s/d N3" },
  { value: "n2", label: "s/d N2" },
];

const SALARY = [
  { value: 0, label: "Semua" },
  { value: 6_000_000, label: "≥ ¥6jt" },
  { value: 8_000_000, label: "≥ ¥8jt" },
  { value: 10_000_000, label: "≥ ¥10jt" },
];

export default function FilterPanel({
  filters,
  onChange,
  profile,
  onProfileChange,
  facets,
  savedCount,
  savedOnly,
  onSavedOnly,
}) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const setP = (patch) => onProfileChange({ ...profile, ...patch });

  const toggleStack = (tech) =>
    set({
      stack: filters.stack.includes(tech)
        ? filters.stack.filter((t) => t !== tech)
        : [...filters.stack, tech],
    });

  const toggleMyStack = (tech) =>
    setP({
      stack: profile.stack.includes(tech)
        ? profile.stack.filter((t) => t !== tech)
        : [...profile.stack, tech],
    });

  return (
    <>
      <div className="panel">
        <div className="field">
          <label className="label" htmlFor="q">
            Cari
          </label>
          <div className="search-wrap">
            <span className="search-icon">
              <IconSearch />
            </span>
            <input
              id="q"
              className="input"
              type="search"
              value={filters.q}
              placeholder="Posisi, perusahaan, teknologi"
              onChange={(e) => set({ q: e.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <span className="label">Syarat</span>
          <button
            type="button"
            className="switch"
            aria-pressed={filters.abroadOnly}
            onClick={() => set({ abroadOnly: !filters.abroadOnly })}
          >
            Bisa melamar dari luar Jepang
            <span className="switch-track" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="switch"
            aria-pressed={filters.remoteOnly}
            onClick={() => set({ remoteOnly: !filters.remoteOnly })}
          >
            Remote atau hybrid
            <span className="switch-track" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="switch"
            aria-pressed={filters.disclosedSalaryOnly}
            onClick={() => set({ disclosedSalaryOnly: !filters.disclosedSalaryOnly })}
          >
            Hanya yang mencantumkan gaji
            <span className="switch-track" aria-hidden="true" />
          </button>
        </div>

        <div className="field">
          <span className="label">Batas bahasa Jepang</span>
          <div className="chips">
            {JP_LIMITS.map((c) => (
              <button
                key={c.value}
                type="button"
                className="chip chip-sm"
                aria-pressed={filters.japanese === c.value}
                onClick={() => set({ japanese: c.value })}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="label">Gaji tahunan minimum</span>
          <div className="chips">
            {SALARY.map((s) => (
              <button
                key={s.value}
                type="button"
                className="chip chip-sm"
                aria-pressed={filters.minSalary === s.value}
                onClick={() => set({ minSalary: s.value })}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="cat">
            Bidang
          </label>
          <select
            id="cat"
            className="select"
            value={filters.category}
            onChange={(e) => set({ category: e.target.value })}
          >
            <option value="">Semua bidang</option>
            {facets.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="sen">
            Tingkat karier
          </label>
          <select
            id="sen"
            className="select"
            value={filters.seniority}
            onChange={(e) => set({ seniority: e.target.value })}
          >
            <option value="">Semua tingkat</option>
            {facets.seniorities.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="city">
            Kota
          </label>
          <select
            id="city"
            className="select"
            value={filters.city}
            onChange={(e) => set({ city: e.target.value })}
          >
            <option value="">Semua kota</option>
            {facets.cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="label">Teknologi</span>
          <div className="chips">
            {facets.stack.slice(0, 12).map((t) => (
              <button
                key={t.label}
                type="button"
                className="chip chip-sm"
                aria-pressed={filters.stack.includes(t.label)}
                onClick={() => toggleStack(t.label)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {savedCount > 0 && (
          <div className="field">
            <button
              type="button"
              className="switch"
              aria-pressed={savedOnly}
              onClick={() => onSavedOnly(!savedOnly)}
            >
              Hanya {savedCount} yang disimpan
              <span className="switch-track" aria-hidden="true" />
            </button>
          </div>
        )}

        <button type="button" className="linkish" onClick={() => onChange({ ...DEFAULT_FILTERS })}>
          Kosongkan semua filter
        </button>
      </div>

      {/* ---------- profil untuk skor kecocokan ---------- */}
      <div className="panel">
        <div className="panel-head">
          <h2>Profil kamu</h2>
          <button
            type="button"
            className="linkish"
            onClick={() => setP({ active: !profile.active })}
          >
            {profile.active ? "Matikan" : "Nyalakan"}
          </button>
        </div>

        <p className="note" style={{ marginTop: 0, marginBottom: 14 }}>
          Isi ini dan setiap lowongan akan diberi skor kecocokan beserta alasannya.
          Datanya tidak dikirim ke mana pun — hanya tersimpan di perangkat kamu.
        </p>

        <div className="field">
          <label className="label" htmlFor="jlpt">
            Bahasa Jepang kamu
          </label>
          <select
            id="jlpt"
            className="select"
            value={profile.japanese}
            onChange={(e) => setP({ japanese: e.target.value, active: true })}
          >
            {JLPT_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="years">
            Pengalaman kerja: {profile.years} tahun
          </label>
          <input
            id="years"
            type="range"
            min="0"
            max="12"
            step="1"
            value={profile.years}
            onChange={(e) => setP({ years: Number(e.target.value), active: true })}
            style={{ width: "100%", accentColor: "var(--tosca-ink)" }}
          />
        </div>

        <div className="field">
          <button
            type="button"
            className="switch"
            aria-pressed={profile.inJapan}
            onClick={() => setP({ inJapan: !profile.inJapan, active: true })}
          >
            Saya sudah tinggal di Jepang
            <span className="switch-track" aria-hidden="true" />
          </button>
        </div>

        <div className="field">
          <span className="label">Teknologi yang kamu kuasai</span>
          <div className="chips">
            {facets.stack.slice(0, 14).map((t) => (
              <button
                key={t.label}
                type="button"
                className="chip chip-sm"
                aria-pressed={profile.stack.includes(t.label)}
                onClick={() => {
                  toggleMyStack(t.label);
                  if (!profile.active) setP({ active: true });
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
