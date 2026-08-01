"use client";

import Link from "next/link";
import Sakura from "./Sakura";

const YEN = (v) => (v ? `¥${(v / 1_000_000).toFixed(1)}jt` : "—");

/**
 * Halaman statistik berdiri sendiri. Dulu panel ini nempel di atas daftar
 * lowongan, tapi itu bikin orang yang cuma mau lihat kartu harus scroll
 * lewat tiga grafik dulu. Sekarang siapa yang penasaran datanya tinggal
 * klik "Statistik" di navigasi.
 */
export default function StatsView({ stats, meta }) {
  const maxBand = Math.max(...stats.salary.bands.map((b) => b.count), 1);
  const maxJp = Math.max(...stats.japanese.map((j) => j.count), 1);

  return (
    <div className="shell stats-page">
      <div className="stats-head">
        <Sakura variant="judul" />
        <h1>Statistik pasar</h1>
        <p>
          Dihitung dari {stats.total} lowongan yang sedang aktif di{" "}
          <Link href="/lowongan">papan lowongan</Link>. Angka ini ikut berubah tiap kali
          datanya diperbarui.
        </p>
      </div>

      <div className="tiles">
        <div className="tile">
          <div className="tile-num">{stats.openToAbroadPct}<small>%</small></div>
          <div className="tile-label">Terbuka dari luar Jepang</div>
          <div className="tile-sub">{stats.openToAbroad} dari {stats.total} lowongan</div>
        </div>
        <div className="tile">
          <div className="tile-num">{stats.noJapanesePct}<small>%</small></div>
          <div className="tile-label">Belum menuntut bahasa Jepang</div>
          <div className="tile-sub">{stats.noJapanese} lowongan</div>
        </div>
        <div className="tile">
          <div className="tile-num">{YEN(stats.salary.median)}</div>
          <div className="tile-label">Median gaji tahunan</div>
          <div className="tile-sub">Rentang tengah {YEN(stats.salary.p25)}–{YEN(stats.salary.p75)}</div>
        </div>
        <div className="tile">
          <div className="tile-num">{stats.remoteFriendlyPct}<small>%</small></div>
          <div className="tile-label">Remote atau hybrid</div>
          <div className="tile-sub">{stats.remoteFriendly} lowongan</div>
        </div>
      </div>

      <div className="charts">
        <div className="chart">
          <h3>Sebaran gaji tahunan</h3>
          <div className="bars">
            {stats.salary.bands.map((band, i) => (
              <div className="bar-col" key={band.label}>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(4, (band.count / maxBand) * 100)}%`,
                    animationDelay: `${i * 70}ms`,
                  }}
                  title={`${band.count} lowongan`}
                />
                <div className="bar-cap">{band.label}<br /><span className="mono">{band.count}</span></div>
              </div>
            ))}
          </div>
          <p className="note">
            {stats.salary.disclosedPct}% lowongan mencantumkan gaji. Yang tidak mencantumkan
            tidak masuk grafik ini.
          </p>
        </div>

        <div className="chart">
          <h3>Tuntutan bahasa Jepang</h3>
          <div className="ladder">
            {stats.japanese.map((row, i) => (
              <div className="ladder-row" key={row.key}>
                <span>{row.label}</span>
                <div className="ladder-track">
                  <div
                    className="ladder-fill"
                    style={{ width: `${(row.count / maxJp) * 100}%`, animationDelay: `${i * 60}ms` }}
                  />
                </div>
                <span className="ladder-num mono">{row.count}</span>
              </div>
            ))}
          </div>
          <p className="note">
            Tingkat &ldquo;tidak jelas&rdquo; tetap ditampilkan di daftar, karena sering
            ternyata bisa dinegosiasikan.
          </p>
        </div>

        <div className="chart">
          <h3>Teknologi yang paling dicari</h3>
          <div className="pillbox">
            {stats.stack.map((t) => (
              <span key={t.label} className="pillstat" style={{ cursor: "default" }}>
                {t.label} <b>{t.count}</b>
              </span>
            ))}
          </div>
        </div>

        <div className="chart">
          <h3>Bidang</h3>
          <div className="pillbox">
            {stats.categories.map((c) => (
              <span key={c.label} className="pillstat" style={{ cursor: "default" }}>
                {c.label} <b>{c.count}</b>
              </span>
            ))}
          </div>
        </div>

        <div className="chart">
          <h3>Kota</h3>
          <div className="pillbox">
            {stats.cities.map((c) => (
              <span key={c.label} className="pillstat" style={{ cursor: "default" }}>
                {c.label} <b>{c.count}</b>
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link href="/lowongan" className="btn btn-primary" style={{ marginTop: 28 }}>
        Lihat daftar lowongan
      </Link>
    </div>
  );
}
