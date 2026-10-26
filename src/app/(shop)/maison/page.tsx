import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "La maison sucrée de Fès",
  description:
    "Tiffany est la confiserie du boulevard Moulay Hicham à Fès, en face de l'école IPEP3. Sweet escape, swirls, coupes et coffrets.",
  alternates: { canonical: "/maison" },
};

export default function HousePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Fès</p>
      <h1 className="mt-2 max-w-3xl text-5xl leading-[0.95] sm:text-7xl">
        More than just a candy store.
      </h1>
      <p className="mt-4 font-[family-name:var(--font-script)] text-3xl text-pink-hot">{store.shortTagline}</p>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Image
          src="/media/tiramisu.jpg"
          alt="Signe Tiffany : Join the line, it's Tiffany time"
          width={361}
          height={640}
          className="h-auto w-full rounded-[1.8rem]"
        />
        <div className="space-y-5 text-lg leading-8">
          <p>
            Tiffany tient boutique au {store.address}, à {store.city}. L'enseigne rose et lagon,
            le pot à la statue, le néon Sweet Escape : on vient pour un swirl, on repart avec une coupe de plus.
          </p>
          <p>
            Au comptoir : le Tiffany Swirl à 25 DH, le Choco Rice à 16 DH, le Maxi Dough à 36 DH et le Choco Missu à 20 DH.
            Les coffrets d'anniversaire se composent sur demande. La ligne tiramisu se publie depuis l'espace boutique
            dès que les photos et le prix sont prêts.
          </p>
          <p>
            {store.followersLabel} personnes suivent {store.instagramHandle}. Les commandes de ce site arrivent
            directement à la boutique : retrait sur place, ou livraison dans Fès.
          </p>
          <a className="btn btn-ink" href={store.mapsUrl} rel="noopener noreferrer">
            Ouvrir l'itinéraire
          </a>
        </div>
      </div>
      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {[
          ["1", "Choisissez", "Un parfum, une coupe, ou un coffret à composer."],
          ["2", "Laissez un numéro", "La boutique confirme avant de préparer."],
          ["3", "Retirez ou recevez", "Paiement en main propre, à la boutique ou à Fès."],
        ].map(([step, title, text]) => (
          <article key={step} className="rounded-[1.5rem] bg-white p-6">
            <p className="text-pink-hot">{step}</p>
            <h2 className="mt-2 text-3xl">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </article>
        ))}
      </section>
      <p className="mt-10">
        <Link href="/boutique" transitionTypes={["nav-forward"]} className="btn btn-primary">
          Commander
        </Link>
      </p>
    </div>
  );
}
