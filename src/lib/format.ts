import type { OrderStatus } from "@/lib/types";

export function formatPrice(value: number, inquire = false) {
  if (inquire) return "Sur devis";
  const hasCents = Math.round(value * 100) % 100 !== 0;
  const amount = new Intl.NumberFormat("fr-MA", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
  return `${amount} DH`;
}

export const statusLabel: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  preparation: "En préparation",
  livree: "Livrée",
  annulee: "Annulée",
};

export function isPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}
