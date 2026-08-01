"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import GateSummary from "./GateSummary";
import FilterPanel from "./FilterPanel";
import JobCard from "./JobCard";
import JobTable from "./JobTable";
import Sakura from "./Sakura";
import JobDrawer from "./JobDrawer";
import { IconSliders, IconGrid, IconTable } from "./Icon";
import { DEFAULT_FILTERS, activeCount, applyFilters, facets as buildFacets } from "@/lib/filters";
import { DEFAULT_PROFILE } from "@/lib/match";

const PAGE = 24;
const SAVED_KEY = "papan-lowongan-tersimpan";
const PROFILE_KEY = "papan-lowongan-profil";

export default function JobBoard({ jobs, stats, meta }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState("cards");
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [limit, setLimit] = useState(PAGE);
  const [saved, setSaved] = useState([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openJob, setOpenJob] = useState(null);
  const [details, setDetails] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  /* ---------------- keadaan yang bertahan di perangkat ---------------- */

  useEffect(() => {
    try {
      const s = window.localStorage.getItem(SAVED_KEY);
      if (s) setSaved(JSON.parse(s));
      const p = window.localStorage.getItem(PROFILE_KEY);
      if (p) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(p) });
    } catch {
      /* penyimpanan diblokir browser — fitur simpan dan profil mati diam-diam */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
      // Beritahu ikon simpan di topbar supaya angkanya ikut update tanpa
      // perlu reload halaman.
      window.dispatchEvent(new Event("saved-jobs-changed"));
    } catch {
      /* diabaikan */
    }
  }, [saved]);

  // Datang dari ikon simpan di topbar (/lowongan?tersimpan=1) -> langsung
  // tampilkan yang tersimpan tanpa perlu klik toggle lagi.
  useEffect(() => {
    if (searchParams.get("tersimpan") === "1") setSavedOnly(true);
  }, [searchParams]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      /* diabaikan */
    }
  }, [profile]);

  /* ---------------- tautan yang bisa dibagikan ---------------- */

  const openJobById = useCallback(
    (id) => {
      const job = jobs.find((j) => j.id === id);
      if (job) setOpenJob(job);
    },
    [jobs]
  );

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("lowongan");
    if (id) openJobById(id);
  }, [openJobById]);

  /* ---------------- turunan ---------------- */

  const facets = useMemo(() => buildFacets(jobs), [jobs]);

  const visible = useMemo(() => {
    const base = savedOnly ? jobs.filter((j) => saved.includes(j.id)) : jobs;
    return applyFilters(base, filters, profile);
  }, [jobs, filters, profile, saved, savedOnly]);

  useEffect(() => setLimit(PAGE), [filters, profile, savedOnly]);

  /* ---------------- aksi ---------------- */

  async function openDrawer(job) {
    setOpenJob(job);

    const url = new URL(window.location.href);
    url.searchParams.set("lowongan", job.id);
    window.history.replaceState(null, "", url);

    if (details[job.id]) return;

    setLoadingId(job.id);
    try {
      const params = new URLSearchParams({
        url: job.sourceUrl,
        title: job.title,
        company: job.company,
      });
      const res = await fetch(`/api/detail?${params}`);
      const data = await res.json();
      setDetails((d) => ({
        ...d,
        [job.id]: res.ok ? data : { error: data.detail || data.error || "Gagal memuat" },
      }));
    } catch (err) {
      setDetails((d) => ({ ...d, [job.id]: { error: String(err.message || err) } }));
    } finally {
      setLoadingId(null);
    }
  }

  function closeDrawer() {
    setOpenJob(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("lowongan");
    window.history.replaceState(null, "", url);
  }

  function toggleSave(id) {
    setSaved((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  /**
   * Dipanggil dari segmen ringkasan syarat di atas daftar. Tiap segmen diterjemahkan
   * ke filter yang paling mendekati maksudnya.
   */
  function quickFilter(gate, state) {
    if (gate === "lamaran") {
      setFilters((f) => ({ ...f, abroadOnly: state === "lolos" }));
    } else if (gate === "bahasa") {
      setFilters((f) => ({
        ...f,
        japanese: state === "lolos" ? "none" : state === "sebagian" ? "conversational" : "",
      }));
    } else if (gate === "lokasi") {
      setFilters((f) => ({ ...f, remoteOnly: state === "lolos" || state === "sebagian" }));
    }
    document.getElementById("hasil")?.scrollIntoView({ block: "start" });
  }

  const panelProps = {
    filters,
    onChange: setFilters,
    profile,
    onProfileChange: setProfile,
    facets,
    savedCount: saved.length,
    savedOnly,
    onSavedOnly: setSavedOnly,
  };

  const nActive = activeCount(filters);

  return (
    <>
      <GateSummary jobs={jobs} meta={meta} onQuickFilter={quickFilter} />

      <div className="shell layout" id="hasil">
        <div className="rail">
          <FilterPanel {...panelProps} />
        </div>

        <div>
          <div className="results-bar">
            <p className="results-count">
              <b>{visible.length}</b> lowongan cocok
              {nActive > 0 && ` · ${nActive} filter aktif`}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className="view-toggle" role="group" aria-label="Tampilan daftar">
                <button
                  type="button"
                  className="view-btn"
                  aria-pressed={view === "cards"}
                  onClick={() => setView("cards")}
                  title="Tampilan kartu"
                >
                  <IconGrid /> Kartu
                </button>
                <button
                  type="button"
                  className="view-btn"
                  aria-pressed={view === "table"}
                  onClick={() => setView("table")}
                  title="Tampilan tabel"
                >
                  <IconTable /> Tabel
                </button>
              </div>

              <label className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Urutkan
                <select
                  className="select"
                  style={{ width: "auto", minHeight: 38, fontSize: 13 }}
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                >
                  <option value="keterbukaan">Paling terbuka untuk asing</option>
                  {profile.active && <option value="cocok">Paling cocok dengan profil</option>}
                  <option value="gaji">Gaji tertinggi</option>
                  <option value="posisi">Nama posisi (A-Z)</option>
                  <option value="perusahaan">Perusahaan (A-Z)</option>
                </select>
              </label>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="empty">
              <Sakura variant="pita" />
              <h2>Belum ada yang cocok</h2>
              <p>
                Biasanya yang paling membuka pilihan adalah menaikkan batas bahasa Jepang
                ke &ldquo;s/d percakapan&rdquo;, atau mematikan syarat gaji minimum.
              </p>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              >
                Kosongkan filter
              </button>
            </div>
          ) : view === "table" ? (
            <JobTable
              jobs={visible.slice(0, limit)}
              saved={saved}
              onOpen={openDrawer}
              onSave={toggleSave}
            />
          ) : (
            <div className="cards">
              {visible.slice(0, limit).map((job, i) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={i}
                  saved={saved.includes(job.id)}
                  onOpen={openDrawer}
                  onSave={toggleSave}
                />
              ))}
            </div>
          )}

          {limit < visible.length && (
            <button
              type="button"
              className="btn btn-ghost btn-more"
              onClick={() => setLimit((n) => n + PAGE)}
            >
              Tampilkan {Math.min(PAGE, visible.length - limit)} lowongan berikutnya
            </button>
          )}
        </div>
      </div>

      {/* ---------- filter versi mobile ---------- */}
      <div className="fab-bar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setSheetOpen(true)}
          aria-expanded={sheetOpen}
        >
          <IconSliders /> Filter
          {nActive > 0 && <span className="badge">{nActive}</span>}
        </button>
        <span className="btn btn-ghost" aria-live="polite">
          {visible.length} hasil
        </span>
      </div>

      {sheetOpen && (
        <>
          <button className="scrim" aria-label="Tutup filter" onClick={() => setSheetOpen(false)} />
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Filter lowongan">
            <div className="sheet-grip" aria-hidden="true">
              <span />
            </div>
            <div className="sheet-body">
              <FilterPanel {...panelProps} />
            </div>
            <div className="sheet-foot">
              <button type="button" className="btn btn-primary" onClick={() => setSheetOpen(false)}>
                Lihat {visible.length} hasil
              </button>
            </div>
          </div>
        </>
      )}

      {openJob && (
        <JobDrawer
          job={visible.find((j) => j.id === openJob.id) || openJob}
          detail={details[openJob.id]}
          loading={loadingId === openJob.id}
          saved={saved.includes(openJob.id)}
          onClose={closeDrawer}
          onSave={toggleSave}
        />
      )}
    </>
  );
}
