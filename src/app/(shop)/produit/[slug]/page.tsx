import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductStage } from "@/components/product-stage";
import { getPublished, listPublished } from "@/lib/products";
import { categoryName, store } from "@/lib/store";

export async function generateStaticParams() {
  const products = await listPublished();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublished(slug);
  if (!product) return { title: "Produit" };
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description;
  return {
    title,
    description,
    alternates: { canonical: `/produit/${product.slug}` },
    openGraph: {
      title,
      description,
      images: product.images[0]
        ? [{ url: product.images[0].url, alt: product.images[0].alt }]
        : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublished(slug);
  if (!product) notFound();
  const related = (await listPublished())
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) =>
      image.url.startsWith("http") ? image.url : `${store.siteUrl}${image.url}`,
    ),
    sku: product.slug,
    brand: { "@type": "Brand", name: "Tiffany" },
    category: categoryName(product.category),
    offers: {
      "@type": "Offer",
      url: `${store.siteUrl}/produit/${product.slug}`,
      priceCurrency: "MAD",
      price: product.inquire ? undefined : product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Tiffany" },
    },
  };

  return (
    <article className="mx-auto max-w-6xl px-5 py-10">
      <JsonLd data={jsonLd} />
      <nav className="text-sm text-muted">
        <Link href="/boutique" transitionTypes={["nav-back"]}>
          Boutique
        </Link>
        <span aria-hidden="true"> / </span>
        <Link href={`/boutique/${product.category}`} transitionTypes={["nav-back"]}>
          {categoryName(product.category)}
        </Link>
      </nav>
      <div className="mt-6">
        <ProductStage product={product} />
      </div>
      {related.length ? (
        <section className="mt-16">
          <h2 className="text-4xl">Dans le même rayon</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 min-[520px]:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
