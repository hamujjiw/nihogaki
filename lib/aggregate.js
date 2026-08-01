import { unstable_cache } from "next/cache";
import { fetchTokyoDev } from "./sources/tokyodev.js";
import { fetchJapanDev } from "./sources/japandev.js";
import { fetchCareerCross } from "./sources/careercross.js";
import { fetchKapanJepan } from "./sources/kapanjepan.js";
import { fetchAts, COMPANIES } from "./sources/ats.js";
import { dedupeKey } from "./normalize.js";
import { enrich, isEntryToMid } from "./enrich.js";
import { computeStats } from "./stats.js";
import { getJpyToIdr } from "./fx.js";

export const JOBS_TAG = "jobs";
const TTL_SECONDS = 1800; // 30 menit

const SOURCES = [
  { name: "TokyoDev", run: fetchTokyoDev },
  { name: "Japan Dev", run: fetchJapanDev },
  { name: "CareerCross", run: fetchCareerCross },
  { name: "KapanJepan", run: fetchKapanJepan },
  // Hanya diikutkan kalau ada perusahaan yang didaftarkan di lib/sources/ats.js
  ...(COMPANIES.length > 0 ? [{ name: "Halaman karier (ATS)", run: fetchAts }] : []),
];

/**
 * Alur data lengkap: ambil paralel -> deduplikasi -> perkaya -> hitung statistik.
 * Sumber yang gagal dicatat di meta.sources dan tidak menjatuhkan yang lain,
 * jadi halaman tetap tampil dengan data yang berhasil didapat.
 */
async function collect() {
  const [settled, fx] = await Promise.all([
    Promise.allSettled(SOURCES.map((s) => s.run({ revalidate: TTL_SECONDS }))),
    getJpyToIdr(),
  ]);

  const meta = [];
  let all = [];

  settled.forEach((res, i) => {
    const name = SOURCES[i].name;
    if (res.status === "fulfilled") {
      meta.push({ name, ok: true, count: res.value.length });
      all = all.concat(res.value);
    } else {
      meta.push({
        name,
        ok: false,
        count: 0,
        error: String(res.reason?.message || res.reason),
      });
    }
  });

  const enriched = dedupe(all).map((job) => enrich(job, fx.rate));

  // Papan ini khusus fresh graduate sampai menengah. Lowongan senior dan
  // lead disaring keluar di sini, bukan disembunyikan lewat filter, supaya
  // seluruh statistik di halaman juga ikut mencerminkan cakupan itu.
  const jobs = enriched
    .filter(isEntryToMid)
    .sort((a, b) => b.openness - a.openness || (b.salary.max || 0) - (a.salary.max || 0));

  return {
    jobs,
    stats: computeStats(jobs),
    meta: {
      sources: meta,
      total: jobs.length,
      fetchedAt: new Date().toISOString(),
      fx: { rate: Math.round(fx.rate), live: fx.live },
      excludedSenior: enriched.length - jobs.length,
    },
  };
}

/**
 * Satu lowongan sering muncul di dua papan sekaligus. Kita simpan satu entri,
 * mencatat papan lain di `alsoOn`, dan mengambil field paling lengkap dari
 * kedua versi — misalnya gaji dari yang satu, status visa dari yang lain.
 */
function dedupe(list) {
  const map = new Map();

  for (const job of list) {
    const key = dedupeKey(job.company, job.title);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { ...job, alsoOn: [] });
      continue;
    }

    existing.alsoOn.push({ source: job.source, url: job.sourceUrl });
    if (!existing.salary.text && job.salary.text) existing.salary = job.salary;
    if (existing.abroad === null && job.abroad !== null) existing.abroad = job.abroad;
    if (existing.japanese === "unknown") existing.japanese = job.japanese;
    if (existing.remote === "unknown") existing.remote = job.remote;
    if (existing.city === "Jepang") existing.city = job.city;
    if (existing.tags.length === 0) existing.tags = job.tags;
    if (!existing.postedAt && job.postedAt) existing.postedAt = job.postedAt;
  }

  return [...map.values()];
}

/** Versi ter-cache; dipakai halaman utama, /api/jobs, dan /api/stats. */
export const getJobs = unstable_cache(collect, ["jobs-aggregate-v3"], {
  revalidate: TTL_SECONDS,
  tags: [JOBS_TAG],
});
