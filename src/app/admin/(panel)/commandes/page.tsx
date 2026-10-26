import { listOrdersAdmin, updateOrderStatus } from "@/lib/actions";
import { formatPrice, statusLabel } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = ["nouvelle", "confirmee", "preparation", "livree", "annulee"];

export default async function OrdersPage() {
  const orders = await listOrdersAdmin();
  return (
    <div>
      <h1 className="text-4xl">Commandes</h1>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? <p className="text-muted">Aucune commande pour le moment.</p> : null}
        {orders.map((order) => (
          <article key={order.id} className="rounded-[1.4rem] bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl">{order.number}</h2>
                <p className="text-sm text-muted">
                  {new Date(order.createdAt).toLocaleString("fr-MA")} · {order.fulfillment === "livraison" ? "Livraison" : "Retrait"}
                </p>
              </div>
              <p className="price text-2xl">{formatPrice(order.total)}</p>
            </div>
            <p className="mt-3 text-sm">
              {order.customerName} · {order.phone}
              {order.email ? ` · ${order.email}` : ""}
            </p>
            {order.fulfillment === "livraison" ? (
              <p className="text-sm text-muted">
                {order.address}, {order.city}
              </p>
            ) : null}
            {order.notes ? <p className="mt-2 text-sm">« {order.notes} »</p> : null}
            <ul className="mt-3 space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.name}
                  {item.flavor ? ` — ${item.flavor}` : ""}
                  {item.inquire ? " (sur devis)" : ` · ${formatPrice(item.unitPrice)}`}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">
              Sous-total {formatPrice(order.subtotal)} · livraison {formatPrice(order.deliveryFee)}
            </p>
            <form action={updateOrderStatus} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="id" value={order.id} />
              <label className="sr-only" htmlFor={`status-${order.id}`}>
                Statut de {order.number}
              </label>
              <select id={`status-${order.id}`} name="status" defaultValue={order.status} className="field !w-auto">
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
              <button className="btn btn-ink !min-h-10">Mettre à jour</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
