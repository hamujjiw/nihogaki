// Kurs yen ke rupiah. Gaji di Jepang selalu ditulis dalam yen per tahun, dan
// angka seperti "¥8.000.000" sulit dinilai kalau belum pernah tinggal di sana.
// Konversi kasar ke rupiah membuat angkanya langsung terasa.
//
// Hanya dipanggil di server (lewat lib/aggregate.js).

const FALLBACK_RATE = 105; // 1 JPY dalam rupiah, dipakai kalau API tak terjangkau
const ENDPOINT = "https://open.er-api.com/v6/latest/JPY";

/**
 * @returns {Promise<{ rate: number, live: boolean, updatedAt: string|null }>}
 */
export async function getJpyToIdr() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(ENDPOINT, {
      signal: controller.signal,
      next: { revalidate: 43200 }, // 12 jam
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(String(res.status));

    const data = await res.json();
    const rate = data?.rates?.IDR;
    if (typeof rate !== "number" || rate < 1) throw new Error("Kurs tidak masuk akal");

    return { rate, live: true, updatedAt: data.time_last_update_utc || null };
  } catch {
    return { rate: FALLBACK_RATE, live: false, updatedAt: null };
  }
}
