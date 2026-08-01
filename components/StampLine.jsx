import { GATE_LABEL } from "@/lib/enrich";

const TEXT = {
  bahasa: {
    lolos: "Tanpa Jepang",
    sebagian: "N5 sampai N3",
    terkunci: "N2 ke atas",
    "tidak-jelas": "Bahasa tak jelas",
  },
  lamaran: {
    lolos: "Dari Indonesia",
    sebagian: "Sebagian",
    terkunci: "Harus di Jepang",
    "tidak-jelas": "Tak disebutkan",
  },
  lokasi: {
    lolos: "Remote penuh",
    sebagian: "Hybrid",
    terkunci: "Di kantor",
    "tidak-jelas": "Tak disebutkan",
  },
};

const KEYS = ["bahasa", "lamaran", "lokasi"];

/**
 * Tiga hal yang paling sering menggagalkan lamaran dari Indonesia,
 * digambar sebagai tiga kotak kode pos.
 *
 * Bentuk ini menggantikan jalur gerbang dari tema lama. Alasannya dua:
 * metafora kereta sudah tidak nyambung setelah temanya pindah ke kartu
 * pos, dan kotak kode pos lebih cepat dibaca sekilas saat menggulir
 * cepat daripada rangkaian simpul dan rel. Bentuk yang sama dipakai di
 * saklar panel filter, jadi pengunjung cuma perlu belajar sekali.
 *
 * @param {'sm'|'md'|'lg'} size
 */
export default function StampLine({ gates, size = "md" }) {
  const ringkasan = KEYS.map((k) => `${GATE_LABEL[k]}: ${TEXT[k][gates[k]]}`).join(", ");

  const cls =
    "stampline" + (size === "lg" ? " stampline-lg" : size === "sm" ? " stampline-sm" : "");

  return (
    <div
      className={cls}
      role="img"
      aria-label={`Syarat untuk pelamar dari luar Jepang. ${ringkasan}`}
    >
      {KEYS.map((key) => (
        <div className="sl-item" key={key} data-state={gates[key]}>
          <span className="sl-box" />
          <span className="sl-label" title={`${GATE_LABEL[key]}: ${TEXT[key][gates[key]]}`}>
            {TEXT[key][gates[key]]}
          </span>
        </div>
      ))}
    </div>
  );
}
