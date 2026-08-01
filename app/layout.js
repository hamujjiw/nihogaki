import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SakuraDefs } from "@/components/Sakura";

const SITE = "Nihogaki";
const DESC =
  "Lowongan IT, business analyst, dan transformasi digital di Jepang yang terbuka untuk pelamar dari Indonesia. Tiap lowongan ditandai untuk tiga hal yang paling menentukan: syarat bahasa Jepang, izin melamar dari Indonesia, dan lokasi kerja.";

export const metadata = {
  title: { default: SITE, template: `%s · ${SITE}` },
  description: DESC,
  keywords: [
    "lowongan IT Jepang",
    "kerja di Jepang",
    "visa sponsorship Jepang",
    "software engineer Jepang",
    "kerja IT luar negeri",
    "lowongan tanpa bahasa Jepang",
  ],
  // app/icon.svg dan app/apple-icon.png terdeteksi otomatis oleh Next.js
  // lewat konvensi nama berkas; baris ini cuma jaga-jaga di beberapa
  // klien lama yang tidak membaca konvensi itu.
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  openGraph: { title: SITE, description: DESC, type: "website", locale: "id_ID" },
  twitter: { card: "summary_large_image", title: SITE, description: DESC },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf6ec" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
};

// Tema dipasang sebelum halaman digambar supaya tidak ada kedipan putih
// saat pengunjung memilih mode gelap.
const themeScript = `
try {
  var saved = localStorage.getItem('papan-tema');
  var dark = saved ? saved === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
} catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Zen Old Mincho: serif Jepang untuk judul, memberi kesan dicetak
            alih-alih digital. Courier Prime untuk angka dan label, meniru
            mesin tik pos lama. Plus Jakarta Sans tetap dipakai untuk teks
            isi karena paling nyaman dibaca panjang-panjang. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Courier+Prime:wght@400;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SakuraDefs />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
