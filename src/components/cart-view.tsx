"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/format";
import { quote } from "@/lib/pricing";
import { store } from "@/lib/store";
import type { Fulfillment } from "@/lib/types";

export function CartView({
  fulfillment = "retrait",
  showCheckout = false,
  onNavigate,
}: {
  fulfillment?: Fulfillment;
  showCheckout?: boolean;
  onNavigate?: () => void;
}) {
  const cart = useCart();
  const totals = quote(cart.items, fulfillment);
  if (!cart.ready) return <p className="text-muted">Ouverture du panier…</p>;
  if (cart.items.length === 0) {
    return (
      <div>
        <p className="text-lg text-muted">Aucune douceur pour le moment.</p>
        <Link href="/boutique" transitionTypes={["nav-back"]} onClick={onNavigate} className="btn btn-primary mt-6">
          Choisir une douceur
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {cart.items.map((item) => (
        <div key={item.key} className="flex gap-3 rounded-[1.4rem] bg-white p-3">
          <div className="poster relative h-24 w-16 shrink-0 overflow-hidden rounded-2xl">
            {item.image ? <Image src={item.image} alt="" fill className="object-contain" sizes="64px" /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{item.name}</p>
            {item.flavor ? <p className="text-sm text-muted">{item.flavor}</p> : null}
            <p className="price">{formatPrice(item.inquire ? item.price : item.price * item.qty, item.inquire)}</p>
            <div className="mt-2 flex items-center gap-2">
              <button className="h-8 w-8 rounded-full bg-blush" onClick={() => cart.setQty(item.key, item.qty - 1)} aria-label="Diminuer">
                −
              </button>
              <span className="w-6 text-center text-sm">{item.qty}</span>
              <button className="h-8 w-8 rounded-full bg-blush" onClick={() => cart.setQty(item.key, item.qty + 1)} aria-label="Augmenter">
                +
              </button>
              <button className="ml-auto text-sm text-muted" onClick={() => cart.remove(item.key)}>
                Retirer
              </button>
            </div>
          </div>
        </div>
      ))}
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt>Sous-total</dt>
          <dd className="price">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{fulfillment === "livraison" ? "Livraison à Fès" : "Retrait"}</dt>
          <dd>{totals.deliveryFee === 0 ? "Offerte" : formatPrice(totals.deliveryFee)}</dd>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <dt>Total à régler</dt>
          <dd className="price text-2xl">{formatPrice(totals.total)}</dd>
        </div>
      </dl>
      {fulfillment === "livraison" && totals.subtotal > 0 && totals.subtotal < store.freeDeliveryFrom ? (
        <p className="text-xs text-muted">
          Livraison offerte dès {formatPrice(store.freeDeliveryFrom)}.
        </p>
      ) : null}
      {showCheckout ? (
        <Link href="/commande" transitionTypes={["nav-forward"]} onClick={onNavigate} className="btn btn-primary w-full">
          Commander
        </Link>
      ) : null}
    </div>
  );
}
