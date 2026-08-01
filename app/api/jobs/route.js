import { NextResponse } from "next/server";
import { getJobs } from "@/lib/aggregate";

export const revalidate = 1800;

/**
 * GET /api/jobs
 * Endpoint publik berisi seluruh lowongan yang sudah dinormalisasi.
 * Berguna kalau nanti kamu mau bikin klien lain (mobile, bot Telegram, dsb).
 */
export async function GET() {
  try {
    const { jobs, meta } = await getJobs();
    return NextResponse.json(
      { jobs, meta },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal mengambil data lowongan", detail: String(err.message || err) },
      { status: 502 }
    );
  }
}
