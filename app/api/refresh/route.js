import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { JOBS_TAG } from "@/lib/aggregate";

/**
 * Dipanggil Vercel Cron (lihat vercel.json) untuk menyegarkan cache
 * di luar jam sibuk. Bisa juga dipanggil manual:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://situsmu/api/refresh
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  const fromVercelCron = request.headers.has("x-vercel-cron");

  if (secret && !fromVercelCron && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  revalidateTag(JOBS_TAG);
  return NextResponse.json({ ok: true, refreshedAt: new Date().toISOString() });
}
