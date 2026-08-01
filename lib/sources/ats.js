import {
  guessCategory,
  guessCity,
  normalizeJapanese,
  normalizeRemote,
  parseSalary,
  slugify,
} from "../normalize.js";

/**
 * Adaptor untuk papan lowongan ATS yang menyediakan JSON publik tanpa kunci API.
 * Ini jalur paling bersih untuk menambah sumber: bukan scraping HTML, jadi tidak
 * akan patah saat situsnya di-redesign.
 *
 * Cara menambah perusahaan:
 *   1. Buka halaman karier perusahaan itu dan lihat URL papan lowongannya.
 *      Greenhouse -> boards.greenhouse.io/<token>
 *      Lever      -> jobs.lever.co/<token>
 *      Ashby      -> jobs.ashbyhq.com/<token>
 *   2. Tambahkan satu baris ke COMPANIES di bawah.
 *   3. Selesai. Sumber yang gagal dicatat di footer dan tidak menjatuhkan yang lain.
 *
 * Sengaja dibiarkan kosong: token harus diverifikasi satu per satu, dan
 * mengisinya dengan tebakan hanya akan menghasilkan sumber yang selalu gagal.
 * TokyoDev dan Japan Dev sudah mencakup mayoritas lowongan yang relevan.
 */
export const COMPANIES = [
  // { name: "Contoh Corp", ats: "greenhouse", token: "examplecorp" },
  // { name: "Contoh Dua",  ats: "lever",      token: "contohdua" },
  // { name: "Contoh Tiga", ats: "ashby",      token: "contohtiga" },
];

const ENDPOINTS = {
  greenhouse: (t) => `https://boards-api.greenhouse.io/v1/boards/${t}/jobs?content=true`,
  lever: (t) => `https://api.lever.co/v0/postings/${t}?mode=json`,
  ashby: (t) => `https://api.ashbyhq.com/posting-api/job-board/${t}`,
};

const PARSERS = { greenhouse: fromGreenhouse, lever: fromLever, ashby: fromAshby };

export async function fetchAts({ revalidate = 1800 } = {}) {
  if (COMPANIES.length === 0) return [];

  const batches = await Promise.allSettled(
    COMPANIES.map(async (company) => {
      const url = ENDPOINTS[company.ats]?.(company.token);
      if (!url) throw new Error(`ATS "${company.ats}" tidak dikenal`);

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate },
      });
      if (!res.ok) throw new Error(`${company.name} membalas ${res.status}`);

      const data = await res.json();
      return PARSERS[company.ats](data, company);
    })
  );

  return batches
    .filter((b) => b.status === "fulfilled")
    .flatMap((b) => b.value)
    .filter(isJapanTechRole);
}

/* ---------------- parser per ATS ---------------- */

function fromGreenhouse(data, company) {
  return (data.jobs || []).map((j) =>
    shape({
      company,
      id: `gh-${company.token}-${j.id}`,
      title: j.title,
      location: j.location?.name || "",
      url: j.absolute_url,
      body: stripHtml(j.content || ""),
      postedAt: j.updated_at || null,
    })
  );
}

function fromLever(data, company) {
  return (Array.isArray(data) ? data : []).map((j) =>
    shape({
      company,
      id: `lever-${company.token}-${j.id}`,
      title: j.text,
      location: j.categories?.location || "",
      url: j.hostedUrl,
      body: stripHtml(j.descriptionPlain || j.description || ""),
      postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
    })
  );
}

function fromAshby(data, company) {
  return (data.jobs || []).map((j) =>
    shape({
      company,
      id: `ashby-${company.token}-${j.id}`,
      title: j.title,
      location: j.location || "",
      url: j.jobUrl,
      body: stripHtml(j.descriptionHtml || ""),
      postedAt: j.publishedAt || null,
    })
  );
}

/* ---------------- penyeragaman ---------------- */

function shape({ company, id, title, location, url, body, postedAt }) {
  const text = `${title} ${body}`.slice(0, 4000);

  // ATS tidak punya label seperti TokyoDev, jadi penandanya dibaca dari teks.
  const japanese = /no japanese|english[- ]?(only|speaking)/i.test(text)
    ? "none"
    : /business[- ]level japanese|fluent japanese|native japanese/i.test(text)
    ? "business"
    : /conversational japanese|japanese.{0,20}(n3|n2)/i.test(text)
    ? "conversational"
    : "unknown";

  const abroad = /visa (sponsorship|support)|relocation (support|package)|apply from (abroad|overseas)/i.test(
    text
  )
    ? true
    : /must (already )?(reside|be located|live) in japan|japan residents only/i.test(text)
    ? false
    : null;

  const remote = /fully remote|remote[- ]first|work from anywhere/i.test(text)
    ? "Full Remote"
    : /hybrid|partially remote/i.test(text)
    ? "Partial Remote"
    : /on[- ]?site|in[- ]office/i.test(text)
    ? "No Remote"
    : "";

  return {
    id,
    slug: slugify(`${company.name}-${title}`),
    title,
    company: company.name,
    companyUrl: null,
    city: guessCity(location, title),
    japanese: normalizeJapanese(japanese === "none" ? "No Japanese required" : japanese),
    abroad,
    remote: normalizeRemote(remote),
    salary: parseSalary(text),
    tags: [],
    category: guessCategory(title, []),
    source: company.name,
    sourceUrl: url,
    postedAt,
  };
}

/** ATS memuat semua divisi; kita hanya mau peran teknologi yang berlokasi di Jepang. */
function isJapanTechRole(job) {
  const inJapan = /japan|tokyo|osaka|kyoto|fukuoka|nagoya|remote/i.test(
    `${job.city} ${job.title}`
  );
  const isTech =
    job.category !== "Lainnya" ||
    /engineer|developer|software|data|devops|sre|qa|security|infrastructure/i.test(job.title);
  return inJapan && isTech;
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
