import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { store } from "@/lib/store";

const localBusiness = {
  "@context": "https://schema.org",
  "@type": ["CandyStore", "FoodEstablishment"],
  name: "Tiffany",
  description: store.tagline,
  url: store.siteUrl,
  image: `${store.siteUrl}/media/swirl-flavors.jpg`,
  servesCuisine: "Confiserie",
  address: {
    "@type": "PostalAddress",
    streetAddress: store.address,
    addressLocality: "Fès",
    addressCountry: "MA",
  },
  areaServed: "Fès",
  geo: {
    "@type": "GeoCoordinates",
    latitude: store.latitude,
    longitude: store.longitude,
  },
  hasMap: store.mapsUrl,
  sameAs: [store.instagram],
  currenciesAccepted: "MAD",
  paymentAccepted: "Cash",
  ...(store.phone ? { telephone: store.phone } : {}),
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={localBusiness} />
      <Header />
      <main id="contenu">
        <Suspense fallback={<div className="mx-auto max-w-6xl px-5 py-16 text-muted">Préparation…</div>}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
