import type { MetadataRoute } from "next";
import { listPublished } from "@/lib/products";
import { categories, store } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listPublished();
  const now = new Date();
  const staticRoutes = ["", "/boutique", "/maison", "/contact", "/livraison", ...categories.map((category) => `/boutique/${category.slug}`)];
  return [
    ...staticRoutes.map((route) => ({
      url: `${store.siteUrl}${route || "/"}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...products.map((product) => ({
      url: `${store.siteUrl}/produit/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
