// Avatar perusahaan berupa lingkaran berinisial. Sengaja dibuat monokrom
// (bukan warna-warni) supaya tidak bentrok dengan aturan desain situs ini:
// cuma satu warna jenuh (merah) yang boleh dipakai, sisanya netral. Variasi
// visual antar avatar didapat dari intensitas warna netral, bukan dari hue.

const TINT_COUNT = 5;

/** "Money Forward" -> "MF", "PayPay" -> "PP", "abbeal" -> "AB" */
export function initials(name = "") {
  const words = name
    .replace(/[()]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && /[a-zA-Z0-9]/.test(w));

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Hash sederhana dari nama -> salah satu dari 5 tingkat keabuan. */
export function avatarTint(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash % TINT_COUNT;
}
