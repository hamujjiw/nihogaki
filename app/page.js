import Welcome from "@/components/Welcome";
import Topbar from "@/components/Topbar";
import { getJobs } from "@/lib/aggregate";

// Halaman disajikan sebagai HTML statis dari CDN dan dibangun ulang tiap
// 30 menit, selaras dengan TTL cache data di lib/aggregate.js.
//
// Sebelumnya di sini ada `dynamic = "force-dynamic"`, yang memaksa server
// merender ulang halaman pada tiap kunjungan. Itu tidak memberi data yang
// lebih baru — datanya sudah di-cache 30 menit lewat unstable_cache — tapi
// menambah satu perjalanan bolak-balik ke fungsi server pada tiap klik
// navigasi, plus waktu bangun kalau fungsinya sedang dingin. Dengan ISR,
// Next juga bisa mem-prefetch tautan yang terlihat di layar, sesuatu yang
// tidak mungkin selama halamannya dinamis.
export const revalidate = 1800;

export const metadata = {
  title: "Kerja di Jepang untuk pelamar Indonesia",
};

export default async function Page() {
  let data = null;
  try {
    data = await getJobs();
  } catch {
    data = null;
  }

  const stats = data?.stats || { openToAbroadPct: 0, noJapanesePct: 0 };
  const meta = data?.meta || { total: 0, sources: [] };

  return (
    <>
      <Topbar active="/" />
      <Welcome stats={stats} meta={meta} />
    </>
  );
}
