import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopBrowser } from "@/components/shop-browser";
import { listPublished } from "@/lib/products";
import { categories } from "@/lib/store";

export async function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const current = categories.find((item) => item.slug === category);
  if (!current) return { title: "Rayon" };
  return {
    title: `${current.name} à Fès`,
    description: current.description,
    alternates: { canonical: `/boutique/${current.slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const current = categories.find((item) => item.slug === category);
  const products = (await listPublished()).filter((product) => product.category === category);
  if (!current || products.length === 0) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Tiffany · Fès</p>
      <h1 className="mt-2 text-5xl sm:text-6xl">{current.name}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8">{current.description}</p>
      <div className="mt-8">
        <ShopBrowser products={products} initialCategory={category} />
      </div>
    </div>
  );
}
