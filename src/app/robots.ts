import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://sayhitrip.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/trips/", "/t/", "/o/", "/register"],
        disallow: [
          "/admin/",
          "/organizer/",
          "/api/",
          "/post-login",
          "/bookings/",
          "/forgot-password",
          "/reset-password",
          "/login",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
