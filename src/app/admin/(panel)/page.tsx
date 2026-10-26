import Link from "next/link";
import { importCatalog, listMessagesAdmin, listOrdersAdmin } from "@/lib/actions";
import { formatPrice, statusLabel } from "@/lib/format";
import { listAllProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function DashboardPage() {
  const [products, orders, messages] = await Promise.all([
    listAllProducts(),
    listOrdersAdmin(),
    listMessagesAdmin(),
  ]);
  const openOrders = orders.filter((order) => order.status === "nouvelle" || order.status === "confirmee");

  return (
    <div>
      <h1 className="text-4xl">Tableau</h1>
      <p className="mt-2 text-muted">
        {isSupabaseConfigured()
          ? "Les produits et commandes sont enregistrés dans Supabase."
          : "Mode démo : tout est enregistré sur cet ordinateur, dans le dossier data."}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Produits", String(products.length)],
          ["Commandes ouvertes", String(openOrders.length)],
          ["Messages", String(messages.length)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[1.4rem] bg-white p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="display mt-1 text-4xl">{value}</p>
          </article>
        ))}
      </div>
      {isSupabaseConfigured() && products.length === 0 ? (
        <form action={importCatalog} className="mt-6 rounded-[1.4rem] bg-blush p-5">
          <p>Supabase est vide. Importez le catalogue Tiffany déjà préparé.</p>
          <button className="btn btn-ink mt-3">Importer le catalogue</button>
        </form>
      ) : null}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Dernières commandes</h2>
          <Link href="/admin/commandes" className="text-sm font-semibold">
            Toutes
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {orders.slice(0, 5).map((order) => (
            <li key={order.id} className="flex flex-wrap justify-between gap-2 rounded-2xl bg-white px-4 py-3 text-sm">
              <span className="font-semibold">{order.number}</span>
              <span>{order.customerName}</span>
              <span>{statusLabel[order.status]}</span>
              <span className="price">{formatPrice(order.total)}</span>
            </li>
          ))}
          {orders.length === 0 ? <li className="text-sm text-muted">Aucune commande.</li> : null}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-2xl">Messages</h2>
        <ul className="mt-3 space-y-2">
          {messages.slice(0, 4).map((message) => (
            <li key={message.id} className="rounded-2xl bg-white px-4 py-3 text-sm">
              <p className="font-semibold">
                {message.name} · {message.phone}
              </p>
              <p className="mt-1 text-muted">{message.body}</p>
            </li>
          ))}
          {messages.length === 0 ? <li className="text-sm text-muted">Aucun message.</li> : null}
        </ul>
      </section>
    </div>
  );
}
