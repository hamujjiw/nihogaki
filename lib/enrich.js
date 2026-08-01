// Lapisan pengayaan. Sumber hanya memberi label mentah; di sini label itu
// diubah menjadi hal-hal yang benar-benar dipakai pengunjung untuk memutuskan.

import { JP_ORDER } from "./normalize.js";
import { monthlyRupiah, toRupiah } from "./format.js";

/**
 * Tiga syarat yang menentukan apakah sebuah lowongan bisa dilamar oleh
 * seseorang yang masih berada di Indonesia.
 */
export function gatesOf(job) {
  const jpRank = JP_ORDER.indexOf(job.japanese);
  const bahasa =
    job.japanese === "unknown" ? "tidak-jelas"
    : jpRank === 0 ? "lolos"
    : jpRank <= 3 ? "sebagian"   // N5 sampai N3 masih realistis dikejar
    : "terkunci";                 // N2 ke atas

  const lamaran =
    job.abroad === true ? "lolos" : job.abroad === false ? "terkunci" : "tidak-jelas";

  const lokasi =
    job.remote === "full" ? "lolos"
    : job.remote === "hybrid" ? "sebagian"
    : job.remote === "onsite" ? "terkunci"
    : "tidak-jelas";

  return { bahasa, lamaran, lokasi };
}

export const GATE_LABEL = { bahasa: "Bahasa", lamaran: "Lamaran", lokasi: "Lokasi" };

export function opennessOf(job) {
  let score = 0;
  if (job.abroad === true) score += 45;
  else if (job.abroad === null) score += 12;

  const jp = { none: 35, n5: 30, n4: 26, n3: 18, n2: 5, n1: 0 };
  score += jp[job.japanese] ?? 10;

  if (job.remote === "full") score += 14;
  else if (job.remote === "hybrid") score += 8;
  if (job.salary.max) score += 6;

  return Math.min(100, score);
}

/**
 * Tingkat karier. Papan ini sengaja dibatasi ke fresh graduate sampai
 * menengah, jadi senior dan lead dikenali khusus supaya bisa disaring
 * keluar di lib/aggregate.js.
 */
const SENIORITY_RULES = [
  ["Fresh graduate", /\b(intern|internship|magang|trainee|fresh ?grad|graduate program|new grad|未経験歓迎|第二新卒)\b/i],
  ["Senior ke atas", /\b(senior|sr\.?|lead|principal|staff engineer|manager|head of|director|\bvp\b|chief|architect|executive|シニア|マネージャー)\b/i],
  ["Junior", /\b(junior|jr\.?|entry|associate|assistant|young|20代)\b/i],
];

export function seniorityOf(title = "") {
  for (const [label, re] of SENIORITY_RULES) {
    if (re.test(title)) return label;
  }
  return "Menengah";
}

/** Tingkat yang ditampilkan di papan. "Senior ke atas" sengaja tidak ada. */
export const LEVELS = ["Fresh graduate", "Junior", "Menengah"];

export function isEntryToMid(job) {
  return LEVELS.includes(job.seniority);
}

export const SENIORITY_YEARS = {
  "Fresh graduate": 0,
  Junior: 1,
  Menengah: 3,
  "Senior ke atas": 6,
};

const STACK_CANON = {
  "react.js": "React", reactjs: "React", react: "React",
  "next.js": "Next.js", nextjs: "Next.js",
  "node.js": "Node.js", nodejs: "Node.js",
  "vue.js": "Vue", vuejs: "Vue",
  golang: "Go", go: "Go",
  typescript: "TypeScript", javascript: "JavaScript", python: "Python",
  java: "Java", kotlin: "Kotlin", swift: "Swift", ruby: "Ruby",
  rails: "Ruby", php: "PHP", rust: "Rust", "c++": "C++", "c#": "C#",
  aws: "AWS", gcp: "GCP", azure: "Azure", kubernetes: "Kubernetes",
  docker: "Docker", terraform: "Terraform", sql: "SQL",
  "react native": "React Native", flutter: "Flutter", unity: "Unity",
  sap: "SAP", salesforce: "Salesforce", tableau: "Tableau",
  "power bi": "Power BI", excel: "Excel", figma: "Figma",
};

const STACK_VALUES = [...new Set(Object.values(STACK_CANON))];

export function canonStack(tags = [], title = "") {
  const found = new Set();
  for (const tag of tags) {
    const hit = STACK_CANON[String(tag).toLowerCase().trim()];
    if (hit) found.add(hit);
  }
  for (const tech of STACK_VALUES) {
    const re = new RegExp(`(^|[^a-z])${escapeRe(tech)}([^a-z]|$)`, "i");
    if (re.test(title)) found.add(tech);
  }
  return [...found].sort();
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function knownStack() {
  return [...STACK_VALUES].sort();
}

export function enrich(job, fxRate) {
  const gates = gatesOf(job);
  const stack = canonStack(job.tags, job.title);
  const top = job.salary.max ?? job.salary.min;

  return {
    ...job,
    gates,
    stack,
    seniority: seniorityOf(job.title),
    openness: opennessOf(job),
    japaneseRank: JP_ORDER.indexOf(job.japanese),
    salaryIdr: top ? toRupiah(top, fxRate) : "",
    salaryIdrMonthly: top ? monthlyRupiah(top, fxRate) : "",
  };
}
