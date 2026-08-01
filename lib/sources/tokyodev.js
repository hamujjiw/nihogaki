import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import {
  guessCategory,
  guessCity,
  normalizeJapanese,
  normalizeRemote,
  parseSalary,
  slugify,
} from "../normalize.js";

const BASE = "https://www.tokyodev.com";
const LIST_URL = `${BASE}/jobs`;

/**
 * TokyoDev merender seluruh daftar lowongan di HTML (bukan JS-only), dan
 * menandai tiap lowongan lewat URL tag-nya:
 *
 *   /jobs/salary-data          -> teks gaji ("¥7.0M ~ ¥11.0M")
 *   /jobs/no-japanese-required -> tanpa syarat bahasa Jepang
 *   /jobs/japanese-required    -> teks link berisi levelnya
 *   /jobs/apply-from-abroad    -> boleh melamar dari luar Jepang
 *   /jobs/residents-only       -> hanya untuk penduduk Jepang
 *   /jobs/fully-remote|partially-remote|no-remote
 *   /jobs/<slug lain>          -> tag teknologi / kategori
 *
 * Kita menelusuri semua <a> dalam urutan dokumen dan memakai URL-nya sebagai
 * penanda, bukan nama class. Nama class sering berubah; pola URL jauh lebih
 * stabil, jadi scraper ini tidak gampang patah saat mereka redesign.
 */
export async function fetchTokyoDev({ revalidate } = {}) {
  const html = await fetchHtml(LIST_URL, { revalidate });
  const $ = cheerio.load(html);

  const jobs = [];
  let company = null;
  let current = null;

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").replace(BASE, "");
    const text = $(el).text().replace(/\s+/g, " ").trim();

    const jobMatch = href.match(/^\/companies\/([^/]+)\/jobs\/([^/?#]+)/);
    const companyMatch = href.match(/^\/companies\/([^/?#]+)\/?$/);

    if (jobMatch) {
      if (!text) return; // anchor pembungkus logo, bukan judul
      current = {
        source: "TokyoDev",
        sourceUrl: `${BASE}${href}`,
        id: `tokyodev-${jobMatch[1]}-${jobMatch[2]}`,
        title: text,
        company: company || jobMatch[1].replace(/-/g, " "),
        companyUrl: `${BASE}/companies/${jobMatch[1]}`,
        salaryText: "",
        japaneseRaw: "",
        abroad: null,
        remoteRaw: "",
        tags: [],
      };
      jobs.push(current);
      return;
    }

    if (companyMatch) {
      if (text) company = text; // link judul perusahaan; link logo tidak berteks
      current = null;
      return;
    }

    if (!current) return;

    if (href.includes("/jobs/salary-data")) {
      current.salaryText = text;
    } else if (href.includes("/jobs/no-japanese-required")) {
      current.japaneseRaw = "No Japanese required";
    } else if (href.includes("/jobs/japanese-required")) {
      current.japaneseRaw = text;
    } else if (href.includes("/jobs/apply-from-abroad")) {
      current.abroad = true;
    } else if (href.includes("/jobs/residents-only")) {
      current.abroad = false;
    } else if (/\/jobs\/(fully-remote|partially-remote|no-remote)/.test(href)) {
      current.remoteRaw = text;
    } else if (/^\/jobs\/[a-z0-9+-]+$/.test(href) && text) {
      current.tags.push(text);
    }
  });

  return jobs.map(toJob);
}

function toJob(raw) {
  const salary = parseSalary(raw.salaryText);
  const tags = [...new Set(raw.tags)].slice(0, 8);

  return {
    id: raw.id,
    slug: slugify(`${raw.company}-${raw.title}`),
    title: raw.title,
    company: raw.company,
    companyUrl: raw.companyUrl,
    city: guessCity(raw.title),
    japanese: normalizeJapanese(raw.japaneseRaw),
    abroad: raw.abroad,
    remote: normalizeRemote(raw.remoteRaw),
    salary,
    tags,
    category: guessCategory(raw.title, tags),
    source: raw.source,
    sourceUrl: raw.sourceUrl,
  };
}
