"use client";

import Image from "next/image";
import { useState, ViewTransition } from "react";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductStage({ product }: { product: Product }) {
  const cart = useCart();
  const [active, setActive] = useState(0);
  const [flavor, setFlavor] = useState(product.flavors[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function add() {
    if (product.flavors.length && !flavor) return;
    cart.add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      flavor: flavor || null,
      price: product.price,
      image: product.images[0]?.url ?? "",
      qty,
      inquire: product.inquire,
      unit: product.unit,
    });
    setAdded(true);
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
      <div>
        <ViewTransition name={`media-${product.slug}`} share="morph" default="none">
          <div className="poster relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-[1.8rem]">
            {product.images.length ? (
              product.images.map((item, index) => (
                <Image
                  key={item.id}
                  src={item.url}
                  alt={item.alt}
                  fill
                  priority={index === 0}
                  sizes="340px"
                  className={`transition-opacity duration-500 ${item.fit === "cover" ? "object-cover scale-105" : "object-contain"} ${
                    index === active ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted">Photo à venir</div>
            )}
          </div>
        </ViewTransition>
        {product.images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-2">
            {product.images.map((item, index) => (
              <button
                key={item.id}
                aria-label={`Photo ${index + 1} de ${product.name}`}
                onClick={() => setActive(index)}
                className={`relative h-16 w-12 overflow-hidden rounded-xl border-2 transition-colors ${
                  index === active ? "border-pink-hot" : "border-transparent"
                }`}
              >
                <Image src={item.url} alt="" fill className="object-cover" sizes="48px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div>
        {product.badge ? (
          <p className="inline-flex rounded-full bg-blush px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase">
            {product.badge}
          </p>
        ) : null}
        <h1 className="mt-3 text-5xl sm:text-6xl">{product.name}</h1>
        <p className="price mt-3 text-4xl">{formatPrice(product.price, product.inquire)}</p>
        <p className="mt-4 max-w-xl text-lg leading-8 text-ink/80">{product.description}</p>
        {product.flavors.length ? (
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Parfum</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.flavors.map((item) => (
                <label key={item} className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors ${flavor === item ? "bg-ink text-white" : "bg-white"}`}>
                  <input className="sr-only" type="radio" name="flavor" checked={flavor === item} onChange={() => setFlavor(item)} />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-full bg-white p-1">
            <button className="h-10 w-10 rounded-full" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Diminuer">
              −
            </button>
            <span className="w-8 text-center">{qty}</span>
            <button className="h-10 w-10 rounded-full" onClick={() => setQty((value) => Math.min(12, product.stock, value + 1))} aria-label="Augmenter">
              +
            </button>
          </div>
          <button className="btn btn-primary" disabled={soldOut} onClick={add}>
            {soldOut ? "Épuisé" : added ? "Ajouté au panier" : product.inquire ? "Demander ce coffret" : "Ajouter au panier"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">
          {product.unit} · {soldOut ? "Rupture" : `${product.stock} en stock`}
        </p>
        {product.details ? <p className="mt-6 max-w-xl text-sm leading-7 text-muted">{product.details}</p> : null}
      </div>
    </div>
  );
}
