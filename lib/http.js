// Pembungkus fetch untuk semua permintaan keluar.
// Satu tempat untuk User-Agent, timeout, dan aturan cache Next.js.

export const UA =
  "PapanLowonganIT/1.0 (+https://github.com/ganti-dengan-username-kamu/japan-it-jobs) Node/20";

/**
 * Ambil HTML sebuah halaman.
 * @param {string} url
 * @param {{ revalidate?: number, timeoutMs?: number }} opts
 * @returns {Promise<string>}
 */
export async function fetchHtml(url, opts = {}) {
  const { revalidate = 1800, timeoutMs = 15000 } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en;q=0.9,ja;q=0.8,id;q=0.7",
      },
      next: { revalidate },
    });

    if (!res.ok) {
      throw new Error(`${url} membalas ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}
