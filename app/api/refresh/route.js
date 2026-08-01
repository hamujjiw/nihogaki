import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { JOBS_TAG } from "@/lib/aggregate";

// Sejak halaman memakai ISR, ada dua lapis cache yang harus dibatalkan:
// cache data (unstable_cache, lewat tag) dan HTML halaman yang sudah
// dibangun (lewat path). Membatalkan tag saja tidak cukup — datanya
// tersegarkan tapi pengunjung tetap menerima HTML lama sampai jadwal
// pembangunan ulang halaman itu sendiri tiba.
const HALAMAN = ["/", "/lowongan", "/statistik", "/panduan"];

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
  HALAMAN.forEach((path) => revalidatePath(path));

  return NextResponse.json({
    ok: true,
    refreshedAt: new Date().toISOString(),
    revalidated: { tag: JOBS_TAG, paths: HALAMAN },
  });
}
