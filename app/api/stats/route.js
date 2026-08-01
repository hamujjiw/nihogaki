import { NextResponse } from "next/server";
import { getJobs } from "@/lib/aggregate";

export const revalidate = 1800;

/** GET /api/stats — ringkasan pasar kerja IT Jepang untuk pelamar asing. */
export async function GET() {
  try {
    const { stats, meta } = await getJobs();
    return NextResponse.json(
      { stats, meta },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghitung statistik", detail: String(err.message || err) },
      { status: 502 }
    );
  }
}
