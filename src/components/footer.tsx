import Link from "next/link";
import { categories, store, whatsappHref } from "@/lib/store";

export function Footer() {
  const whatsapp = whatsappHref("Bonjour Tiffany, je voudrais commander.");
  return (
    <footer className="mt-20 border-t border-[var(--line)] bg-white/70">
      <div className="candy-stripe" />
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="display text-3xl">Tiffany</p>
          <p className="mt-3 font-[family-name:var(--font-script)] text-lg text-pink-hot">
            {store.shortTagline}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            {store.address}, {store.city}. Confiserie, coupes et coffrets à emporter ou à livrer.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Boutique</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/boutique" transitionTypes={["nav-forward"]}>
                Toutes les douceurs
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/boutique/${category.slug}`} transitionTypes={["nav-forward"]}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Maison</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/maison" transitionTypes={["nav-forward"]}>
                La boutique
              </Link>
            </li>
            <li>
              <Link href="/livraison" transitionTypes={["nav-forward"]}>
                Livraison et paiement
              </Link>
            </li>
            <li>
              <Link href="/contact" transitionTypes={["nav-forward"]}>
                Contact
              </Link>
            </li>
            <li>
              <a href={store.instagram} rel="noopener noreferrer">
                Instagram {store.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Adresse</p>
          <p className="mt-3 text-sm leading-6">
            {store.address}
            <br />
            {store.city}, Maroc
          </p>
          <a className="mt-3 inline-block text-sm font-semibold text-mint-deep" href={store.mapsUrl} rel="noopener noreferrer">
            Voir sur la carte
          </a>
          <p className="mt-2 text-sm text-muted" lang="ar" dir="rtl">
            تيفاني، حلويات فاس — بولفار مولاي هشام، أمام مدرسة IPEP3
          </p>
          {store.phone ? (
            <a className="mt-3 block text-sm" href={`tel:${store.phone}`}>
              {store.phone}
            </a>
          ) : null}
          {whatsapp ? (
            <a className="mt-2 block text-sm" href={whatsapp}>
              Écrire sur WhatsApp
            </a>
          ) : null}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-8">
        <p className="wordmark-outline text-[18vw] sm:text-[11rem]">TIFFANY</p>
        <p className="mt-4 text-xs leading-5 text-muted">
          Prix en dirhams. Paiement à la livraison ou au retrait. {store.allergenNote}
        </p>
      </div>
    </footer>
  );
}
