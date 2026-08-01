import { Suspense } from "react";
import JobBoard from "@/components/JobBoard";
import Footer from "@/components/Footer";
import Topbar from "@/components/Topbar";
import { getJobs } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cari lowongan",
  description:
    "Lowongan IT, business analyst, dan transformasi digital di Jepang untuk pelamar dari Indonesia. Tingkat fresh graduate sampai menengah.",
};

export default async function Page() {
  let data = null;
  try {
    data = await getJobs();
  } catch {
    data = null;
  }

  return (
    <>
      <a className="skip-link" href="#hasil">
        Lompat ke daftar lowongan
      </a>

      <Topbar active="/lowongan" />

      <main>
        {!data ? (
          <div className="shell" style={{ paddingBlock: 80 }}>
            <div className="empty">
              <h2>Papan sedang kosong</h2>
              <p>Semua sumber gagal dihubungi barusan. Coba muat ulang beberapa menit lagi.</p>
            </div>
          </div>
        ) : (
          <Suspense fallback={<div className="shell" style={{ paddingBlock: 80 }} />}>
            <JobBoard jobs={data.jobs} stats={data.stats} meta={data.meta} />
          </Suspense>
        )}
      </main>

      {data && <Footer meta={data.meta} />}
    </>
  );
}
