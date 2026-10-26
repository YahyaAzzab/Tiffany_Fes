import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contacter Tiffany, confiserie à Fès, boulevard Moulay Hicham, en face de l'école IPEP3. Commandes, coffrets et questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-2">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Écrire à la boutique</p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Contact</h1>
        <p className="mt-4 text-lg leading-8">
          {store.address}, {store.city}.
        </p>
        <p className="mt-2 text-muted" lang="ar" dir="rtl">
          بولفار مولاي هشام، أمام مدرسة IPEP3، فاس
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>
            <a href={store.instagram}>{store.instagramHandle}</a>
          </li>
          <li>
            <a href={store.mapsUrl}>Voir sur la carte</a>
          </li>
          {store.phone ? (
            <li>
              <a href={`tel:${store.phone}`}>{store.phone}</a>
            </li>
          ) : null}
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}
