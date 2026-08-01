"use client";

import { GATE_LABEL } from "@/lib/enrich";

const ORDER = ["lolos", "sebagian", "tidak-jelas", "terkunci"];

const SEG_LABEL = {
  bahasa: {
    lolos: "belum menuntut bahasa Jepang",
    sebagian: "cukup N5 sampai N3",
    "tidak-jelas": "syarat bahasa tidak disebutkan",
    terkunci: "menuntut N2 ke atas",
  },
  lamaran: {
    lolos: "menerima lamaran dari luar Jepang",
    sebagian: "sebagian menerima",
    "tidak-jelas": "status tidak disebutkan",
    terkunci: "hanya untuk yang sudah di Jepang",
  },
  lokasi: {
    lolos: "remote penuh",
    sebagian: "hybrid",
    "tidak-jelas": "tidak disebutkan",
    terkunci: "wajib di kantor",
  },
};

/**
 * Versi ringkas dari tiga syarat, untuk di atas daftar lowongan.
 * Judul besar sudah pindah ke halaman sambutan, jadi di sini yang tersisa
 * hanya alat bacanya sendiri. Tiap segmen bisa diklik untuk menyaring.
 */
export default function GateSummary({ jobs, meta, onQuickFilter }) {
  const rows = ["bahasa", "lamaran", "lokasi"].map((key) => {
    const counts = ORDER.map((state) => ({
      state,
      count: jobs.filter((j) => j.gates[key] === state).length,
    }));
    const total = jobs.length || 1;
    const passing = counts.find((c) => c.state === "lolos")?.count || 0;
    return { key, counts, total, passing };
  });

  return (
    <section className="shell gate-summary">
      <div className="route">
        <div className="route-head">
          <h2 className="label">Tiga syarat · {jobs.length} lowongan</h2>
          <span className="label">Klik untuk menyaring</span>
        </div>

        <div className="route-cols">
          {rows.map((row) => (
            <div className="route-row" key={row.key}>
              <div className="route-row-top">
                <b>{GATE_LABEL[row.key]}</b>
                <span>{Math.round((row.passing / row.total) * 100)}% terbuka</span>
              </div>
              <div className="route-track">
                {row.counts
                  .filter((c) => c.count > 0)
                  .map((c) => (
                    <button
                      key={c.state}
                      type="button"
                      className="route-seg"
                      data-state={c.state}
                      style={{ flex: c.count }}
                      onClick={() => onQuickFilter(row.key, c.state)}
                      title={`${c.count} lowongan ${SEG_LABEL[row.key][c.state]}`}
                      aria-label={`Saring: ${c.count} lowongan ${SEG_LABEL[row.key][c.state]}`}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>

        <p className="route-foot">
          Hijau berarti syarat itu terpenuhi, kuning bisa diusahakan, merah pudar
          tertutup dari luar Jepang. Kurs: <span className="mono">¥1 ≈ Rp {meta.fx?.rate}</span>
          {meta.excludedSenior > 0 && ` · ${meta.excludedSenior} lowongan tingkat senior disaring keluar`}.
        </p>
      </div>
    </section>
  );
}
