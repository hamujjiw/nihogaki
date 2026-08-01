import Welcome from "@/components/Welcome";
import Topbar from "@/components/Topbar";
import { getJobs } from "@/lib/aggregate";

export const dynamic = "force-dynamic";

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
