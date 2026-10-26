import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Marquee } from "@/components/marquee";
import { ProductCard } from "@/components/product-card";
import { listPublished } from "@/lib/products";
import { categories, store } from "@/lib/store";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const products = await listPublished();
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-10 lg:min-h-[calc(100dvh-var(--header))] lg:grid-cols-[1.15fr_0.85fr] lg:py-6">
        <div>
          <p className="rise text-xs font-semibold tracking-[0.18em] text-mint-deep uppercase">
            {store.city} · Boulevard Moulay Hicham
          </p>
          <h1 className="rise mt-4 max-w-xl text-5xl leading-[0.92] sm:text-7xl" style={{ animationDelay: "70ms" }}>
            More than just a candy store.
          </h1>
          <p className="rise mt-4 font-[family-name:var(--font-script)] text-3xl text-pink-hot" style={{ animationDelay: "120ms" }}>
            {store.shortTagline}
          </p>
          <p className="rise mt-5 max-w-lg text-lg leading-8 text-ink/80" style={{ animationDelay: "180ms" }}>
            Swirl à 25 DH, Choco Rice à 16 DH, Maxi Dough à 36 DH, Choco Missu à 20 DH. Vous commandez ici,
            vous retirez en face de l'école IPEP3, ou vous vous faites livrer dans Fès.
          </p>
          <div className="rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link href="/boutique" transitionTypes={["nav-forward"]} className="btn btn-primary">
              Voir la boutique
            </Link>
            <a href={store.instagram} className="btn btn-ghost" rel="noopener noreferrer">
              {store.instagramHandle}
            </a>
          </div>
          <dl className="rise mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm" style={{ animationDelay: "300ms" }}>
            <div>
              <dt className="text-muted">Retrait</dt>
              <dd className="font-semibold">En boutique</dd>
            </div>
            <div>
              <dt className="text-muted">Livraison</dt>
              <dd className="font-semibold">Fès · {store.deliveryFee} DH</dd>
            </div>
            <div>
              <dt className="text-muted">Instagram</dt>
              <dd className="font-semibold">{store.followersLabel}</dd>
            </div>
          </dl>
        </div>
        <div className="floaty mx-auto w-full max-w-[340px]">
          <div className="rounded-[2rem] bg-white p-2 shadow-[0_30px_80px_-36px_rgba(242,92,141,0.85)]">
            <Image
              src="/media/swirl-flavors.jpg"
              alt="Affiche Tiffany Swirl : trois parfums à 25 DH"
              width={360}
              height={640}
              priority
              className="h-auto w-full rounded-[1.6rem]"
            />
          </div>
        </div>
      </section>
      <Marquee />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Les spécialités</p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Ce qu'on vient chercher</h2>
          </div>
          <Link href="/boutique" transitionTypes={["nav-forward"]} className="hidden text-sm font-semibold sm:inline">
            Tout voir
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-8 lg:grid-cols-2">
        <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[1.8rem]">
          <Image
            src="/media/swirl-close.jpg"
            alt="Tiffany Swirl préparé au bar à sauces de la boutique"
            width={360}
            height={640}
            className="h-auto w-full scale-105 object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Dans la boutique</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Sauces, toppings, et le pot à la main.</h2>
          <p className="mt-4 max-w-md text-lg leading-8 text-ink/80">
            Tiffany n'est pas un rayon de supermarché. C'est l'adresse sucrée du boulevard Moulay Hicham :
            on compose, on emporte, on offre. Les coupes partent aussi sur Glovo.
          </p>
          <Link href="/maison" transitionTypes={["nav-forward"]} className="btn btn-ink mt-6">
            L'adresse
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-3">
        {categories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/boutique/${category.slug}`}
            transitionTypes={["nav-forward"]}
            className="card-lift rounded-[1.6rem] bg-white p-6"
          >
            <p className="text-sm text-pink-hot">0{index + 1}</p>
            <h2 className="mt-3 text-3xl">{category.name}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{category.description}</p>
          </Link>
        ))}
      </section>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Livraison</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Vos douceurs, jusqu'à vous.</h2>
          <p className="mt-4 max-w-lg text-lg leading-8">
            Retrait gratuit en boutique. Livraison à Fès à {store.deliveryFee} DH, offerte dès {store.freeDeliveryFrom} DH.
            Tiffany est aussi sur Glovo pour les exclusivités du moment.
          </p>
        </div>
        <Image
          src="/media/glovo.jpg"
          alt="Tiffany livre aussi ses douceurs sur Glovo"
          width={640}
          height={640}
          className="h-auto w-full rounded-[1.8rem]"
        />
      </section>
    </>
  );
}
