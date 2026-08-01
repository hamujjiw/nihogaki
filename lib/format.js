// Fungsi format murni. Sengaja dipisah dari lib/fx.js: fx.js melakukan
// permintaan jaringan dan hanya boleh jalan di server, sedangkan fungsi di
// sini ikut terbawa ke browser lewat rantai enrich -> match -> JobCard.

/** 8_000_000 yen -> "Rp 840 jt" (dibulatkan, memang perkiraan). */
export function toRupiah(yen, rate) {
  if (!yen || !rate) return "";
  const idr = yen * rate;

  if (idr >= 1_000_000_000) {
    return `Rp ${(idr / 1_000_000_000).toFixed(idr >= 10_000_000_000 ? 0 : 1)} M`;
  }
  return `Rp ${Math.round(idr / 1_000_000)} jt`;
}

/** Perkiraan per bulan, karena itu satuan yang biasa dipakai membandingkan. */
export function monthlyRupiah(yen, rate) {
  if (!yen || !rate) return "";
  const perMonth = (yen * rate) / 12;
  return `Rp ${Math.round(perMonth / 1_000_000)} jt/bln`;
}
