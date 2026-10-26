import { cacheLife, cacheTag } from "next/cache";
import { io } from "next/cache";
import { readProducts } from "@/lib/repository";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabasePublic } from "@/lib/supabase/server";
import type { Product, ProductImage } from "@/lib/types";

type ImageRow = {
  id: string;
  url: string;
  alt: string | null;
  sort: number | null;
  fit?: string | null;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  details: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  category: string;
  stock: number;
  unit: string | null;
  featured: boolean;
  published: boolean;
  badge: string | null;
  inquire: boolean;
  flavors: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  product_images?: ImageRow[] | null;
};

export function mapProduct(row: ProductRow): Product {
  const images: ProductImage[] = (row.product_images ?? [])
    .map((image, index) => ({
      id: image.id,
      url: image.url,
      alt: image.alt ?? row.name,
      sort: image.sort ?? index,
      fit: image.fit === "cover" ? ("cover" as const) : ("contain" as const),
    }))
    .sort((a, b) => a.sort - b.sort);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    details: row.details ?? "",
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price == null ? null : Number(row.compare_at_price),
    category: row.category,
    stock: row.stock,
    unit: row.unit ?? "pièce",
    featured: row.featured,
    published: row.published,
    badge: row.badge,
    inquire: row.inquire,
    flavors: row.flavors ?? [],
    seoTitle: row.seo_title ?? "",
    seoDescription: row.seo_description ?? "",
    images,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function publishedFromFile() {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  const products = await readProducts();
  return products
    .filter((product) => product.published)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name, "fr"));
}

async function publishedFromSupabase() {
  "use cache";
  cacheTag("catalog");
  cacheLife("hours");
  const supabase = createSupabasePublic();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(mapProduct);
}

export async function listPublished() {
  if (isSupabaseConfigured()) return publishedFromSupabase();
  return publishedFromFile();
}

export async function getPublished(slug: string) {
  const products = await listPublished();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function listAllProducts() {
  await io();
  if (!isSupabaseConfigured()) return readProducts();
  const { createSupabaseServer } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(mapProduct);
}
