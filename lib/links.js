/**
 * Tautan pencarian ke situs yang datanya tidak kita scrape.
 *
 * Indeed dan LinkedIn melarang scraping di ketentuan layanannya dan
 * memblokir alamat IP pusat data seperti milik Vercel. Daijob juga
 * melarang lewat klausul berbeda: reproduksi informasi apa pun dari
 * layanan mereka "beyond personal use" atau "posting it on another
 * server" butuh izin tertulis dulu - ini mencakup data faktual (judul,
 * gaji, kota), bukan cuma teks deskripsi. Daijob bahkan minta dikonsultasi
 * dulu untuk sekadar deep link ke halaman spesifik (bukan cuma homepage).
 *
 * Deep link di bawah ini tidak menyalin data apa pun dari mereka - cuma
 * mengarahkan pengunjung ke pencarian mereka sendiri dengan filter yang
 * sudah terisi. Ini jauh lebih ringan dibanding scraping, tapi tetap belum
 * 100% sesuai huruf ToS mereka (yang secara teknis minta izin dulu untuk
 * deep link apa pun). Jangan jadikan pola ini sebagai preseden "pasti aman"
 * untuk sumber lain tanpa mengecek ToS masing-masing.
 */
export function searchLinks(job) {
  const q = encodeURIComponent(`${job.title} ${job.company}`.trim());
  const titleOnly = encodeURIComponent(job.title);

  return [
    {
      label: "Cari di Indeed Jepang",
      url: `https://jp.indeed.com/jobs?q=${q}&l=${encodeURIComponent(job.city || "Japan")}`,
    },
    {
      label: "Cari di LinkedIn",
      url: `https://www.linkedin.com/jobs/search/?keywords=${titleOnly}&location=Japan`,
    },
    {
      label: "Cari di Google",
      url: `https://www.google.com/search?q=${q}+lowongan+jepang`,
    },
  ];
}

/**
 * Kode job_type Daijob untuk kategori SE/BrSE/consulting yang relevan buat
 * peran DX/business analyst.
 *
 * PENTING: setiap kode di sini sudah diverifikasi satu per satu lewat URL
 * nyata yang menampilkan nama kategori itu sebagai "Current Search
 * Conditions" di halamannya - bukan ditebak dari pola urutan angka. Versi
 * sebelumnya sempat berisi lima kode yang ditebak tanpa verifikasi (402,
 * 403, 404, 405, 411) dan itu salah; jangan ulangi kesalahan itu kalau
 * menambah kategori baru di sini - setiap kode baru wajib dicek dulu lewat
 * URL yang benar-benar menampilkan nama kategorinya sebelum dipakai.
 */
const DAIJOB_CATEGORIES = [
  { code: 302, label: "Business Application SE" },
  { code: 304, label: "Web Application SE" },
  { code: 305, label: "Database SE" },
  { code: 314, label: "BrSE / Bridge SE" },
  { code: 503, label: "Security System SE" },
  { code: 1703, label: "IT Security Consulting" },
  { code: 1705, label: "IT Consulting (Other)" },
];

/**
 * Satu tautan langsung ke pencarian Daijob dengan kategori SE/BrSE/
 * consulting di atas sudah tercentang semua, bahasa Inggris, biar hasilnya
 * langsung relevan buat pelamar dari Indonesia yang mengincar peran
 * DX/business analyst.
 */
export function daijobSearchLink() {
  const params = new URLSearchParams();
  params.set("job_search_form_hidden", "1");
  params.set("job_post_language", "1"); // tampilkan listing berbahasa Inggris
  DAIJOB_CATEGORIES.forEach((c) => params.append("job_types[]", String(c.code)));
  DAIJOB_CATEGORIES.forEach((c) => params.append("jt[]", String(c.code)));

  return {
    label: "Cari System Engineer / BrSE di Daijob",
    url: `https://www.daijob.com/en/jobs/search_result?${params.toString()}`,
    note: "Membuka pencarian Daijob dengan kategori Business/Web/Database SE, BrSE (Bridge SE), Security System SE, dan IT Consulting sudah tercentang.",
  };
}
