import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Result pages are kept out of search with a noindex meta tag rather than a
// Disallow rule: crawlers have to be able to fetch a page to see noindex.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
