import Sakura from "./Sakura";

export default function Footer({ meta }) {
  return (
    <footer className="foot shell">
      <Sakura variant="pita" />
      <div className="foot-grid">
        <div>
          <h3>Status sumber</h3>
          {(meta.sources || []).map((s) => (
            <div className="srcline" key={s.name} data-ok={s.ok}>
              <span className="srcdot" aria-hidden="true" />
              {s.name}
              <span>{s.ok ? `${s.count} lowongan` : s.error}</span>
            </div>
          ))}
          <p className="note">
            Data diperbarui tiap 30 menit dan setiap malam lewat cron. Kalau satu sumber
            gagal, sisanya tetap tampil.
          </p>
        </div>

        <div>
          <h3>Yang perlu kamu tahu</h3>
          <p>
            Papan ini <strong>tidak memproses lamaran</strong>. Semua tombol melamar
            mengarah ke halaman aslinya di TokyoDev atau Japan Dev. Lowongan bisa ditutup
            kapan saja tanpa pemberitahuan, jadi selalu cek halaman sumber sebelum melamar.
          </p>
          <p>
            Label bahasa Jepang dan status lamaran dari luar Jepang mengikuti penandaan
            sumbernya. Kalau sebuah lowongan tidak mencantumkan levelnya, ia tetap
            ditampilkan dan ditandai &ldquo;tidak jelas&rdquo; alih-alih disembunyikan.
          </p>
        </div>

        <div>
          <h3>Angka rupiah</h3>
          <p>
            Konversi memakai kurs{" "}
            <span className="mono">¥1 ≈ Rp {meta.fx?.rate}</span>
            {meta.fx?.live ? ", diambil langsung dari API kurs" : " (nilai cadangan)"}, lalu
            dibulatkan. Ini <strong>gaji kotor</strong>. Pajak, asuransi kesehatan, dan
            pensiun di Jepang biasanya memotong sekitar 20 sampai 30 persen.
          </p>
          <p>
            Skor kecocokan dihitung sepenuhnya di browser kamu. Profil yang kamu isi tidak
            pernah dikirim ke server mana pun.
          </p>
        </div>
      </div>
    </footer>
  );
}
