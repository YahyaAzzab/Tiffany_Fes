import type { Metadata } from "next";
import Link from "next/link";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Livraison et paiement à Fès",
  description:
    "Retrait Tiffany au boulevard Moulay Hicham à Fès, ou livraison en ville. Paiement à la réception, en dirhams.",
  alternates: { canonical: "/livraison" },
};

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-5xl sm:text-6xl">Livraison et paiement</h1>
      <div className="mt-8 space-y-5 text-lg leading-8">
        <p>
          Le retrait se fait à la boutique, {store.address}, {store.city}. Il est gratuit.
        </p>
        <p>
          La livraison concerne Fès et les proches alentours. Elle est de {store.deliveryFee} DH, et offerte
          dès {store.freeDeliveryFrom} DH de douceurs au tarif affiché. Au-delà de la ville, la boutique confirme
          avant de partir.
        </p>
        <p>
          Le paiement se fait à la livraison ou au retrait. Il n'y a pas de carte bancaire sur ce site :
          vous ne payez que lorsque la commande est entre vos mains.
        </p>
        <p>{store.allergenNote}</p>
      </div>
      <Link href="/commande" transitionTypes={["nav-forward"]} className="btn btn-primary mt-8">
        Passer commande
      </Link>
    </div>
  );
}
