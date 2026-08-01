// Menebak apakah sebuah lowongan itu gaya SIer (dispatch/SES ke klien) atau
// gaya in-house (bikin produk sendiri), dari pola istilah yang muncul di
// teks deskripsi mentah. Ini yang paling menentukan apakah "System Engineer"
// di lowongan itu beneran requirement-gathering/BA-style atau malah coding
// harian - lihat diskusi soal itu di halaman Panduan.
//
// Ini TEBAKAN dari pola kata, bukan fakta terverifikasi. Selalu ditampilkan
// bersama istilah yang memicunya supaya bisa dinilai sendiri, bukan
// dipercaya mentah-mentah.

const SIER_STRONG = [
  [/客先常駐/, "客先常駐 (ditugaskan di lokasi klien)"],
  [/受託開発/, "受託開発 (pengembangan kontrak)"],
  [/準委任/, "準委任 (kontrak quasi-delegasi, umum di SES)"],
  [/多重下請/, "多重下請け (rantai subkontrak berlapis)"],
  [/下請け/, "下請け (subkontrak)"],
  [/\bSES\b/, "SES (System Engineering Service)"],
  [/プライム案件|エンド直/, "プライム案件/エンド直 (istilah umum industri dispatch)"],
  [/dispatch(ed)?\s+to\s+(the\s+)?client/i, "\"dispatched to client\""],
  [/staffing\s+agency/i, "\"staffing agency\""],
  [/secondment/i, "\"secondment\""],
];

const SIER_SOFT = [
  [/常駐/, "常駐 (stasioner/ditempatkan)"],
  [/assigned\s+to\s+(a\s+)?project\s+based\s+on/i, "\"assigned to a project based on...\""],
  [/client\s+site/i, "\"client site\""],
];

const INHOUSE_STRONG = [
  [/自社開発/, "自社開発 (pengembangan in-house)"],
  [/自社サービス/, "自社サービス (layanan sendiri)"],
  [/自社プロダクト/, "自社プロダクト (produk sendiri)"],
  [/in-house\s+development/i, "\"in-house development\""],
  [/our\s+own\s+(product|platform|service)/i, "\"our own product/platform\""],
];

const INHOUSE_SOFT = [
  [/SaaS\s+(provider|company)/i, "\"SaaS provider\""],
  [/product\s+team/i, "\"product team\""],
];

function score(text, strong, soft) {
  const hits = [];
  let weight = 0;
  for (const [re, label] of strong) {
    if (re.test(text)) {
      weight += 2;
      hits.push(label);
    }
  }
  for (const [re, label] of soft) {
    if (re.test(text)) {
      weight += 1;
      hits.push(label);
    }
  }
  return { weight, hits };
}

/**
 * @returns {{ style: 'sier'|'inhouse'|'tidak-jelas', terms: string[] }}
 */
export function classifyCompanyStyle(text = "") {
  const sier = score(text, SIER_STRONG, SIER_SOFT);
  const inhouse = score(text, INHOUSE_STRONG, INHOUSE_SOFT);

  // Butuh selisih yang jelas, bukan cuma satu sinyal lemah sendirian,
  // supaya badge-nya tidak asal tebak dari kebetulan satu kata nyangkut.
  if (sier.weight === 0 && inhouse.weight === 0) {
    return { style: "tidak-jelas", terms: [] };
  }
  if (sier.weight >= inhouse.weight + 2) {
    return { style: "sier", terms: sier.hits.slice(0, 3) };
  }
  if (inhouse.weight >= sier.weight + 2) {
    return { style: "inhouse", terms: inhouse.hits.slice(0, 3) };
  }
  return { style: "tidak-jelas", terms: [] };
}

export const STYLE_LABEL = {
  sier: "Kemungkinan gaya SIer (dispatch ke klien)",
  inhouse: "Kemungkinan pengembangan in-house",
  "tidak-jelas": "Gaya perusahaan tidak jelas dari deskripsi",
};
