"use client";

import { useEffect, useRef } from "react";
import { JP_LABEL, REMOTE_LABEL } from "@/lib/normalize";
import { searchLinks, daijobSearchLink } from "@/lib/links";
import { STYLE_LABEL } from "@/lib/companyStyle";
import { matchBand } from "@/lib/match";
import { IconClose, IconExternal } from "./Icon";
import StampLine from "./StampLine";
import CompanyAvatar from "./CompanyAvatar";

export default function JobDrawer({ job, detail, loading, saved, onClose, onSave }) {
  const closeRef = useRef(null);
  const daijob = daijobSearchLink();

  // Fokus dipindah ke tombol tutup saat panel terbuka, Esc menutupnya, dan
  // halaman di belakang dikunci supaya tidak ikut tergulir.
  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const band = job.match ? matchBand(job.match.score) : null;
  const top = job.salary.max ?? job.salary.min;

  return (
    <>
      <button className="scrim" aria-label="Tutup detail lowongan" onClick={onClose} />

      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <header className="drawer-head">
          <button
            ref={closeRef}
            type="button"
            className="drawer-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <IconClose />
          </button>

          <div className="drawer-co-row">
            <CompanyAvatar name={job.company} size="lg" />
            <div>
              <div className="label" style={{ marginBottom: 4 }}>
                {job.company} · {job.source}
              </div>
              <h2 className="drawer-title" id="drawer-title" style={{ paddingRight: 0 }}>
                {job.title}
              </h2>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <StampLine gates={job.gates} />
          </div>
        </header>

        <div className="drawer-body">
          <div className="factgrid">
            <div className="fact">
              <div className="label">Gaji tahunan</div>
              <div className="fact-val mono">{job.salary.text || "Tidak dicantumkan"}</div>
            </div>
            <div className="fact">
              <div className="label">Perkiraan rupiah</div>
              <div className="fact-val">{top ? `${job.salaryIdr}/th` : "—"}</div>
            </div>
            <div className="fact">
              <div className="label">Bahasa Jepang</div>
              <div className="fact-val">{JP_LABEL[job.japanese]}</div>
            </div>
            <div className="fact">
              <div className="label">Lokasi kerja</div>
              <div className="fact-val">
                {job.city} · {REMOTE_LABEL[job.remote]}
              </div>
            </div>
            <div className="fact">
              <div className="label">Tingkat</div>
              <div className="fact-val">{job.seniority}</div>
            </div>
            <div className="fact">
              <div className="label">Bidang</div>
              <div className="fact-val">{job.category}</div>
            </div>
            <div className="fact">
              <div className="label">Pengalaman diminta</div>
              <div className="fact-val">
                {detail?.summary?.pengalaman ||
                  (detail?.experience ? detail.experience.years : "Belum diketahui")}
              </div>
            </div>
          </div>

          {!loading && !detail?.summary?.pengalaman && detail?.experience?.context && (
            <p className="note" style={{ marginTop: 10 }}>
              Disebutkan di halaman aslinya: &ldquo;{detail.experience.context}&rdquo;
            </p>
          )}

          {!loading && detail?.companyStyle && detail.companyStyle.style !== "tidak-jelas" && (
            <div className="style-badge" data-style={detail.companyStyle.style}>
              <span className="style-badge-dot" aria-hidden="true" />
              <div>
                <span className="style-badge-label">
                  {STYLE_LABEL[detail.companyStyle.style]}
                </span>
                {detail.companyStyle.terms.length > 0 && (
                  <span className="style-badge-terms">
                    dari: {detail.companyStyle.terms.join(", ")}
                  </span>
                )}
              </div>
            </div>
          )}

          {job.match && (
            <div className="section">
              <span className="label">
                Kecocokan dengan profil kamu: {band.label} ({job.match.score}/100)
              </span>
              <div className="reasons">
                {job.match.reasons.map((r, i) => (
                  <div className="reason" key={i} data-ok={String(r.ok)}>
                    <span className="reason-icon" aria-hidden="true">
                      {r.ok === true ? "✓" : r.ok === false ? "✕" : "?"}
                    </span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {job.stack.length > 0 && (
            <div className="section">
              <span className="label">Teknologi</span>
              <div className="tagrow">
                {job.stack.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="section">
              <span className="label">Membaca halaman lowongan aslinya</span>
              <div className="skeleton" />
              <div className="skeleton" />
              <div className="skeleton" data-w="short" />
            </div>
          )}

          {!loading && detail?.error && (
            <div className="section">
              <span className="label">Deskripsi tidak bisa diambil</span>
              <p>{detail.error}</p>
            </div>
          )}

          {!loading && detail?.mode === "ringkasan" && <Summary s={detail.summary} />}

          {!loading && detail?.mode === "mentah" && (
            <div className="section">
              <span className="label">Deskripsi dari halaman sumber</span>
              <div className="raw">{detail.text}</div>
              <p className="note">{detail.note}</p>
            </div>
          )}

          {!loading && detail?.mode === "kosong" && (
            <div className="section">
              <span className="label">Deskripsi tidak tersedia</span>
              <p>{detail.note}</p>
            </div>
          )}

          <div className="section">
            <span className="label">Sumber lowongan ini</span>
            <ul className="srclist">
              <li>
                <a href={job.sourceUrl} target="_blank" rel="noreferrer noopener">
                  {job.source}, halaman asli lowongan ↗
                </a>
              </li>
              {(job.alsoOn || []).map((alt) => (
                <li key={alt.url}>
                  <a href={alt.url} target="_blank" rel="noreferrer noopener">
                    {alt.source}, versi lain dari lowongan yang sama ↗
                  </a>
                </li>
              ))}
            </ul>

            <span className="label" style={{ display: "block", margin: "18px 0 10px" }}>
              Cari lowongan ini di tempat lain
            </span>
            <div className="tagrow">
              {searchLinks(job).map((l) => (
                <a
                  key={l.url}
                  className="tag tag-link"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {l.label} ↗
                </a>
              ))}
              {job.category === "Business Analyst & DX" && (
                <a
                  className="tag tag-link"
                  href={daijob.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  title={daijob.note}
                >
                  {daijob.label} ↗
                </a>
              )}
            </div>
            <p className="note">
              Indeed, LinkedIn, dan Daijob tidak mengizinkan datanya disalin, jadi tombol
              di atas membuka pencarian mereka dengan kata kunci atau kategori yang sudah
              terisi.
            </p>
          </div>
        </div>

        <footer className="drawer-foot">
          <a
            className="btn btn-primary"
            href={job.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Lamar di {job.source} <IconExternal />
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => onSave(job.id)}>
            {saved ? "Hapus simpanan" : "Simpan"}
          </button>
        </footer>
      </aside>
    </>
  );
}

function Summary({ s }) {
  return (
    <>
      {s.ringkasan && (
        <div className="section">
          <span className="label">Tentang peran</span>
          <p>{s.ringkasan}</p>
        </div>
      )}

      <Bullets title="Tanggung jawab" items={s.tanggung_jawab} />
      <Bullets title="Syarat wajib" items={s.syarat_wajib} />
      <Bullets title="Nilai tambah" items={s.nilai_tambah} />

      {s.visa && (
        <div className="section">
          <span className="label">Visa</span>
          <p>{s.visa}</p>
        </div>
      )}

      {s.proses && (
        <div className="section">
          <span className="label">Proses seleksi</span>
          <p>{s.proses}</p>
        </div>
      )}

      <p className="note">
        Ringkasan dibuat otomatis dari halaman sumber. Selalu buka halaman aslinya
        sebelum melamar.
      </p>
    </>
  );
}

function Bullets({ title, items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="section">
      <span className="label">{title}</span>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
