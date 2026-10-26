import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { listAllProducts } from "@/lib/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await listAllProducts()).find((item) => item.id === id);
  if (!product) notFound();
  return (
    <div>
      <h1 className="mb-6 text-4xl">Modifier {product.name}</h1>
      <ProductForm product={product} />
    </div>
  );
}
