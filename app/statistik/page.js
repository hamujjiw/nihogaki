import Topbar from "@/components/Topbar";
import Footer from "@/components/Footer";
import StatsView from "@/components/StatsView";
import { getJobs } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Statistik pasar kerja",
  description:
    "Sebaran gaji, tuntutan bahasa Jepang, dan teknologi yang paling dicari dari lowongan IT dan business analyst di Jepang.",
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
      <Topbar active="/statistik" />
      <main>
        {!data ? (
          <div className="shell" style={{ paddingBlock: 80 }}>
            <div className="empty">
              <h2>Data belum bisa dimuat</h2>
              <p>Coba muat ulang beberapa menit lagi.</p>
            </div>
          </div>
        ) : (
          <StatsView stats={data.stats} meta={data.meta} />
        )}
      </main>
      {data && <Footer meta={data.meta} />}
    </>
  );
}
