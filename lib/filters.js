import { JP_ORDER } from "./normalize.js";
import { matchScore } from "./match.js";
import { LEVELS } from "./enrich.js";

export const DEFAULT_FILTERS = {
  q: "",
  category: "",
  seniority: "",
  japanese: "",
  stack: [],
  abroadOnly: true,
  remoteOnly: false,
  disclosedSalaryOnly: false,
  minSalary: 0,
  city: "",
  source: "",
  sort: "keterbukaan",
};

/**
 * Batas level bahasa Jepang bersifat maksimum: memilih "s/d percakapan" ikut
 * menampilkan yang tanpa Jepang dan Jepang dasar. Lowongan yang levelnya tidak
 * disebutkan tetap ditampilkan supaya tidak ada peluang yang hilang diam-diam.
 */
function passesJapanese(job, limit) {
  if (!limit) return true;
  if (job.japanese === "unknown") return true;
  const max = JP_ORDER.indexOf(limit);
  const level = JP_ORDER.indexOf(job.japanese);
  return level !== -1 && level <= max;
}

/**
 * Menyaring dan mengurutkan. Kalau profil aktif, tiap lowongan juga mendapat
 * `match` yang ditempel di objek hasil, tanpa mengubah data aslinya.
 */
export function applyFilters(jobs, f, profile) {
  const q = f.q.trim().toLowerCase();

  const filtered = jobs.filter((job) => {
    if (f.abroadOnly && job.abroad !== true) return false;
    if (f.remoteOnly && !(job.remote === "full" || job.remote === "hybrid")) return false;
    if (f.category && job.category !== f.category) return false;
    if (f.seniority && job.seniority !== f.seniority) return false;
    if (f.city && job.city !== f.city) return false;
    if (f.source && job.source !== f.source) return false;
    if (!passesJapanese(job, f.japanese)) return false;

    const top = job.salary.max ?? job.salary.min;
    if (f.disclosedSalaryOnly && !top) return false;
    if (f.minSalary > 0 && (!top || top < f.minSalary)) return false;

    if (f.stack.length > 0) {
      const has = f.stack.some((t) => (job.stack || []).includes(t));
      if (!has) return false;
    }

    if (q) {
      const haystack = [
        job.title,
        job.company,
        job.city,
        job.category,
        ...(job.stack || []),
        ...job.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const scored = filtered.map((job) => {
    const match = matchScore(job, profile);
    return match ? { ...job, match } : job;
  });

  return sortJobs(scored, f.sort, profile);
}

function sortJobs(jobs, sort, profile) {
  const copy = [...jobs];

  if (sort === "cocok" && profile?.active) {
    return copy.sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
  }
  if (sort === "gaji") {
    return copy.sort(
      (a, b) => (b.salary.max || b.salary.min || 0) - (a.salary.max || a.salary.min || 0)
    );
  }
  if (sort === "perusahaan") {
    return copy.sort((a, b) => a.company.localeCompare(b.company, "id"));
  }
  if (sort === "posisi") {
    return copy.sort((a, b) => a.title.localeCompare(b.title, "id"));
  }

  // Default: paling terbuka untuk pelamar yang masih di Indonesia.
  return copy.sort(
    (a, b) => b.openness - a.openness || (b.salary.max || 0) - (a.salary.max || 0)
  );
}

/** Nilai unik untuk mengisi pilihan filter, diambil dari data yang benar-benar ada. */
export function facets(jobs) {
  const uniq = (pick) => [...new Set(jobs.map(pick).filter(Boolean))].sort();
  const stackCounts = new Map();

  for (const job of jobs) {
    for (const tech of job.stack || []) {
      stackCounts.set(tech, (stackCounts.get(tech) || 0) + 1);
    }
  }

  return {
    categories: uniq((j) => j.category),
    cities: uniq((j) => j.city),
    sources: uniq((j) => j.source),
    seniorities: LEVELS.filter((s) => jobs.some((j) => j.seniority === s)),
    stack: [...stackCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 18)
      .map(([label, count]) => ({ label, count })),
  };
}

/** Berapa filter yang sedang aktif — dipakai untuk lencana tombol filter di mobile. */
export function activeCount(f) {
  let n = 0;
  if (f.q) n++;
  if (f.category) n++;
  if (f.seniority) n++;
  if (f.japanese) n++;
  if (f.stack.length) n++;
  if (!f.abroadOnly) n++;
  if (f.remoteOnly) n++;
  if (f.disclosedSalaryOnly) n++;
  if (f.minSalary) n++;
  if (f.city) n++;
  if (f.source) n++;
  return n;
}
