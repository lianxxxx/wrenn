import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/links";

// Everything is open to search engines except the brand test page.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/brand-test" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
