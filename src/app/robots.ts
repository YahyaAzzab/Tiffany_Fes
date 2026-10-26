import type { MetadataRoute } from "next";
import { store } from "@/lib/store";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/commande", "/panier"],
    },
    sitemap: `${store.siteUrl}/sitemap.xml`,
    host: store.siteUrl,
  };
}
