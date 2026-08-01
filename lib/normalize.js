// Menyeragamkan data dari sumber yang formatnya berbeda-beda menjadi satu bentuk.

export const CITIES = [
  "Tokyo", "Yokohama", "Osaka", "Kyoto", "Kobe", "Nagoya", "Fukuoka",
  "Sapporo", "Sendai", "Hiroshima", "Okinawa", "Chiba", "Saitama",
  "Kawasaki", "Shizuoka", "Ishikawa", "Tottori", "Aichi", "Shimane",
];

/**
 * Level bahasa Jepang memakai penjenjangan JLPT, dari paling longgar ke
 * paling ketat. Sumber tidak pernah menyebut JLPT secara harfiah — mereka
 * menulis "Business Level" atau "Daily Conversation" — jadi label itu
 * dipetakan ke tingkat JLPT yang setara. Pemetaannya perkiraan, dan itu
 * disebutkan terbuka di situsnya.
 */
export const JP_ORDER = ["none", "n5", "n4", "n3", "n2", "n1"];

export const JP_LABEL = {
  none: "Belum perlu bahasa Jepang",
  n5: "Setara N5",
  n4: "Setara N4",
  n3: "Setara N3",
  n2: "Setara N2",
  n1: "Setara N1",
  unknown: "Tidak disebutkan",
};

export const JP_SHORT = {
  none: "Belum bisa", n5: "N5", n4: "N4", n3: "N3", n2: "N2", n1: "N1",
  unknown: "Tak jelas",
};

/** Bidang kerja. Diperluas dari IT murni ke peran bisnis dan DX. */
export const CATEGORIES = [
  "Business Analyst & DX", "Konsultan IT", "Project & Product", "Backend",
  "Frontend", "Full Stack", "Mobile", "Data & AI", "DevOps / SRE", "QA",
  "Infra & Security", "ERP & SAP", "Marketing & Sales", "HR & Keuangan",
  "Desain & Kreatif", "Game", "Lainnya",
];

const CATEGORY_RULES = [
  // "System Engineer" / SE / システムエンジニア khusus di industri Jepang (SIer)
  // biasanya berarti requirement gathering, desain sistem, dan koordinasi
  // klien - jauh lebih dekat ke business analyst/DX daripada ke coding
  // hands-on. Beda dari "Backend Engineer" atau "Software Engineer" yang
  // memang berarti developer di kebanyakan perusahaan modern.
  ["Business Analyst & DX", /\b(business analyst|bizdev|business development|business transformation|digital transformation|\bdx\b|business systems analyst|it business partner|system engineer|システムエンジニア|ビジネスアナリスト|事業開発)\b/i],
  ["ERP & SAP", /\b(erp|sap|salesforce|workday|netsuite|oracle ebs)\b/i],
  ["Konsultan IT", /\b(it consultant|consultant|consulting|コンサル)\b/i],
  ["Project & Product", /\b(project manager|programme manager|pmo|product manager|product owner|scrum master|プロジェクトマネージャー)\b/i],
  ["Data & AI", /\b(machine learning|\bml\b|\bai\b|data (engineer|scien|analyst|infrastructure|architect)|mlops|nlp|llm|deep learning)\b/i],
  ["DevOps / SRE", /\b(devops|sre|site reliability|platform engineer|infrastructure engineer|cloud engineer|kubernetes)\b/i],
  ["QA", /\b(qa|quality assurance|sdet|test automation|tester)\b/i],
  ["Infra & Security", /\b(security|iam|it infrastructure|network|dba|database admin|corporate it|it support|helpdesk|technical support)\b/i],
  ["Game", /\b(game|unity|unreal|gameplay)\b/i],
  ["Mobile", /\b(android|ios|mobile|swift|kotlin|react native|flutter)\b/i],
  ["Frontend", /\b(frontend|front-end|front end|ui engineer|react|vue|svelte)\b/i],
  ["Full Stack", /\b(full ?stack|fullstack)\b/i],
  ["Backend", /\b(backend|back-end|server side|api engineer|ruby|golang|\bgo\b|java|php|rails|node|software (developer|engineer)|programmer)\b/i],
  ["Marketing & Sales", /\b(marketing|sales|growth|brand|seo)\b/i],
  ["HR & Keuangan", /\b(human resources|\bhr\b|recruit|talent acquisition|payroll|finance|accounting|controller)\b/i],
  ["Desain & Kreatif", /\b(designer|ux|ui\/ux|creative|art director)\b/i],
];

export function guessCategory(title = "", tags = []) {
  const haystack = `${title} ${tags.join(" ")}`;
  for (const [name, re] of CATEGORY_RULES) {
    if (re.test(haystack)) return name;
  }
  return "Lainnya";
}

/**
 * Label bahasa dari sumber -> tingkat JLPT setara.
 * TokyoDev/Japan Dev: "No Japanese required", "Business Japanese", ...
 * CareerCross: "None", "Basic", "Daily Conversation", "Business Level", "Fluent", "Native"
 */
export function normalizeJapanese(raw = "") {
  const s = String(raw).toLowerCase();
  if (!s) return "unknown";
  if (s.includes("no japanese") || s === "none" || s.includes("not required")) return "none";
  if (s.includes("basic")) return "n5";
  if (s.includes("daily conversation") || s.includes("conversational")) return "n3";
  if (s.includes("business")) return "n2";
  if (s.includes("fluent") || s.includes("native")) return "n1";
  if (/\bn1\b/.test(s)) return "n1";
  if (/\bn2\b/.test(s)) return "n2";
  if (/\bn3\b/.test(s)) return "n3";
  if (/\bn4\b/.test(s)) return "n4";
  if (/\bn5\b/.test(s)) return "n5";
  if (s.includes("japanese required")) return "n2";
  return "unknown";
}

export function normalizeRemote(raw = "") {
  const s = String(raw).toLowerCase();
  if (s.includes("full")) return "full";
  if (s.includes("partial") || s.includes("hybrid") || s.includes("remote work")) return "hybrid";
  if (s.includes("no remote") || s.includes("on-site") || s.includes("onsite")) return "onsite";
  return "unknown";
}

export const REMOTE_LABEL = {
  full: "Remote penuh", hybrid: "Hybrid", onsite: "Kerja di kantor",
  unknown: "Tidak disebutkan",
};

/**
 * Menangani dua format gaji sekaligus:
 *   "¥7.0M ~ ¥11.0M"                  (TokyoDev, Japan Dev)
 *   "9 million yen ~ 12 million yen"  (CareerCross)
 *   "¥3,100,000 - ¥4,800,000/year"    (KapanJepan)
 *   "Min: ¥230,000/month"             (KapanJepan, bulanan -> dikali 12)
 * Semua dikembalikan sebagai yen per tahun.
 */
export function parseSalary(raw = "") {
  const text = String(raw).replace(/\s+/g, " ").trim();
  if (!text) return { min: null, max: null, text: "" };

  const monthly = /\/\s*(month|bulan|月)/i.test(text);
  let nums = [];

  const millionWords = [...text.matchAll(/([\d.,]+)\s*million\s*yen/gi)];
  if (millionWords.length) {
    nums = millionWords.map((m) => Math.round(parseFloat(m[1].replace(/,/g, "")) * 1_000_000));
  } else {
    const shortM = [...text.matchAll(/¥\s*([\d.,]+)\s*M/gi)];
    if (shortM.length) {
      nums = shortM.map((m) => Math.round(parseFloat(m[1].replace(/,/g, "")) * 1_000_000));
    } else {
      const plain = [...text.matchAll(/¥\s*([\d,]{4,})/g)];
      nums = plain.map((m) => parseInt(m[1].replace(/,/g, ""), 10));
    }
  }

  nums = nums.filter((n) => Number.isFinite(n) && n > 0);
  if (!nums.length) return { min: null, max: null, text: "" };
  if (monthly) nums = nums.map((n) => n * 12);

  const min = nums[0];
  const max = nums.length > 1 ? nums[1] : nums[0];
  return { min, max, text: formatSalary(min, max) };
}

/** Semua gaji ditampilkan dalam satu format, apa pun sumbernya. */
export function formatSalary(min, max) {
  if (!min) return "";
  const m = (v) => `¥${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}jt`;
  return min === max ? `${m(min)}/th` : `${m(min)} – ${m(max)}/th`;
}

export function guessCity(...texts) {
  const haystack = texts.filter(Boolean).join(" ");
  for (const city of CITIES) {
    if (new RegExp(`\\b${city}\\b`, "i").test(haystack)) return city;
  }
  if (/\bremote\b/i.test(haystack)) return "Remote";
  return "Jepang";
}

export function slugify(s = "") {
  return String(s).toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function dedupeKey(company = "", title = "") {
  const clean = (s) =>
    String(s).toLowerCase().replace(/\(.*?\)/g, " ").replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(sr|senior|lead|staff|principal)\b/g, " ")
      .trim().replace(/\s+/g, " ");
  return `${clean(company)}::${clean(title)}`;
}
