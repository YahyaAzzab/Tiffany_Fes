"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { categoryName } from "@/lib/store";
import type { Product } from "@/lib/types";

export function ShopBrowser({
  products,
  initialCategory = "tout",
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("vedette");
  const categories = ["tout", ...Array.from(new Set(products.map((product) => product.category)))];

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory = category === "tout" || product.category === category;
      const matchesQuery =
        !needle ||
        `${product.name} ${product.description} ${product.flavors.join(" ")}`.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
    const ranked = [...filtered];
    if (sort === "prix-asc") ranked.sort((a, b) => a.price - b.price);
    if (sort === "prix-desc") ranked.sort((a, b) => b.price - a.price);
    if (sort === "nom") ranked.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    return ranked;
  }, [products, category, query, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="recherche">
          Rechercher une douceur
        </label>
        <input
          id="recherche"
          className="field sm:max-w-xs"
          placeholder="Rechercher"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="sr-only" htmlFor="tri">
          Trier
        </label>
        <select id="tri" className="field sm:ml-auto sm:max-w-52" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="vedette">Vedettes</option>
          <option value="prix-asc">Prix croissant</option>
          <option value="prix-desc">Prix décroissant</option>
          <option value="nom">Nom</option>
        </select>
      </div>
      <div className="mt-4 flex gap-2 overflow-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
              category === item ? "bg-ink text-white" : "bg-white"
            }`}
          >
            {item === "tout" ? "Tout" : categoryName(item)}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-10 text-muted">Aucune douceur ne correspond.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 min-[520px]:grid-cols-2 lg:grid-cols-4">
          {visible.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
