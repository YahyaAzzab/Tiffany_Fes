"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, ViewTransition } from "react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import { categoryName } from "@/lib/store";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const image = product.images[0];
  const needsChoice = product.flavors.length > 0 || product.inquire;

  function quickAdd() {
    cart.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      flavor: null,
      price: product.price,
      image: image?.url ?? "",
      inquire: product.inquire,
      unit: product.unit,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="card-lift flex h-full flex-col">
      <Link href={`/produit/${product.slug}`} transitionTypes={["nav-forward"]} className="block">
        <ViewTransition name={`media-${product.slug}`} share="morph" default="none">
          <div className="poster relative aspect-[9/16] overflow-hidden rounded-[1.7rem]">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt}
                fill
                priority={priority}
                sizes="(max-width: 640px) 90vw, 280px"
                className={image.fit === "cover" ? "object-cover" : "object-contain"}
              />
            ) : (
              <div className="grid h-full place-items-center p-6 text-center text-sm text-muted">Photo à ajouter</div>
            )}
            {product.badge ? (
              <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
                {product.badge}
              </span>
            ) : null}
          </div>
        </ViewTransition>
        <div className="px-1 pt-3">
          <p className="text-xs tracking-[0.14em] text-muted uppercase">{categoryName(product.category)}</p>
          <h3 className="mt-1 text-2xl">{product.name}</h3>
        </div>
      </Link>
      <p className="line-clamp-2 px-1 pt-1 text-sm leading-6 text-muted">{product.description}</p>
      <div className="mt-auto flex items-center justify-between gap-3 px-1 pt-3">
        <p className="price text-2xl">{formatPrice(product.price, product.inquire)}</p>
        {product.stock <= 0 ? (
          <span className="text-sm text-muted">Épuisé</span>
        ) : needsChoice ? (
          <Link href={`/produit/${product.slug}`} transitionTypes={["nav-forward"]} className="btn btn-ghost !min-h-10 !px-4">
            Choisir
          </Link>
        ) : (
          <button className="btn btn-ink !min-h-10 !px-4" onClick={quickAdd}>
            {added ? "Ajouté" : "Ajouter"}
          </button>
        )}
      </div>
    </article>
  );
}
