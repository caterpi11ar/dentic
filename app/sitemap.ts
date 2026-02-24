import type { MetadataRoute } from "next";

const siteUrl = "https://dentic.caterpi11ar.com";

// Update LAST_UPDATED when making meaningful content changes
const LAST_UPDATED = new Date("2026-02-24");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
