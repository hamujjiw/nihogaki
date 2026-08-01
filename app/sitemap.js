const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://papan-lowongan-it-jepang.vercel.app";

export default function sitemap() {
  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];
}
