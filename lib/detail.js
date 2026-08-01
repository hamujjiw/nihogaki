import * as cheerio from "cheerio";
import { fetchHtml } from "./http.js";
import { extractExperience, experienceContext } from "./requirements.js";

const MAX_CHARS = 9000;

/** Ambil isi halaman lowongan asli dan bersihkan jadi teks biasa. */
export async function extractDescription(url) {
  const html = await fetchHtml(url, { revalidate: 86400 });
  const $ = cheerio.load(html);

  $("script, style, noscript, nav, header, footer, form, svg, iframe").remove();

  const candidates = ["main", "article", '[role="main"]', "#content", "body"];
  let best = "";

  for (const sel of candidates) {
    const text = $(sel).first().text();
    if (text && text.length > best.length) best = text;
    if (best.length > 1500) break;
  }

  const clean = best
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, MAX_CHARS);

  return clean;
}

/**
 * Kalau ANTHROPIC_API_KEY diisi, teks mentah diringkas ke Bahasa Indonesia.
 * Kalau tidak, fungsi ini mengembalikan null dan pemanggilnya menampilkan
 * teks aslinya, dilengkapi info pengalaman yang diambil lewat pencarian pola
 * di requirements.js (itu selalu jalan, dengan atau tanpa API key).
 */
export async function summarize({ title, company, text }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

  const prompt = `Berikut isi halaman lowongan "${title}" di ${company}.

--- ISI HALAMAN ---
${text}
--- SELESAI ---

Rangkum untuk pembaca Indonesia yang sedang mempertimbangkan melamar.
Balas HANYA JSON valid, tanpa markdown, tanpa kalimat pembuka:

{
  "ringkasan": "2 kalimat: perannya apa dan produk/tim apa yang dikerjakan",
  "pengalaman": "berapa tahun pengalaman yang diminta, tulis persis seperti yang tertulis di halaman (contoh: '2+ tahun', '3-5 tahun', 'terbuka untuk fresh graduate'); tulis 'Tidak disebutkan' kalau memang tidak ada",
  "tanggung_jawab": ["3-5 poin"],
  "syarat_wajib": ["4-6 poin, selain pengalaman kerja karena itu sudah di field terpisah"],
  "nilai_tambah": ["2-4 poin"],
  "visa": "1-2 kalimat soal sponsorship visa dan apakah bisa melamar dari luar Jepang; tulis 'Tidak disebutkan di halaman ini' kalau memang tidak ada",
  "proses": "1 kalimat soal tahapan seleksi kalau disebutkan, selain itu string kosong"
}

Tulis dalam Bahasa Indonesia; istilah teknis biarkan dalam bahasa aslinya.
Jangan mengarang informasi yang tidak ada di teks.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API membalas ${res.status}`);

  const data = await res.json();
  const out = (data.content || []).map((b) => (b.type === "text" ? b.text : "")).join("\n");
  return parseJson(out);
}

/**
 * Info pengalaman dari pencarian pola langsung di teks mentah. Ini yang
 * dipakai kalau tidak ada API key, dan juga dipakai sebagai pengecekan
 * silang kalaupun ada ringkasan AI - jadi field pengalaman tidak pernah
 * kosong begitu saja kalau teksnya sebenarnya menyebutkan angkanya.
 */
export function experienceFromText(text) {
  const years = extractExperience(text);
  if (!years) return null;
  return { years, context: experienceContext(text) };
}

function parseJson(raw) {
  const clean = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Ringkasan tidak terbaca");
  return JSON.parse(clean.slice(start, end + 1));
}
