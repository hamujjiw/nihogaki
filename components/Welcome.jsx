import Link from "next/link";
import Sakura from "./Sakura";

/**
 * Halaman sambutan: satu kartu pos utuh, diletakkan di tengah layar.
 *
 * Bentuknya mengikuti hagaki asli — bingkai kotak yang kelihatan, motif
 * menumpuk di satu pojok, blok kode pos di kaki kartu. Potret di mobile
 * mengikuti rasio kartu pos Jepang, lanskap di desktop supaya ruang
 * lebarnya terpakai dan kartunya tidak jadi jangkung.
 *
 * Isinya sengaja pendek. Format kartu pos memang tidak menampung
 * paragraf panjang, dan daftar berpoin di sini terbaca seperti
 * spesifikasi produk. Tiga syaratnya tetap dijelaskan, tapi lewat
 * kalimat yang mengalir. Alat baca yang sebenarnya hidup di kartu
 * lowongan, tempat orang memang perlu memindai cepat.
 */
export default function Welcome({ stats, meta }) {
  return (
    <main className="welcome">
      <article className="hagaki">
        <Sakura variant="hagaki" />
        <div className="hagaki-frame" aria-hidden="true" />

        <div className="hagaki-body">
          <div className="hagaki-brand">
            <span className="brand-mark" aria-hidden="true">〒</span>
            <span>Nihogaki</span>
          </div>

          <div className="hagaki-main">
            <div>
              <h1 className="hagaki-title">
                Sulit menemukan lowongan IT di Jepang yang benar-benar terbuka
                untuk orang asing?
              </h1>

              <div className="hagaki-lede">
                <p>Tenang, Nihogaki mengumpulkan semuanya di satu tempat.</p>
                <p>
                  Tiap lowongan sudah kami tandai lebih dulu: seberapa jauh bahasa
                  Jepangnya diminta, bisa atau tidak dilamar dari Indonesia, dan
                  seperti apa lokasi kerjanya. Jadi kamu tidak perlu bolak-balik
                  puluhan situs cuma untuk tahu boleh melamar atau tidak.
                </p>
              </div>

              <div className="hagaki-actions">
                <Link className="btn btn-primary" href="/lowongan">
                  Lihat lowongan
                </Link>
                <Link className="btn btn-ghost btn-sm" href="/panduan">
                  Panduan
                </Link>
              </div>
            </div>

            <div className="hagaki-count">
              <div className="hagaki-count-box">
                <span className="label">Terbuka dari Indonesia</span>
                <div className="hagaki-count-num">{stats.openToAbroadPct}%</div>
                <span className="label">{stats.noJapanesePct}% tanpa syarat bahasa</span>
              </div>
            </div>
          </div>

          <div className="hagaki-foot">
            <div className="postcode">
              <span className="postcode-mark" aria-hidden="true">〒</span>
              <div className="postcode-boxes" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span className="hagaki-meta">{meta.total} lowongan</span>
            </div>
            <span className="hagaki-meta">Diperbarui tiap 30 menit</span>
          </div>
        </div>
      </article>
    </main>
  );
}
