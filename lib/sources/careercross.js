import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import {
  guessCategory, guessCity, normalizeJapanese, normalizeRemote,
  parseSalary, slugify,
} from "../normalize.js";

const BASE = "https://www.careercross.com";

/**
 * CareerCross adalah papan lowongan dwibahasa untuk profesional asing di
 * Jepang. Ini sumber terpenting untuk peran non-engineer: business analyst,
 * konsultan DX, project manager, ERP/SAP.
 *
 * Kategorinya memakai kode angka yang stabil di URL, jadi kita ambil
 * langsung per kategori yang relevan.
 */
const CATEGORIES = [
  { code: 8103, name: "Business Analyst" },
  { code: 8102, name: "IT Consultant" },
  { code: 8104, name: "Project Manager" },
  { code: 8118, name: "Product Manager" },
  { code: 8120, name: "ERP, SAP Specialist" },
  { code: 8121, name: "AI Specialist, Data Scientist" },
  { code: 8109, name: "Software Developer" },
  { code: 8110, name: "Web Developer" },
  { code: 7000, name: "Corporate & Business Planning" },
];

export async function fetchCareerCross({ revalidate } = {}) {
  const out = [];
  const seen = new Set();

  const pages = await Promise.allSettled(
    CATEGORIES.map((c) =>
      fetchHtml(`${BASE}/en/job-search/category-${c.code}`, { revalidate })
    )
  );

  pages.forEach((res, i) => {
    if (res.status !== "fulfilled") return;
    const $ = cheerio.load(res.value);

    $('a[href*="/job/detail-"]').each((_, el) => {
      const href = ($(el).attr("href") || "").split("?")[0];
      const m = href.match(/\/job\/detail-(\d+)/);
      const title = $(el).text().replace(/\s+/g, " ").trim();
      if (!m || !title || title.length < 4) return;

      const id = `careercross-${m[1]}`;
      if (seen.has(id)) return;
      seen.add(id);

      // Kartu lowongan berupa tabel label/nilai; naik ke pembungkusnya
      // lalu baca barisnya.
      const card = climb($, el);
      const rows = readRows($, card);
      const cardText = card.text().replace(/\s+/g, " ").trim();

      const salary = parseSalary(rows["Salary"] || "");
      const remoteRaw = /remote work/i.test(title) || /remote work/i.test(cardText)
        ? "Remote Work" : "";

      // "Remote Work" sering jadi awalan judul di CareerCross; dibuang
      // supaya judulnya bersih.
      const cleanTitle = title.replace(/^Remote Work\s*/i, "").trim();

      out.push({
        id,
        slug: slugify(cleanTitle),
        title: cleanTitle,
        company: rows["Hiring Company"] || "Perusahaan tidak disebutkan",
        companyUrl: null,
        city: guessCity(rows["Location"] || "", cleanTitle),
        japanese: normalizeJapanese(rows["Japanese Level"] || ""),
        abroad: null, // status visa hanya ada di halaman detail
        remote: normalizeRemote(remoteRaw),
        salary,
        tags: [CATEGORIES[i].name],
        category: guessCategory(cleanTitle, [CATEGORIES[i].name]),
        source: "CareerCross",
        sourceUrl: `${BASE}${href}`,
        postedAt: null,
      });
    });
  });

  return out;
}

function climb($, el) {
  let node = $(el);
  for (let i = 0; i < 7; i++) {
    const parent = node.parent();
    if (!parent || parent.length === 0) break;
    node = parent;
    if (node.find("table").length > 0 || node.text().length > 200) break;
  }
  return node;
}

/** Tabel dua kolom -> objek { label: nilai }. */
function readRows($, card) {
  const rows = {};
  card.find("tr").each((_, tr) => {
    const cells = $(tr).find("th,td");
    if (cells.length >= 2) {
      const k = $(cells[0]).text().replace(/\s+/g, " ").trim();
      const v = $(cells[1]).text().replace(/\s+/g, " ").trim();
      if (k && v && !rows[k]) rows[k] = v;
    }
  });
  return rows;
}
