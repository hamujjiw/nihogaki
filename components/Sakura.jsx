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
        {tile("ng-tile-dense", 44, TILE_A)}

        {/* Gugurannya menumpuk di pojok kiri atas lalu memudar menyerong
            ke tengah. Radius dalam piksel, jadi lebar area rapatnya tetap
            sama di layar lebar maupun sempit. */}
        <radialGradient id="ng-fade-corner" gradientUnits="userSpaceOnUse" cx="14" cy="14" r="270">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.34" stopColor="#fff" stopOpacity="0.78" />
          <stop offset="0.66" stopColor="#fff" stopOpacity="0.3" />
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

        <mask id="ng-mask-band" maskUnits="userSpaceOnUse" x="0" y="0" width="2400" height="2400">
          <rect x="0" y="0" width="2400" height="2400" fill="url(#ng-fade-band)" />
        </mask>
      </defs>
    </svg>
  );
}

/**
 * Varian yang tersedia:
 *   kartu      — kartu lowongan, pola A, satu bunga utuh di pojok
 *   kartu-alt  — sama tapi pola B, dipakai selang-seling
 *   hagaki     — kartu sambutan, paling padat, dua bunga utuh
 *   judul      — kepala halaman statistik, rapat tapi sempit
 *   pita       — kaki halaman dan keadaan kosong, melebar mendatar
 */
const VARIANTS = {
  kartu: { pattern: "ng-tile-a", mask: "ng-mask-tight", blooms: [[-6, -8, 14, 1.35]] },
  "kartu-alt": { pattern: "ng-tile-b", mask: "ng-mask-tight", blooms: [[-8, -4, -22, 1.25]] },
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
};

export default function Sakura({ variant = "kartu" }) {
  const v = VARIANTS[variant] || VARIANTS.kartu;

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
