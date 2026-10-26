import Link from "next/link";
import { deleteProduct } from "@/lib/actions";
import { formatPrice } from "@/lib/format";
import { listAllProducts } from "@/lib/products";
import { categoryName } from "@/lib/store";

export default async function ProductsAdminPage() {
  const products = await listAllProducts();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Produits</h1>
          <p className="mt-2 text-sm text-muted">{products.length} fiches, photos comprises.</p>
        </div>
        <Link href="/admin/produits/nouveau" className="btn btn-primary">
          Nouveau produit
        </Link>
      </div>
      <ul className="mt-6 space-y-3">
        {products.map((product) => (
          <li key={product.id} className="flex flex-col gap-3 rounded-[1.3rem] bg-white p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {product.name}{" "}
                {!product.published ? <span className="text-xs text-muted">Masqué</span> : null}
              </p>
              <p className="text-sm text-muted">
                {categoryName(product.category)} · {product.images.length} photo{product.images.length > 1 ? "s" : ""} · stock {product.stock}
              </p>
            </div>
            <p className="price text-xl">{formatPrice(product.price, product.inquire)}</p>
            <div className="flex gap-2">
              <Link href={`/admin/produits/${product.id}`} className="btn btn-ghost !min-h-10">
                Modifier
              </Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={product.id} />
                <button className="btn btn-ghost !min-h-10 text-price">Retirer</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
