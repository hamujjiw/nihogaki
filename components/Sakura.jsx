/**
 * Kelopak sakura berguguran — penanda visual situs ini.
 *
 * Dua catatan teknis yang menentukan bentuk berkas ini:
 *
 * 1. Semua koordinat memakai piksel absolut, tidak ada persen. Persen di
 *    dalam SVG dihitung terhadap viewport SVG tempat elemennya
 *    didefinisikan. Karena <defs> di bawah hidup di dalam SVG berukuran
 *    nol, persen apa pun akan jadi nol dan seluruh lapisan hilang tanpa
 *    pesan galat. Ini pernah terjadi saat prototipe dan susah dilacak.
 *
 * 2. Pola dan masker didefinisikan sekali lewat <SakuraDefs /> di layout,
 *    lalu dirujuk berkali-kali oleh <Sakura />. Kalau tiap kartu membawa
 *    definisinya sendiri, satu halaman dengan 24 kartu akan mengulang
 *    markup yang sama 24 kali dan menghasilkan id ganda.
 *
 * Kepadatan diatur lewat pola yang berulang otomatis, bukan koordinat
 * manual, supaya sebarannya tetap merata berapa pun tinggi wadahnya.
 */

const PETAL =
  "M10 19 C3.4 15.4 1.4 8.2 4.2 3.2 C6.2 0.4 8.2 3 10 5.6 C11.8 3 13.8 0.4 15.8 3.2 C18.6 8.2 16.6 15.4 10 19 Z";

/** Satu ubin pola. Dipakai dua kali dengan susunan berbeda supaya kartu
 *  yang bersebelahan tidak terlihat kembar. */
function tile(id, size, petals) {
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <g fill="var(--petal)">
        {petals.map((p, i) => (
          <use
            key={i}
            href="#ng-petal"
            transform={`translate(${p[0]} ${p[1]}) rotate(${p[2]}) scale(${p[3]})`}
            opacity={p[4]}
          />
        ))}
      </g>
    </pattern>
  );
}

const TILE_A = [
  [2, 3, 24, 0.44, 0.95],
  [25, 1, -46, 0.3, 0.72],
  [41, 10, 70, 0.38, 0.86],
  [12, 19, -12, 0.28, 0.66],
  [33, 27, 112, 0.4, 0.9],
  [3, 35, -70, 0.34, 0.7],
  [45, 39, 30, 0.26, 0.6],
  [19, 45, 88, 0.36, 0.8],
  [38, 6, -55, 0.22, 0.55],
];

const TILE_B = [
  [6, 2, -34, 0.36, 0.82],
  [31, 9, 58, 0.28, 0.6],
  [48, 3, 12, 0.4, 0.88],
  [18, 24, 96, 0.3, 0.64],
  [41, 32, -52, 0.38, 0.84],
  [2, 40, 40, 0.32, 0.68],
  [50, 46, -16, 0.26, 0.56],
  [26, 50, 72, 0.36, 0.78],
  [12, 8, 20, 0.22, 0.5],
];

const TILE_C = [
  [4, 6, 62, 0.4, 0.9],
  [22, 2, -18, 0.34, 0.75],
  [39, 14, 100, 0.3, 0.7],
  [9, 22, 34, 0.38, 0.85],
  [30, 31, -62, 0.28, 0.62],
  [47, 26, 16, 0.32, 0.72],
  [15, 41, 78, 0.36, 0.8],
  [36, 47, -30, 0.24, 0.58],
  [1, 50, 50, 0.3, 0.66],
  [50, 8, -74, 0.22, 0.52],
];

const TILE_D = [
  [8, 1, -52, 0.38, 0.86],
  [28, 12, 26, 0.32, 0.7],
  [45, 4, 88, 0.28, 0.64],
  [3, 17, 14, 0.34, 0.78],
  [21, 33, -40, 0.4, 0.9],
  [43, 38, 66, 0.3, 0.68],
  [11, 46, -12, 0.26, 0.6],
  [33, 52, 104, 0.34, 0.76],
  [52, 20, -28, 0.24, 0.54],
  [17, 8, 44, 0.2, 0.5],
];

/**
 * Ditempel sekali di layout. Tidak menggambar apa pun sendiri.
 */
export function SakuraDefs() {
  return (
    <svg className="sakura-defs" aria-hidden="true" focusable="false">
      <defs>
        <g id="ng-petal">
          <path d={PETAL} />
        </g>

        <g id="ng-bloom">
          <g fill="var(--bloom)">
            <use href="#ng-petal" transform="rotate(0 10 19)" />
            <use href="#ng-petal" transform="rotate(72 10 19)" />
            <use href="#ng-petal" transform="rotate(144 10 19)" />
            <use href="#ng-petal" transform="rotate(216 10 19)" />
            <use href="#ng-petal" transform="rotate(288 10 19)" />
          </g>
          <circle cx="10" cy="19" r="2.6" fill="var(--bloom-core)" />
        </g>

        {tile("ng-tile-a", 52, TILE_A)}
        {tile("ng-tile-b", 52, TILE_B)}
        {tile("ng-tile-c", 56, TILE_C)}
        {tile("ng-tile-d", 58, TILE_D)}
        {tile("ng-tile-dense", 44, TILE_A)}

        {/* Ubin kartu dibuat lebih kecil dari ubin sumbernya, jadi jumlah
            kelopak per satuan luas naik tanpa perlu menambah titik satu
            per satu. */}
        {tile("ng-kartu-a", 42, TILE_A)}
        {tile("ng-kartu-b", 44, TILE_B)}
        {tile("ng-kartu-c", 43, TILE_C)}
        {tile("ng-kartu-d", 45, TILE_D)}

        {/* Gugurannya menumpuk di pojok kiri atas lalu memudar menyerong
            ke tengah. Radius dalam piksel, jadi lebar area rapatnya tetap
            sama di layar lebar maupun sempit. */}
        <radialGradient id="ng-fade-corner" gradientUnits="userSpaceOnUse" cx="14" cy="14" r="270">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.34" stopColor="#fff" stopOpacity="0.78" />
          <stop offset="0.66" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* Kartu: kelopak menumpuk di tepi kiri lalu menjalar cukup jauh
            ke tengah, bukan cuma mengumpul di pojok. */}
        <radialGradient id="ng-fade-kartu" gradientUnits="userSpaceOnUse" cx="8" cy="30" r="250">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.88" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0.46" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="ng-fade-tight" gradientUnits="userSpaceOnUse" cx="10" cy="10" r="170">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.72" />
          <stop offset="0.75" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        {/* Sapuan mendatar untuk kaki halaman dan keadaan kosong. */}
        <linearGradient id="ng-fade-band" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="120">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        <mask id="ng-mask-corner" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="2400">
          <rect x="0" y="0" width="2400" height="2400" fill="url(#ng-fade-corner)" />
        </mask>

        <mask id="ng-mask-tight" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="2400">
          <rect x="0" y="0" width="2400" height="2400" fill="url(#ng-fade-tight)" />
        </mask>

        <mask id="ng-mask-kartu" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="2400">
          <rect x="0" y="0" width="2400" height="2400" fill="url(#ng-fade-kartu)" />
        </mask>

        <mask id="ng-mask-band" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="2400">
          <rect x="0" y="0" width="2400" height="2400" fill="url(#ng-fade-band)" />
        </mask>

        {/* Topbar melintang di atas seluruh halaman dan tetap terlihat saat
            menggulir, jadi kelopaknya dibuat paling redup di antara semua
            varian supaya tidak ikut bergerak menarik perhatian. */}
        <linearGradient id="ng-fade-topbar" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="64">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>

        <mask id="ng-mask-topbar" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="2400">
          <rect x="0" y="0" width="2400" height="2400" fill="url(#ng-fade-topbar)" />
        </mask>
      </defs>
    </svg>
  );
}

/**
 * Varian yang tersedia:
 *   kartu-1..4 — kartu lowongan; empat susunan bergilir, masing-masing
 *                dua bunga utuh dan guguran yang lebih rapat
 *   hagaki     — kartu sambutan, paling padat, dua bunga utuh
 *   judul      — kepala halaman statistik, panduan, dan panel detail
 *   pita       — kaki halaman dan keadaan kosong, melebar mendatar
 *   topbar     — bilah navigasi, paling tipis dan paling redup
 */
const VARIANTS = {
  // Empat susunan kartu, dipilih bergilir lewat indeks. Tiap susunan punya
  // ubin, posisi, dan kemiringan bunga yang berbeda, jadi satu layar penuh
  // kartu tidak terlihat seperti stempel yang sama diulang-ulang.
  "kartu-1": {
    pattern: "ng-kartu-a",
    mask: "ng-mask-kartu",
    blooms: [
      [-8, -10, 14, 1.5],
      [26, 46, -34, 1.05],
    ],
  },
  "kartu-2": {
    pattern: "ng-kartu-b",
    mask: "ng-mask-kartu",
    blooms: [
      [-12, 22, -26, 1.35],
      [30, -12, 52, 1.15],
    ],
  },
  "kartu-3": {
    pattern: "ng-kartu-c",
    mask: "ng-mask-kartu",
    blooms: [
      [-6, 60, 38, 1.25],
      [18, 4, -14, 1.4],
    ],
  },
  "kartu-4": {
    pattern: "ng-kartu-d",
    mask: "ng-mask-kartu",
    blooms: [
      [-14, -4, 70, 1.45],
      [34, 62, 8, 1.1],
    ],
  },
  hagaki: {
    pattern: "ng-tile-dense",
    mask: "ng-mask-corner",
    blooms: [
      [10, 8, 14, 1.9],
      [58, 44, -30, 1.2],
    ],
  },
  judul: {
    pattern: "ng-tile-dense",
    mask: "ng-mask-tight",
    blooms: [[4, 2, 10, 1.5]],
  },
  pita: { pattern: "ng-tile-a", mask: "ng-mask-band", blooms: [] },
  topbar: { pattern: "ng-tile-b", mask: "ng-mask-topbar", blooms: [] },
};

/** Nama varian kartu untuk indeks tertentu. */
export function kartuVariant(index) {
  return `kartu-${(index % 4) + 1}`;
}

export default function Sakura({ variant = "kartu-1" }) {
  const v = VARIANTS[variant] || VARIANTS["kartu-1"];

  return (
    <svg className="sakura" aria-hidden="true" focusable="false">
      <g mask={`url(#${v.mask})`}>
        <rect x="0" y="0" width="2400" height="2400" fill={`url(#${v.pattern})`} />
        {v.blooms.map((b, i) => (
          <use
            key={i}
            href="#ng-bloom"
            transform={`translate(${b[0]} ${b[1]}) rotate(${b[2]}) scale(${b[3]})`}
          />
        ))}
      </g>
    </svg>
  );
}
