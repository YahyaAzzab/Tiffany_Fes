import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Panier",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <h1 className="text-5xl">Panier</h1>
      <div className="mt-8">
        <CartView showCheckout />
      </div>
    </div>
  );
}
