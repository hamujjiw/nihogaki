// Pencocokan profil. Pengunjung mengisi level bahasa Jepang, pengalaman,
// dan teknologi yang dikuasai; setiap lowongan dapat skor 0-100 beserta
// alasannya. Semua dihitung di browser — tidak ada profil yang dikirim ke server.

import { JP_ORDER } from "./normalize.js";
import { SENIORITY_YEARS } from "./enrich.js";

export const DEFAULT_PROFILE = {
  active: false,
  japanese: "none", // level yang dikuasai pengunjung
  years: 2,
  stack: [],
  inJapan: false,
};

export const JLPT_CHOICES = [
  { value: "none", label: "Belum bisa" },
  { value: "n5", label: "N5" },
  { value: "n4", label: "N4" },
  { value: "n3", label: "N3" },
  { value: "n2", label: "N2" },
  { value: "n1", label: "N1" },
];

/**
 * Bobot dipilih supaya mencerminkan urutan hal yang benar-benar menggagalkan
 * lamaran: izin melamar dari luar Jepang lebih menentukan daripada kecocokan
 * teknologi, dan bahasa lebih menentukan daripada tingkat senioritas.
 */
const WEIGHTS = { lamaran: 32, bahasa: 30, pengalaman: 20, teknologi: 18 };

export function matchScore(job, profile) {
  if (!profile.active) return null;

  const reasons = [];
  let score = 0;

  // --- gerbang lamaran ---
  if (profile.inJapan) {
    score += WEIGHTS.lamaran;
    reasons.push({ ok: true, text: "Kamu sudah di Jepang, jadi semua lowongan terbuka" });
  } else if (job.abroad === true) {
    score += WEIGHTS.lamaran;
    reasons.push({ ok: true, text: "Menerima lamaran dari luar Jepang" });
  } else if (job.abroad === null) {
    score += WEIGHTS.lamaran * 0.4;
    reasons.push({ ok: null, text: "Status lamaran dari luar Jepang tidak disebutkan" });
  } else {
    reasons.push({ ok: false, text: "Hanya untuk yang sudah tinggal di Jepang" });
  }

  // --- gerbang bahasa ---
  const mine = JP_ORDER.indexOf(profile.japanese);
  const needed = JP_ORDER.indexOf(job.japanese);

  if (needed === -1) {
    score += WEIGHTS.bahasa * 0.5;
    reasons.push({ ok: null, text: "Syarat bahasa Jepang tidak disebutkan" });
  } else if (mine >= needed) {
    score += WEIGHTS.bahasa;
    reasons.push({
      ok: true,
      text: needed === 0 ? "Tidak menuntut bahasa Jepang" : "Level bahasa Jepang kamu memenuhi",
    });
  } else {
    const gap = needed - mine;
    score += Math.max(0, WEIGHTS.bahasa - gap * 12);
    reasons.push({
      ok: false,
      text: `Butuh bahasa Jepang ${gap} tingkat di atas level kamu`,
    });
  }

  // --- pengalaman ---
  const wanted = SENIORITY_YEARS[job.seniority] ?? 2;
  if (profile.years >= wanted) {
    score += WEIGHTS.pengalaman;
    reasons.push({ ok: true, text: `Tingkat ${job.seniority} sesuai pengalaman kamu` });
  } else {
    const gap = wanted - profile.years;
    score += Math.max(0, WEIGHTS.pengalaman - gap * 6);
    reasons.push({
      ok: false,
      text: `Tingkat ${job.seniority} biasanya minta sekitar ${wanted} tahun`,
    });
  }

  // --- teknologi ---
  if (profile.stack.length === 0) {
    score += WEIGHTS.teknologi * 0.5;
  } else if ((job.stack || []).length === 0) {
    score += WEIGHTS.teknologi * 0.5;
    reasons.push({ ok: null, text: "Lowongan tidak menyebut teknologi spesifik" });
  } else {
    const overlap = job.stack.filter((t) => profile.stack.includes(t));
    const ratio = overlap.length / Math.min(job.stack.length, 4);
    score += WEIGHTS.teknologi * Math.min(1, ratio);
    if (overlap.length > 0) {
      reasons.push({ ok: true, text: `Cocok di ${overlap.join(", ")}` });
    } else {
      reasons.push({ ok: false, text: `Menuntut ${job.stack.slice(0, 3).join(", ")}` });
    }
  }

  return { score: Math.round(Math.min(100, score)), reasons };
}

export function matchBand(score) {
  if (score >= 80) return { label: "Sangat cocok", tone: "high" };
  if (score >= 60) return { label: "Cukup cocok", tone: "mid" };
  if (score >= 40) return { label: "Perlu usaha", tone: "low" };
  return { label: "Berat", tone: "none" };
}
