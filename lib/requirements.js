// Membaca teks lowongan mentah untuk menemukan hal-hal yang selalu ingin
// dicek orang duluan: tahun pengalaman, dan level bahasa yang diminta.
// Ini jalan tanpa API key sama sekali - murni pencarian pola di teks yang
// sudah diambil dari halaman sumber, jadi selalu tersedia.

const EXPERIENCE_PATTERNS = [
  /\b(\d+)\s*[-~–]\s*(\d+)\s*years?\s*(of\s*)?(professional\s*)?experience/i,
  /\bat least\s*(\d+)\s*years?/i,
  /\bminimum\s*(\d+)\s*years?/i,
  /\b(\d+)\+\s*years?/i,
  /\bover\s*(\d+)\s*years?/i,
  /\bminimal\s*(\d+)\s*tahun/i,
  /\b(\d+)\s*tahun\s*pengalaman/i,
];

/**
 * Cari mention tahun pengalaman di teks lowongan mentah.
 * Mengembalikan string ringkas seperti "2+ tahun" atau null kalau tidak
 * ketemu pola yang jelas.
 */
export function extractExperience(text = "") {
  for (const re of EXPERIENCE_PATTERNS) {
    const m = text.match(re);
    if (!m) continue;

    if (m[2]) return `${m[1]}–${m[2]} tahun`;
    if (m[1]) return `${m[1]}+ tahun`;
  }

  if (/\b(entry.level|no experience required|fresh graduate|new grad)\b/i.test(text)) {
    return "Terbuka untuk fresh graduate";
  }
  if (/\bfirst experience\b/i.test(text)) {
    return "Pengalaman awal sudah cukup";
  }

  return null;
}

/**
 * Potong beberapa kalimat di sekitar kata "experience" atau "pengalaman"
 * supaya orang bisa lihat konteks lengkapnya, bukan cuma angka lepas.
 * Dipakai sebagai pelengkap saat ringkasan AI tidak tersedia.
 */
export function experienceContext(text = "", maxSentences = 2) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const hits = sentences.filter((s) => /\b(experience|pengalaman|years?)\b/i.test(s));
  return hits.slice(0, maxSentences).join(" ").trim();
}
