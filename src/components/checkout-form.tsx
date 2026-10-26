"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/lib/actions";
import { useCart } from "@/components/cart-provider";
import { CartView } from "@/components/cart-view";
import type { Fulfillment } from "@/lib/types";

export function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("retrait");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    formData.set("fulfillment", fulfillment);
    formData.set(
      "items",
      JSON.stringify(
        cart.items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          flavor: item.flavor,
        })),
      ),
    );
    const result = await placeOrder(formData);
    setPending(false);
    if (result.error || !result.number) {
      setError(result.error ?? "La commande n'a pas pu être enregistrée.");
      return;
    }
    cart.clear();
    router.push(`/commande/merci/${result.number}`);
  }

  return (
    <form onSubmit={onSubmit} className="grid items-start gap-8 lg:grid-cols-[1fr_0.85fr]">
      <div className="order-2 space-y-4 lg:order-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`rounded-[1.3rem] p-4 text-left ${fulfillment === "retrait" ? "bg-ink text-white" : "bg-white"}`}
            onClick={() => setFulfillment("retrait")}
          >
            <span className="block font-semibold">Retrait boutique</span>
            <span className="mt-1 block text-sm opacity-80">Boulevard Moulay Hicham, gratuit</span>
          </button>
          <button
            type="button"
            className={`rounded-[1.3rem] p-4 text-left ${fulfillment === "livraison" ? "bg-ink text-white" : "bg-white"}`}
            onClick={() => setFulfillment("livraison")}
          >
            <span className="block font-semibold">Livraison à Fès</span>
            <span className="mt-1 block text-sm opacity-80">20 DH, offerte dès 150 DH</span>
          </button>
        </div>
        <label className="block text-sm font-medium">
          Nom
          <input className="field mt-1" name="name" required autoComplete="name" />
        </label>
        <label className="block text-sm font-medium">
          Téléphone
          <input className="field mt-1" name="phone" required inputMode="tel" autoComplete="tel" placeholder="06…" />
        </label>
        <label className="block text-sm font-medium">
          E-mail <span className="text-muted">(facultatif)</span>
          <input className="field mt-1" name="email" type="email" autoComplete="email" />
        </label>
        <label className="block text-sm font-medium">
          Ville
          <input className="field mt-1" name="city" defaultValue="Fès" required />
        </label>
        {fulfillment === "livraison" ? (
          <label className="block text-sm font-medium">
            Adresse
            <textarea className="field mt-1 min-h-24" name="address" required placeholder="Quartier, rue, repère" />
          </label>
        ) : (
          <input type="hidden" name="address" value="" />
        )}
        <label className="block text-sm font-medium">
          Message
          <textarea className="field mt-1 min-h-24" name="notes" placeholder="Parfum, prénom sur le coffret, heure de passage…" />
        </label>
        {error ? <p className="text-sm text-price">{error}</p> : null}
        <button className="btn btn-primary w-full" disabled={pending || cart.items.length === 0}>
          {pending ? "Envoi…" : "Confirmer la commande"}
        </button>
        <p className="text-xs leading-5 text-muted">
          Paiement à la livraison ou au retrait. La boutique confirme par téléphone. Les pièces sur devis sont chiffrées avant préparation.
        </p>
      </div>
      <aside className="order-1 rounded-[1.6rem] bg-white/70 p-4 lg:sticky lg:top-24 lg:order-2">
        <h2 className="text-2xl">Récapitulatif</h2>
        <div className="mt-4">
          <CartView fulfillment={fulfillment} />
        </div>
      </aside>
    </form>
  );
}
