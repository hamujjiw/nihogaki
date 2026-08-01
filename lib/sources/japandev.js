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

const BASE = "https://japan-dev.com";

/**
 * Japan Dev punya beberapa halaman daftar statis yang sudah tersaring.
 * Dua halaman ini yang paling relevan untuk pelamar dari Indonesia,
 * plus beranda sebagai cadangan kalau salah satu berubah.
 */
const LIST_URLS = [
  `${BASE}/japan-jobs-relocation`, // Apply from Overseas
  `${BASE}/jobs-in-japan-for-english-speakers`, // No Japanese Required
  `${BASE}/`,
];

/**
 * Struktur kartu Japan Dev tidak seragam seperti TokyoDev, jadi pendekatannya:
 * temukan anchor judul (/jobs/<perusahaan>/<slug> yang punya teks), lalu naik
 * ke elemen pembungkus terdekat yang isinya cukup panjang untuk jadi satu
 * kartu, dan baca penandanya dari teks kartu itu.
 */
export async function fetchJapanDev({ revalidate } = {}) {
  const results = [];
  const seen = new Set();

  for (const url of LIST_URLS) {
    let html;
    try {
      html = await fetchHtml(url, { revalidate });
    } catch {
      continue; // satu halaman gagal bukan alasan menggagalkan sumbernya
    }

    const $ = cheerio.load(html);

    $("a[href]").each((_, el) => {
      const href = ($(el).attr("href") || "").replace(BASE, "");
      const title = $(el).text().replace(/\s+/g, " ").trim();
      const m = href.match(/^\/jobs\/([^/]+)\/([^/?#]+)$/);
      if (!m || !title || title.length < 3) return;

      const id = `japandev-${m[2]}`;
      if (seen.has(id)) return;
      seen.add(id);

      const card = climbToCard($, el);
      const cardText = card.text().replace(/\s+/g, " ").trim();

      const companyLink = card
        .find(`a[href*="/companies/"]`)
        .filter((_, a) => $(a).text().trim().length > 0)
        .first();

      const tags = card
        .find('a[href*="-jobs-in-japan"]')
        .map((_, a) => $(a).text().trim())
        .get()
        .filter(Boolean);

      const remoteRaw = /full remote/i.test(cardText)
        ? "Full Remote"
        : /partial remote/i.test(cardText)
        ? "Partial Remote"
        : "";

      const abroad = /apply from abroad|apply from overseas/i.test(cardText)
        ? true
        : /residents only/i.test(cardText)
        ? false
        : null;

      const japaneseRaw = /japanese required/i.test(cardText)
        ? "Japanese Required"
        : /no japanese/i.test(cardText)
        ? "No Japanese required"
        : "";

      const company =
        companyLink.text().trim() || m[1].replace(/-/g, " ").trim();
      const salary = parseSalary(cardText);
      const uniqueTags = [...new Set(tags)].slice(0, 8);

      results.push({
        id,
        slug: slugify(`${company}-${title}`),
        title: title.replace(/\.\.\.$/, ""),
        company,
        companyUrl: companyLink.attr("href")
          ? absolute(companyLink.attr("href"))
          : null,
        city: guessCity(cardText, title),
        japanese: normalizeJapanese(japaneseRaw),
        abroad,
        remote: normalizeRemote(remoteRaw),
        salary,
        tags: uniqueTags,
        category: guessCategory(title, uniqueTags),
        source: "Japan Dev",
        sourceUrl: absolute(href),
      });
    });
  }

  return results;
}

function climbToCard($, el) {
  let node = $(el);
  for (let i = 0; i < 6; i++) {
    const parent = node.parent();
    if (!parent || parent.length === 0) break;
    node = parent;
    if (node.text().replace(/\s+/g, " ").trim().length > 60) break;
  }
  return node;
}

function absolute(href = "") {
  return href.startsWith("http") ? href : `${BASE}${href}`;
}
