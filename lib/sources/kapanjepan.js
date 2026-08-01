import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import {
  guessCategory, guessCity, normalizeRemote, parseSalary, slugify,
} from "../normalize.js";

const BASE = "https://kapanjepan.com";

/**
 * KapanJepan dijalankan oleh Career Diversity Inc. dan memang menyasar
 * pelamar Indonesia — mereka punya izin resmi penyaluran kerja dari
 * pemerintah Jepang. Karena itu semua lowongannya diasumsikan terbuka
 * untuk pelamar dari Indonesia (abroad = true); itu memang alasan
 * platformnya ada.
 */
const LIST_URLS = [
  `${BASE}/jobs`,
  `${BASE}/jobs-categories/it-telecommunications/`,
  `${BASE}/jobs-categories/business-operations/`,
  `${BASE}/jobs-categories/hr-finance-administration/`,
  `${BASE}/jobs-categories/marketing-sales/`,
];

export async function fetchKapanJepan({ revalidate } = {}) {
  const out = [];
  const seen = new Set();

  const pages = await Promise.allSettled(
    LIST_URLS.map((u) => fetchHtml(u, { revalidate }))
  );

  for (const res of pages) {
    if (res.status !== "fulfilled") continue;
    const $ = cheerio.load(res.value);

    $('a[href*="/jobs/"]').each((_, el) => {
      const href = ($(el).attr("href") || "").replace(BASE, "").split("?")[0];
      const title = $(el).text().replace(/\s+/g, " ").trim();

      // Pola: /jobs/<kategori>/<slug>/  — hindari halaman kategori & tipe.
      const m = href.match(/^\/jobs\/([a-z0-9-]+)\/([a-z0-9-]+)\/?$/i);
      if (!m || !title || title.length < 4) return;
      if (/^\/jobs-(categories|type|location)/.test(href)) return;

      const id = `kapanjepan-${m[2]}`;
      if (seen.has(id)) return;
      seen.add(id);

      const card = climb($, el);
      const cardText = card.text().replace(/\s+/g, " ").trim();

      const company = card
        .find('a[href*="/companies/"]')
        .filter((_, a) => $(a).text().trim().length > 0)
        .first().text().trim();

      const locationLink = card.find('a[href*="/jobs-location/"]').first().text().trim();
      const typeLink = card.find('a[href*="/jobs-type/"]').first().text().trim();

      out.push({
        id,
        slug: slugify(title),
        title,
        company: company || "Klien KapanJepan",
        companyUrl: null,
        city: guessCity(locationLink, cardText),
        japanese: "unknown", // tidak ditandai di halaman daftar
        abroad: true,
        remote: normalizeRemote(/remote/i.test(locationLink) ? "Full Remote" : ""),
        salary: parseSalary(cardText),
        tags: [m[1].replace(/-/g, " "), typeLink].filter(Boolean),
        category: guessCategory(title, [m[1].replace(/-/g, " ")]),
        source: "KapanJepan",
        sourceUrl: `${BASE}${href}`,
        postedAt: null,
      });
    });
  }

  return out;
}

function climb($, el) {
  let node = $(el);
  for (let i = 0; i < 6; i++) {
    const parent = node.parent();
    if (!parent || parent.length === 0) break;
    node = parent;
    if (node.text().replace(/\s+/g, " ").trim().length > 80) break;
  }
  return node;
}
