# Nihogaki

Papan lowongan kerja di Jepang, mencakup IT, business analyst, dan transformasi digital, yang **terbuka untuk pelamar asing** dan dibuat untuk pelamar dari Indonesia. Tiap baris langsung menjawab dua pertanyaan yang paling
menentukan sebelum melamar: apakah lamaran dari luar Jepang diterima, dan seberapa
jauh bahasa Jepang dituntut.

Dibangun dengan Next.js 14 (App Router), tanpa database, siap deploy ke Vercel.

---

## Cara menjalankan di lokal

```bash
npm install
cp .env.example .env.local   # opsional, lihat bagian "Variabel lingkungan"
npm run dev
```

Buka http://localhost:3000

## Publish ke GitHub lalu deploy ke Vercel

```bash
git init
git add .
git commit -m "Papan lowongan IT Jepang"
git branch -M main
git remote add origin https://github.com/USERNAME/japan-it-jobs.git
git push -u origin main
```

Lalu di Vercel:

1. **Add New → Project → Import** repo tadi.
2. Framework otomatis terdeteksi sebagai Next.js. Biarkan semua setelan default.
3. (Opsional) tambahkan environment variable `ANTHROPIC_API_KEY` dan `CRON_SECRET`.
4. **Deploy.**
5. Setelah deploy pertama selesai, buka tab **Analytics** di dashboard proyek dan klik **Enable**. Kode `<Analytics />` di `app/layout.js` sudah terpasang; tombol ini yang menyalakan pengumpulan datanya di sisi Vercel. Tanpa langkah ini, datanya tidak akan tercatat walau kodenya sudah ada.

`vercel.json` sudah memasang cron harian ke `/api/refresh` untuk menyegarkan cache.
Di paket Hobby, cron dibatasi sekali sehari. Itu sudah cukup karena cache juga
otomatis kedaluwarsa tiap 30 menit saat ada pengunjung.

### Yang perlu dicek sebelum push

Jalankan `npm run build` sekali di lokal. Kalau lolos di lokal, Vercel juga lolos —
proses build tidak menyentuh jaringan sama sekali (halaman digambar saat ada
permintaan, bukan saat build), jadi tidak ada sumber eksternal yang bisa
menggagalkan build.

Setelah `npm install`, ikut sertakan `package-lock.json` ke commit supaya versi
dependensi di Vercel identik dengan lokal.

## Variabel lingkungan

Semuanya opsional. Tanpa satu pun, situs tetap jalan penuh.

| Variabel | Fungsi |
| --- | --- |
| `ANTHROPIC_API_KEY` | Kalau diisi, deskripsi lowongan diringkas otomatis ke Bahasa Indonesia (ringkasan peran, tanggung jawab, syarat wajib, nilai tambah, catatan visa). Kalau kosong, teks asli halaman sumber ditampilkan apa adanya. |
| `ANTHROPIC_MODEL` | Default `claude-sonnet-5`. |
| `CRON_SECRET` | Melindungi `/api/refresh` supaya tidak bisa dipanggil sembarang orang. |

## Cara kerjanya

```
Pengunjung
    |
    v
app/page.js ---- getJobs() ---- unstable_cache (30 menit, tag "jobs")
                     |
                     +-- lib/sources/tokyodev.js  scrape tokyodev.com/jobs
                     +-- lib/sources/japandev.js  scrape japan-dev.com
                     +-- lib/sources/ats.js       Greenhouse / Lever / Ashby (opsional)
                     +-- lib/fx.js                kurs JPY ke IDR
                     |
                     +-- lib/aggregate.js  gabung + deduplikasi
                     +-- lib/enrich.js     tiga syarat, tingkat, teknologi, skor keterbukaan
                     +-- lib/stats.js      median gaji, sebaran, distribusi bahasa
    |
    v
components/JobBoard.jsx
    +-- Hero.jsx           ringkasan tiga syarat, bisa diklik untuk menyaring
    +-- InsightPanel.jsx   angka ringkas + grafik
    +-- FilterPanel.jsx    filter + profil (dipakai rail desktop & sheet mobile)
    +-- JobCard.jsx        kartu + tiga kotak syarat + stempel kecocokan
    +-- JobDrawer.jsx      panel geser -> /api/detail
```

Scraping berjalan **di server**, jadi tidak ada masalah CORS, dan pengunjung tidak
pernah menunggu scraper — mereka mendapat halaman statis hasil cache.

### Lapisan data

Sumber hanya memberi label mentah. Yang membuat papan ini berguna adalah lapisan
turunan di atasnya:

| Berkas | Menghasilkan |
| --- | --- |
| `lib/enrich.js` | **Tiga syarat** (bahasa / lamaran / lokasi), tingkat senioritas dari judul, daftar teknologi yang sudah diseragamkan (`React.js` dan `reactjs` jadi satu), skor keterbukaan 0-100, gaji dalam rupiah |
| `lib/stats.js` | Median dan kuartil gaji, sebaran gaji per pita, distribusi tuntutan bahasa Jepang, teknologi terpopuler |
| `lib/match.js` | Skor kecocokan 0-100 terhadap profil pengunjung, **beserta alasannya** satu per satu. Dihitung di browser; profil tidak pernah dikirim ke server |
| `lib/fx.js` | Kurs JPY ke IDR langsung dari API publik, dengan nilai cadangan kalau gagal |

Skor keterbukaan dipakai sebagai urutan default, supaya lowongan bergaji besar yang
menuntut sudah tinggal di Jepang tidak menenggelamkan lowongan yang benar-benar bisa
kamu lamar hari ini.

### Kenapa scraping, bukan API resmi

TokyoDev dan Japan Dev tidak menyediakan API publik gratis. Yang dilakukan di sini
hanya membaca halaman yang memang terbuka untuk umum, sekali per 30 menit, dengan
User-Agent yang jujur menyebutkan identitas aplikasi. Isi lowongan tidak disalin untuk
menggantikan sumbernya: tombol melamar selalu mengarah ke halaman aslinya.

Untuk sumber tambahan, jalur yang lebih bersih ada di `lib/sources/ats.js` — adaptor
untuk Greenhouse, Lever, dan Ashby yang memang menyediakan JSON publik tanpa kunci API.
Menambah perusahaan cukup satu baris di `COMPANIES`. Daftarnya sengaja dibiarkan kosong
karena setiap token harus diverifikasi dulu satu per satu.

Kalau nanti kamu mau menjadikan ini produk sungguhan, baca dulu ketentuan layanan
masing-masing situs dan pertimbangkan minta izin resmi. Di Jepang, menjalankan jasa
penyaluran kerja juga punya syarat lisensi tersendiri; papan yang sekadar menautkan ke
lowongan orang lain berbeda posisinya dengan yang memproses lamaran sendiri.

### Antarmuka

Arah desainnya dijelaskan lengkap di `DESIGN.md`. Ringkasnya:

- **Tiga kotak syarat** sebagai elemen penanda, digambar seperti kotak kode pos.
  Tiga kotak yang menunjukkan apakah bahasa,
  izin melamar, dan lokasi terbuka untukmu. Bentuk yang sama dipakai di hero sebagai
  distribusi seluruh lowongan, dan tiap segmennya bisa diklik untuk menyaring.
- **Satu warna jenuh saja** — merah yang dipakai bersama bendera Indonesia dan Jepang.
  Sisanya netral yang tenang.
- **Mode gelap** mengikuti setelan sistem, bisa ditimpa manual, dipasang sebelum halaman
  digambar supaya tidak berkedip.
- **Desktop** memakai rail filter yang menempel; **mobile** memakai bottom sheet dengan
  tombol filter melayang berlencana jumlah filter aktif.
- Detail lowongan terbuka sebagai **panel geser** dengan `role="dialog"`, fokus otomatis,
  tutup dengan Esc, dan URL yang bisa dibagikan (`?lowongan=<id>`).

### Endpoint

| Endpoint | Isi |
| --- | --- |
| `GET /api/jobs` | Seluruh lowongan yang sudah dinormalisasi dan diperkaya (JSON). Bebas dipakai untuk klien lain. |
| `GET /api/stats` | Ringkasan pasar: median gaji, sebaran, distribusi bahasa Jepang. |
| `GET /api/detail?url=…` | Deskripsi satu lowongan. Host dibatasi hanya ke sumber yang dikenal. |
| `GET /api/refresh` | Mengosongkan cache. Butuh `CRON_SECRET` kalau variabelnya diisi. |

## Kalau suatu saat papan jadi kosong

Scraper bergantung pada struktur HTML situs sumber, jadi suatu hari pasti ada yang
berubah. Yang perlu dicek:

1. Buka `/api/jobs` — bagian `meta.sources` menyebut sumber mana yang gagal dan kenapa.
   Status ini juga tampil di footer situs.
2. `lib/sources/tokyodev.js` mengenali lowongan lewat **pola URL** (`/companies/x/jobs/y`
   dan tag seperti `/jobs/apply-from-abroad`), bukan nama class CSS. Pola URL jarang
   berubah, tapi kalau berubah, ubah regex di file itu saja.
3. `lib/sources/japandev.js` membaca teks kartu lowongan. Kalau tanda seperti
   "Apply from Abroad" atau "Residents Only" diganti kata lain, sesuaikan regex-nya.
4. Satu sumber gagal tidak menjatuhkan yang lain — halaman tetap tampil dengan sisanya.

## Menambah sumber baru

Buat file di `lib/sources/`, ekspor fungsi async yang mengembalikan array objek
dengan bentuk berikut, lalu daftarkan di `SOURCES` pada `lib/aggregate.js`:

```js
{
  id: "namasumber-slug-unik",
  slug: "perusahaan-judul",
  title: "Backend Engineer",
  company: "Nama Perusahaan",
  companyUrl: "https://…",        // boleh null
  city: "Tokyo",
  japanese: "none",                // none | basic | conversational | business | fluent | unknown
  abroad: true,                    // true | false | null
  remote: "hybrid",                // full | hybrid | onsite | unknown
  salary: { min: 7000000, max: 11000000, text: "¥7M ~ ¥11M" },
  tags: ["Go", "AWS"],
  category: "Backend",
  source: "Nama Sumber",
  sourceUrl: "https://…"
}
```

Helper di `lib/normalize.js` (`parseSalary`, `normalizeJapanese`, `normalizeRemote`,
`guessCategory`, `guessCity`) sudah menangani konversi format yang berbeda-beda.

## Struktur berkas

```
app/
  layout.js              huruf, metadata, pemasang tema anti-kedip, Vercel Analytics
  icon.svg               logo, terbaca otomatis sebagai favicon
  apple-icon.png          logo untuk layar utama iOS
  page.js                server component, ambil data ter-cache
  globals.css            seluruh sistem desain (token, terang/gelap, responsif)
  sitemap.js
  api/jobs/route.js      JSON publik
  api/stats/route.js     statistik publik
  api/detail/route.js    deskripsi satu lowongan
  api/refresh/route.js   pembersih cache untuk cron
components/
  JobBoard.jsx           orkestrator: keadaan, filter, sheet, drawer, URL
  Hero.jsx               ringkasan tiga syarat
  InsightPanel.jsx       angka ringkas + grafik CSS
  FilterPanel.jsx        filter + profil
  JobCard.jsx            kartu lowongan
  JobDrawer.jsx          panel geser detail
  GateMeter.jsx          elemen penanda
  ThemeToggle.jsx        terang / gelap
  Icon.jsx               ikon SVG inline
  Footer.jsx             status sumber + catatan penting
lib/
  http.js                fetch dengan User-Agent, timeout, cache
  normalize.js           penyeragaman gaji, level Jepang, kategori, kota
  enrich.js              tiga syarat, senioritas, teknologi, skor keterbukaan
  stats.js               statistik untuk panel ringkasan
  match.js               skor kecocokan profil (jalan di browser)
  fx.js                  kurs JPY ke IDR (server saja)
  format.js              format rupiah (murni, aman untuk browser)
  filters.js             penyaringan & pengurutan
  detail.js              ekstraksi deskripsi + ringkasan opsional
  aggregate.js           penggabungan + deduplikasi + cache
  sources/tokyodev.js
  sources/japandev.js
  sources/ats.js         Greenhouse / Lever / Ashby (opsional)
```

## Aksesibilitas

Yang sudah dipasang: tautan lompat ke daftar, cincin fokus yang terlihat di semua
kontrol, target sentuh minimal 38-44px, `role="dialog"` dengan `aria-modal` pada panel
geser dan sheet, fokus otomatis ke tombol tutup, Esc untuk menutup, `aria-pressed` pada
semua sakelar, `aria-live` pada jumlah hasil, dan `prefers-reduced-motion` yang mematikan
seluruh animasi. Warna merah aksen diuji kontrasnya terhadap latar terang maupun gelap.

## Catatan desain

Lihat `DESIGN.md` untuk palet, pasangan huruf, dan alasan di balik elemen penanda.

## Lisensi

MIT untuk kode di repo ini. Data lowongan tetap milik situs sumber
masing-masing dan hanya ditautkan, bukan dimiliki oleh proyek ini.
