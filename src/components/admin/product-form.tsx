"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveProduct, type ActionState } from "@/lib/actions";
import { categories } from "@/lib/store";
import { slugify } from "@/lib/slug";
import type { Product, ProductImage } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveProduct, {});
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const known = new Set<string>(categories.map((category) => category.slug));
  if (product?.category) known.add(product.category);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="existingImages" value={JSON.stringify(images)} />
      <div className="space-y-4">
        <label className="block text-sm font-medium">
          Nom
          <input
            className="field mt-1"
            name="name"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) setSlug(slugify(event.target.value));
            }}
          />
        </label>
        <label className="block text-sm font-medium">
          Adresse du produit
          <input
            className="field mt-1"
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
          />
        </label>
        <label className="block text-sm font-medium">
          Description courte
          <textarea className="field mt-1 min-h-24" name="description" defaultValue={product?.description} />
        </label>
        <label className="block text-sm font-medium">
          Détails
          <textarea className="field mt-1 min-h-32" name="details" defaultValue={product?.details} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Prix (DH)
            <input className="field mt-1" name="price" type="number" min="0" step="0.5" defaultValue={product?.price ?? 0} required />
          </label>
          <label className="block text-sm font-medium">
            Ancien prix
            <input className="field mt-1" name="compareAtPrice" type="number" min="0" step="0.5" defaultValue={product?.compareAtPrice ?? ""} />
          </label>
          <label className="block text-sm font-medium">
            Stock
            <input className="field mt-1" name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? 0} required />
          </label>
          <label className="block text-sm font-medium">
            Unité
            <input className="field mt-1" name="unit" defaultValue={product?.unit ?? "pot"} />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Rayon
          <select className="field mt-1" name="category" defaultValue={product?.category ?? "coupes"}>
            {[...known].map((slug) => (
              <option key={slug} value={slug}>
                {categories.find((category) => category.slug === slug)?.name ?? slug}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Parfums, séparés par des virgules
          <input className="field mt-1" name="flavors" defaultValue={product?.flavors.join(", ") ?? ""} placeholder="Rainbow Candy, Chocolate Brownie" />
        </label>
        <label className="block text-sm font-medium">
          Badge
          <input className="field mt-1" name="badge" defaultValue={product?.badge ?? ""} placeholder="16 DH, Sur devis…" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Titre Google
            <input className="field mt-1" name="seoTitle" defaultValue={product?.seoTitle} />
          </label>
          <label className="block text-sm font-medium">
            Description Google
            <input className="field mt-1" name="seoDescription" defaultValue={product?.seoDescription} />
          </label>
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Photos</legend>
          {images.length === 0 ? <p className="text-sm text-muted">Aucune photo pour l'instant.</p> : null}
          <ul className="space-y-3">
            {images.map((image, index) => (
              <li key={image.id} className="flex gap-3 rounded-2xl bg-white p-3">
                <div className="relative h-20 w-14 overflow-hidden rounded-xl bg-blush">
                  {image.url.startsWith("blob:") ? (
                    // Blob previews are local only, before the file is saved.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image src={image.url} alt="" fill className="object-cover" sizes="56px" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    className="field !py-2"
                    value={image.alt}
                    aria-label={`Texte alternatif de la photo ${index + 1}`}
                    onChange={(event) =>
                      setImages((current) =>
                        current.map((item) => (item.id === image.id ? { ...item, alt: event.target.value } : item)),
                      )
                    }
                  />
                  <div className="flex flex-wrap gap-2 text-sm">
                    <button type="button" className="rounded-full bg-blush px-3 py-1" onClick={() => move(index, -1)} disabled={index === 0}>
                      Monter
                    </button>
                    <button type="button" className="rounded-full bg-blush px-3 py-1" onClick={() => move(index, 1)} disabled={index === images.length - 1}>
                      Descendre
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-blush px-3 py-1"
                      onClick={() =>
                        setImages((current) =>
                          current.map((item) =>
                            item.id === image.id ? { ...item, fit: item.fit === "cover" ? "contain" : "cover" } : item,
                          ),
                        )
                      }
                    >
                      {image.fit === "cover" ? "Remplir" : "Affiche entière"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-3 py-1 text-price"
                      onClick={() => setImages((current) => current.filter((item) => item.id !== image.id).map((item, sort) => ({ ...item, sort })))}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <label className="block text-sm font-medium">
            Ajouter des photos
            <input className="mt-2 block w-full text-sm" type="file" name="photos" accept="image/jpeg,image/png,image/webp,image/gif" multiple />
          </label>
          <p className="text-xs text-muted">Jusqu'à 8 photos, 6 Mo chacune. JPG, PNG ou WEBP.</p>
        </fieldset>
      </div>
      <aside className="h-fit space-y-4 rounded-[1.4rem] bg-white p-4 lg:sticky lg:top-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={product?.published ?? true} />
          Publié sur le site
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Mettre en avant
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="inquire" defaultChecked={product?.inquire ?? false} />
          Prix sur devis
        </label>
        {state.error ? <p className="text-sm text-price">{state.error}</p> : null}
        <button className="btn btn-primary w-full" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </aside>
    </form>
  );

  function move(index: number, direction: number) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next.map((image, sort) => ({ ...image, sort }));
    });
  }
}
