import { store } from "@/lib/store";
import type { Fulfillment } from "@/lib/types";

export function quote(
  lines: { price: number; qty: number; inquire: boolean }[],
  fulfillment: Fulfillment,
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + (line.inquire ? 0 : line.price * line.qty),
    0,
  );
  const deliveryFee =
    fulfillment === "retrait" || (subtotal >= store.freeDeliveryFrom && subtotal > 0)
      ? 0
      : store.deliveryFee;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
