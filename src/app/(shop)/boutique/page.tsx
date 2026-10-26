import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";
import { listPublished } from "@/lib/products";

export const metadata: Metadata = {
  title: "Boutique",
  description:
    "Commandez les swirls, coupes et coffrets Tiffany à Fès. Choco Rice, Maxi Dough, Choco Missu et Tiffany Swirl, retrait ou livraison.",
  alternates: { canonical: "/boutique" },
};

export default async function BoutiquePage() {
  const products = await listPublished();
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Catalogue</p>
      <h1 className="mt-2 text-5xl sm:text-6xl">La boutique</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-ink/80">
        Les douceurs du moment, aux prix affichés par Tiffany. Ajoutez, retirez, changez les photos
        depuis l'espace de la boutique.
      </p>
      <div className="mt-8">
        <ShopBrowser products={products} />
      </div>
    </div>
  );
}
