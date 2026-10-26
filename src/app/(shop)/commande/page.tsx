import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Commande",
  description: "Commandez chez Tiffany à Fès : retrait boulevard Moulay Hicham ou livraison, paiement à la réception.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/commande" },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-5xl sm:text-6xl">Commande</h1>
      <p className="mt-3 max-w-xl text-muted">Dites-nous où remettre les pots. On prépare, vous payez en main propre.</p>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </div>
  );
}
