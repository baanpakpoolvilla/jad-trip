import type { MetadataRoute } from "next";
import { TripStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicSiteBaseUrl();

  const trips = await db.trip.findMany({
    where: { status: TripStatus.PUBLISHED },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const tripEntries: MetadataRoute.Sitemap = trips.map((t) => ({
    url: `${base}/trips/${t.id}`,
    lastModified: t.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${base}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...tripEntries,
  ];
}
