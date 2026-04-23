import type { MetadataRoute } from "next";
import { getPublicSiteBaseUrl } from "@/lib/public-site-url";

/**
 * บอตฝั่งผู้ให้บริการ AI ที่มักใช้เก็บ/วิเคราะห์หน้าเว็บ — ขอให้ไม่ครอลทั้งไซต์ (เป็นนโยบายสมัครใจ ไม่กันคนวางลิงก์ในแชตได้ 100%)
 * @see https://platform.openai.com/docs/gptbot
 * @see https://support.google.com/webmasters/answer/10619426?hl=en (Google-Extended)
 */
const aiCrawlerUserAgents = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "CCBot",
  "PerplexityBot",
  "Bytespider",
] as const;

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteBaseUrl();
  return {
    rules: [
      {
        userAgent: [...aiCrawlerUserAgents],
        disallow: ["/"],
      },
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
