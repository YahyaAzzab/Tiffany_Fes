import { promises as fs } from "fs";
import path from "path";
import type { Order, Product, ShopMessage } from "@/lib/types";

const dataDir = () => path.join(process.cwd(), "data");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2));
  await fs.rename(tmp, file);
}

function normalize(product: Product): Product {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice:
      product.compareAtPrice == null ? null : Number(product.compareAtPrice),
    stock: Number(product.stock),
    flavors: product.flavors ?? [],
    images: [...(product.images ?? [])]
      .map((image, index) => ({
        ...image,
        sort: image.sort ?? index,
        fit: image.fit === "cover" ? ("cover" as const) : ("contain" as const),
      }))
      .sort((a, b) => a.sort - b.sort),
  };
}

export async function readProducts() {
  const products = await readJson<Product[]>(
    path.join(dataDir(), "catalog.json"),
    [],
  );
  return products.map(normalize);
}

export async function writeProducts(products: Product[]) {
  await writeJson(path.join(dataDir(), "catalog.json"), products);
}

export async function readOrders() {
  return readJson<Order[]>(path.join(dataDir(), "orders.json"), []);
}

export async function writeOrders(orders: Order[]) {
  await writeJson(path.join(dataDir(), "orders.json"), orders);
}

export async function readMessages() {
  return readJson<ShopMessage[]>(path.join(dataDir(), "messages.json"), []);
}

export async function writeMessages(messages: ShopMessage[]) {
  await writeJson(path.join(dataDir(), "messages.json"), messages);
}

export function uploadsDir() {
  return path.join(process.cwd(), "public", "uploads");
}
