# Tema: Hagaki

Catatan alasan di balik tiap pilihan desain, supaya keputusan lama tidak
diulang dari nol saat menambah halaman baru.

## Kenapa kartu pos

Tema sebelumnya, Kaisatsu, memakai gerbang tiket stasiun sebagai
metafora. Metafora itu kuat tapi salah sasaran: gerbang tiket adalah
soal boleh atau tidak boleh lewat, sedangkan yang dikerjakan situs ini
lebih dekat ke mengabarkan sesuatu dari jauh. Hagaki, kartu pos Jepang,
menangkap itu — benda yang dikirim menyeberangi jarak, formatnya pendek,
dan sudah punya kaidah cetak yang matang untuk dipinjam.

Konsekuensinya, kosakata visual lama ikut dilepas: jalur rel, simpul
stasiun, lampu sinyal hijau-merah, dan kata "gerbang" di seluruh teks.

## Warna

| Peran | Nilai | Alasan |
|---|---|---|
| Kanvas | `#fbf6ec` | Kertas krem hangat, bukan putih layar |
| Permukaan | `#fdfaf2` | Kartu sedikit lebih terang dari kanvas |
| Tinta | `#241f1a` | Hitam kecoklatan, meniru tinta cetak |
| Aksen | `#2c736d` teks, `#9ec9c3` bingkai | Tosca teduh |
| Merah pos | `#c6102e` | Hanya untuk elemen yang di kartu asli memang merah |

Merah sengaja dikurung ketat. Ia cuma muncul di simbol 〒, garis kotak
kode pos, dan stempel skor. Semua tautan, tombol, dan angka aksen pakai
tosca. Kalau merah dipakai lebih luas, kartu berhenti terasa seperti
kartu pos dan mulai terasa seperti peringatan.

Kontras dicek terhadap WCAG AA di kedua mode. Teks kecil minimal 4.5:1,
elemen antarmuka 3:1. Jalankan `contrast.py` kalau menambah warna baru.

## Tipografi

- **Zen Old Mincho** untuk judul. Serif Jepang, memberi kesan dicetak
  alih-alih dirender layar.
- **Courier Prime** untuk angka, label, dan meta. Meniru mesin tik pos
  lama, sekaligus memberi angka lebar tetap yang berguna untuk gaji.
- **Plus Jakarta Sans** untuk teks isi. Dipertahankan dari tema lama
  karena paling nyaman dibaca panjang-panjang, dan judul serif sudah
  memikul beban karakternya.

## Kelopak sakura

Penanda visual situs. Aturan penempatannya:

**Dipakai** di kartu sambutan (paling padat), kartu lowongan, judul
halaman statistik, keadaan kosong, dan kaki halaman.

**Tidak dipakai** di isi grafik, tabel, dan panel filter. Semuanya
berbasis angka yang perlu dibaca presisi, dan motif berulang di sana
mengganggu pemindaian cepat.

Dua hal teknis yang menentukan bentuk `components/Sakura.jsx`:

1. **Semua koordinat memakai piksel absolut.** Persen di dalam SVG
   dihitung terhadap viewport SVG tempat elemennya didefinisikan. Karena
   `<defs>` hidup di dalam SVG berukuran nol, persen apa pun jadi nol dan
   seluruh lapisan hilang tanpa pesan galat. Ini pernah terjadi dan susah
   dilacak. `qa.py` menolak kalau persen masuk lagi ke sana.

2. **Definisi dipasang sekali di layout.** `<SakuraDefs />` di
   `app/layout.js`, lalu `<Sakura variant="..." />` merujuknya. Kalau tiap
   kartu membawa definisinya sendiri, satu halaman dengan 24 kartu
   mengulang markup yang sama 24 kali dan menghasilkan id ganda.

Kepadatan diatur lewat pola yang berulang otomatis, bukan koordinat
manual, supaya sebarannya merata berapa pun tinggi wadahnya. Kartu
bernomor genap dan ganjil memakai susunan berbeda supaya yang
bersebelahan tidak terlihat kembar.

Di kartu sambutan, kelopak dipotong tepat di garis bingkai. Tanpa itu
gugurannya meluber ke pias luar dan bingkainya kehilangan fungsi sebagai
pembatas — pada hagaki asli, ilustrasinya selalu berhenti di garis.

## Tiga syarat

Bahasa Jepang, izin melamar dari Indonesia, dan lokasi kerja. Digambar
sebagai tiga kotak kode pos (`components/StampLine.jsx`), bukan jalur rel
seperti tema lama.

Kotak kode pos lebih cepat dibaca sekilas saat menggulir daripada
rangkaian simpul dan rel, dan bentuk yang sama dipakai sebagai saklar di
panel filter, jadi pengunjung cuma perlu belajar sekali.

Kata "gerbang" dihindari di seluruh teks yang dilihat pengguna: terlalu
kaku, dan metafora asalnya sudah dilepas. Penggantinya "syarat".

## Bentuk kartu sambutan

Satu kartu pos utuh di tengah layar. Potret di mobile mengikuti rasio
hagaki asli, lanskap di atas 900px supaya ruang lebar tidak terbuang dan
kartunya tidak jadi jangkung. Titik gantinya di `@media (min-width: 900px)`.

Isinya sengaja pendek dan mengalir, bukan daftar berpoin. Format kartu
pos tidak menampung paragraf panjang, dan daftar berpoin di sana terbaca
seperti spesifikasi produk. Alat baca yang sebenarnya hidup di kartu
lowongan, tempat orang memang perlu memindai cepat.

## Mode gelap

Kelopak tetap ada supaya identitasnya tidak hilang, tapi diredupkan dan
digeser ke mauve lewat `--petal`, `--bloom`, dan `--petal-alpha`. Untuk
mematikannya sama sekali, setel `--petal-alpha: 0` di blok
`:root[data-theme='dark']`.

## Sudut dan bayangan

Radius hampir siku (2 sampai 4px) di seluruh antarmuka. Kartu pos
dicetak dan dipotong lurus, bukan dibulatkan seperti kartu aplikasi.
Bayangan dibuat sangat tipis dengan alasan yang sama.
