// Statistik yang dihitung sekali di server dan dipakai panel ringkasan.
// Semua angka berasal dari data yang sama yang ditampilkan di daftar, jadi
// tidak ada risiko panel dan daftar bercerita beda.

const SALARY_BANDS = [
  { label: "< ¥6jt", min: 0, max: 6_000_000 },
  { label: "¥6–8jt", min: 6_000_000, max: 8_000_000 },
  { label: "¥8–10jt", min: 8_000_000, max: 10_000_000 },
  { label: "¥10–14jt", min: 10_000_000, max: 14_000_000 },
  { label: "≥ ¥14jt", min: 14_000_000, max: Infinity },
];

export function computeStats(jobs) {
  const total = jobs.length || 1;

  const openToAbroad = jobs.filter((j) => j.abroad === true).length;
  const noJapanese = jobs.filter((j) => j.japanese === "none").length;
  const remoteFriendly = jobs.filter((j) => j.remote === "full" || j.remote === "hybrid").length;

  const withSalary = jobs.filter((j) => j.salary.max || j.salary.min);
  const tops = withSalary
    .map((j) => j.salary.max ?? j.salary.min)
    .sort((a, b) => a - b);

  return {
    total: jobs.length,
    openToAbroad,
    openToAbroadPct: Math.round((openToAbroad / total) * 100),
    noJapanese,
    noJapanesePct: Math.round((noJapanese / total) * 100),
    remoteFriendly,
    remoteFriendlyPct: Math.round((remoteFriendly / total) * 100),

    salary: {
      median: tops.length ? tops[Math.floor(tops.length / 2)] : null,
      p25: tops.length ? tops[Math.floor(tops.length * 0.25)] : null,
      p75: tops.length ? tops[Math.floor(tops.length * 0.75)] : null,
      disclosedPct: Math.round((withSalary.length / total) * 100),
      bands: SALARY_BANDS.map((b) => ({
        label: b.label,
        count: withSalary.filter((j) => {
          const v = j.salary.max ?? j.salary.min;
          return v >= b.min && v < b.max;
        }).length,
      })),
    },

    japanese: distribution(jobs, "japanese", {
      none: "Belum perlu",
      n5: "Setara N5",
      n4: "Setara N4",
      n3: "Setara N3",
      n2: "Setara N2",
      n1: "Setara N1",
      unknown: "Tidak jelas",
    }),

    categories: topCounts(jobs, (j) => j.category, 8),
    cities: topCounts(jobs, (j) => j.city, 6),
    stack: topCounts(jobs.flatMap((j) => j.stack || []), (t) => t, 12),
    seniority: topCounts(jobs, (j) => j.seniority, 5),
  };
}

function distribution(jobs, key, labels) {
  const counts = new Map();
  for (const job of jobs) {
    const k = job[key] || "unknown";
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return Object.entries(labels)
    .map(([k, label]) => ({ key: k, label, count: counts.get(k) || 0 }))
    .filter((row) => row.count > 0);
}

function topCounts(items, pick, limit) {
  const counts = new Map();
  for (const item of items) {
    const k = pick(item);
    if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
