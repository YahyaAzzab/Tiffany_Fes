"use server";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, clearDemoSession, setDemoSession } from "@/lib/auth";
import { clip, isPhone } from "@/lib/format";
import { quote } from "@/lib/pricing";
import { mapProduct } from "@/lib/products";
import {
  readMessages,
  readOrders,
  readProducts,
  uploadsDir,
  writeMessages,
  writeOrders,
  writeProducts,
} from "@/lib/repository";
import { slugify } from "@/lib/slug";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";
import type {
  Fulfillment,
  ImageFit,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductImage,
  ShopMessage,
} from "@/lib/types";

export type ActionState = { error?: string; ok?: boolean };

async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Connexion requise.");
  return session;
}

function touchCatalog() {
  updateTag("catalog");
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Indiquez l'e-mail et le mot de passe." };

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Identifiants refusés. Vérifiez le compte créé dans Supabase." };
    redirect("/admin");
  }

  const expectedEmail = (process.env.DEMO_ADMIN_EMAIL || "").trim().toLowerCase();
  const expectedPassword = process.env.DEMO_ADMIN_PASSWORD || "";
  if (!expectedEmail || !expectedPassword) {
    return { error: "Le mode démo n'a pas d'identifiants dans le fichier .env." };
  }
  if (email !== expectedEmail || password !== expectedPassword) {
    return { error: "Identifiants refusés." };
  }
  await setDemoSession();
  redirect("/admin");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  } else {
    await clearDemoSession();
  }
  redirect("/admin/login");
}

async function storeUpload(file: File, folder: string) {
  if (!file.size) return null;
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("Chaque photo doit faire moins de 6 Mo.");
  }
  const allowed: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const ext = allowed[file.type];
  if (!ext) throw new Error("Formats acceptés : JPG, PNG, WEBP, GIF.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const objectPath = `${folder}/${filename}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(objectPath, bytes, { contentType: file.type, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("product-images").getPublicUrl(objectPath);
    return data.publicUrl;
  }

  const uploadRoot = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadRoot, { recursive: true });
  await fs.writeFile(path.join(/*turbopackIgnore: true*/ uploadRoot, filename), bytes);
  return `/uploads/${filename}`;
}

async function removeStoredImage(url: string) {
  if (url.startsWith("/uploads/")) {
    const filename = path.basename(url);
    await fs.rm(path.join(uploadsDir(), filename), { force: true });
    return;
  }
  const marker = "/product-images/";
  const index = url.indexOf(marker);
  if (index === -1 || !isSupabaseConfigured()) return;
  const supabase = await createSupabaseServer();
  await supabase.storage.from("product-images").remove([url.slice(index + marker.length)]);
}

function uniqueSlug(base: string, products: Product[], currentId?: string) {
  let slug = base;
  let n = 2;
  while (products.some((product) => product.slug === slug && product.id !== currentId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function readExistingImages(raw: string): ProductImage[] {
  try {
    const parsed = JSON.parse(raw) as ProductImage[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((image) => image && typeof image.url === "string")
      .map((image, index) => ({
        id: image.id || randomUUID(),
        url: image.url,
        alt: clip(image.alt || "", 180),
        sort: index,
        fit: image.fit === "cover" ? "cover" : "contain",
      }));
  } catch {
    return [];
  }
}

export async function saveProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "") || randomUUID();
  const name = clip(String(formData.get("name") ?? ""), 120);
  if (name.length < 2) return { error: "Le nom du produit est trop court." };

  const price = Number(String(formData.get("price") ?? "").replace(",", "."));
  const compareRaw = String(formData.get("compareAtPrice") ?? "").trim();
  const compareAtPrice = compareRaw ? Number(compareRaw.replace(",", ".")) : null;
  const stock = Number(formData.get("stock") ?? 0);
  const inquire = formData.get("inquire") === "on";
  const published = formData.get("published") === "on";
  if (!Number.isFinite(price) || price < 0) return { error: "Le prix n'est pas valide." };
  if (published && !inquire && price <= 0) {
    return { error: "Un produit publié a besoin d'un prix, ou cochez « sur devis »." };
  }
  if (!Number.isInteger(stock) || stock < 0 || stock > 9999) {
    return { error: "Le stock doit être un nombre entier." };
  }

  const flavors = String(formData.get("flavors") ?? "")
    .split(",")
    .map((flavor) => clip(flavor, 60))
    .filter(Boolean)
    .slice(0, 8);

  const now = new Date().toISOString();
  let images = readExistingImages(String(formData.get("existingImages") ?? "[]"));
  const files = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (images.length + files.length > 8) {
    return { error: "Huit photos maximum par produit." };
  }
  try {
    for (const file of files) {
      const url = await storeUpload(file, id);
      if (!url) continue;
      images.push({
        id: randomUUID(),
        url,
        alt: name,
        sort: images.length,
        fit: "cover" satisfies ImageFit,
      });
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Envoi des photos impossible." };
  }
  images = images.map((image, index) => ({ ...image, sort: index }));

  const previous = isSupabaseConfigured() ? [] : await readProducts();
  const slug = uniqueSlug(
    slugify(String(formData.get("slug") ?? "") || name),
    previous,
    id,
  );

  const product: Product = {
    id,
    slug,
    name,
    description: clip(String(formData.get("description") ?? ""), 600),
    details: clip(String(formData.get("details") ?? ""), 2000),
    price,
    compareAtPrice:
      compareAtPrice != null && Number.isFinite(compareAtPrice) ? compareAtPrice : null,
    category: slugify(String(formData.get("category") ?? "coupes")),
    stock,
    unit: clip(String(formData.get("unit") ?? "pièce"), 30) || "pièce",
    featured: formData.get("featured") === "on",
    published,
    badge: clip(String(formData.get("badge") ?? ""), 30) || null,
    inquire,
    flavors,
    seoTitle: clip(String(formData.get("seoTitle") ?? ""), 160),
    seoDescription: clip(String(formData.get("seoDescription") ?? ""), 240),
    images,
    createdAt: now,
    updatedAt: now,
  };

  if (!isSupabaseConfigured()) {
    const products = await readProducts();
    const current = products.find((item) => item.id === id);
    if (current) {
      product.createdAt = current.createdAt;
      const removed = current.images.filter(
        (image) => !images.some((next) => next.url === image.url),
      );
      await Promise.all(removed.map((image) => removeStoredImage(image.url)));
    }
    product.slug = uniqueSlug(product.slug, products, id);
    const next = current
      ? products.map((item) => (item.id === id ? product : item))
      : [product, ...products];
    await writeProducts(next);
    touchCatalog();
    redirect("/admin/produits");
  }

  const supabase = await createSupabaseServer();
  const { data: existing } = await supabase
    .from("products")
    .select("id, created_at, slug")
    .eq("id", id)
    .maybeSingle();

  const { data: slugOwner } = await supabase
    .from("products")
    .select("id")
    .eq("slug", product.slug)
    .maybeSingle();
  if (slugOwner && slugOwner.id !== id) product.slug = `${product.slug}-${id.slice(0, 4)}`;

  const row = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    details: product.details,
    price: product.price,
    compare_at_price: product.compareAtPrice,
    category: product.category,
    stock: product.stock,
    unit: product.unit,
    featured: product.featured,
    published: product.published,
    badge: product.badge,
    inquire: product.inquire,
    flavors: product.flavors,
    seo_title: product.seoTitle,
    seo_description: product.seoDescription,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
  const { error } = await supabase.from("products").upsert(row);
  if (error) return { error: error.message };

  const { data: previousImages } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", id);
  const kept = new Set(images.map((image) => image.url));
  for (const image of previousImages ?? []) {
    if (!kept.has(image.url)) await removeStoredImage(image.url);
  }
  await supabase.from("product_images").delete().eq("product_id", id);
  if (images.length) {
    const { error: imageError } = await supabase.from("product_images").insert(
      images.map((image) => ({
        id: image.id,
        product_id: id,
        url: image.url,
        alt: image.alt,
        sort: image.sort,
        fit: image.fit,
      })),
    );
    if (imageError) return { error: imageError.message };
  }
  touchCatalog();
  redirect("/admin/produits");
}

export async function deleteProduct(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  if (!isSupabaseConfigured()) {
    const products = await readProducts();
    const current = products.find((product) => product.id === id);
    if (current) await Promise.all(current.images.map((image) => removeStoredImage(image.url)));
    await writeProducts(products.filter((product) => product.id !== id));
  } else {
    const supabase = await createSupabaseServer();
    const { data: images } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", id);
    for (const image of images ?? []) await removeStoredImage(image.url);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
  touchCatalog();
  redirect("/admin/produits");
}

const IMAGE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function publishSeedImage(url: string, folder: string) {
  if (!url.startsWith("/media/") && !url.startsWith("/uploads/")) return url;
  const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  let bytes: Buffer;
  try {
    bytes = await fs.readFile(/*turbopackIgnore: true*/ filePath);
  } catch {
    return url;
  }
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const contentType = types[ext];
  if (!contentType) return url;
  const supabase = await createSupabaseServer();
  const objectPath = `${folder}/${randomUUID()}.${ext === "jpeg" ? "jpg" : ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(objectPath, bytes, { contentType, upsert: false });
  if (error) return url;
  return supabase.storage.from("product-images").getPublicUrl(objectPath).data.publicUrl;
}

export async function importCatalog(): Promise<void> {
  await assertAdmin();
  if (!isSupabaseConfigured()) return;
  const supabase = await createSupabaseServer();
  const products = await readProducts();
  if (!products.length) return;

  const { data: existing, error: existingError } = await supabase.from("products").select("id, slug");
  if (existingError) throw new Error(existingError.message);
  const bySlug = new Map((existing ?? []).map((row) => [row.slug as string, row.id as string]));

  const missing = products.filter((product) => !bySlug.has(product.slug));
  if (missing.length) {
    const rows = missing.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      details: product.details,
      price: product.price,
      compare_at_price: product.compareAtPrice,
      category: product.category,
      stock: product.stock,
      unit: product.unit,
      featured: product.featured,
      published: product.published,
      badge: product.badge,
      inquire: product.inquire,
      flavors: product.flavors,
      seo_title: product.seoTitle,
      seo_description: product.seoDescription,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    }));
    const { error } = await supabase.from("products").insert(rows);
    if (error) throw new Error(error.message);
    for (const product of missing) bySlug.set(product.slug, product.id);
  }

  const { data: imageRows, error: imageReadError } = await supabase
    .from("product_images")
    .select("product_id");
  if (imageReadError) throw new Error(imageReadError.message);
  const withPhotos = new Set((imageRows ?? []).map((row) => row.product_id as string));

  const images = [];
  for (const product of products) {
    const productId = bySlug.get(product.slug);
    if (!productId || withPhotos.has(productId) || product.images.length === 0) continue;
    for (const [index, image] of product.images.entries()) {
      images.push({
        id: IMAGE_UUID.test(image.id) ? image.id : randomUUID(),
        product_id: productId,
        url: await publishSeedImage(image.url, productId),
        alt: image.alt,
        sort: image.sort ?? index,
        fit: image.fit,
      });
    }
  }
  if (images.length) {
    const { error: imageError } = await supabase.from("product_images").insert(images);
    if (imageError) throw new Error(imageError.message);
  }
  touchCatalog();
  redirect("/admin/produits");
}

type CartPayload = { productId: string; qty: number; flavor?: string | null };

export async function placeOrder(formData: FormData): Promise<ActionState & { number?: string }> {
  let payload: CartPayload[] = [];
  try {
    payload = JSON.parse(String(formData.get("items") ?? "[]")) as CartPayload[];
  } catch {
    return { error: "Le panier est illisible. Rechargez la page." };
  }
  if (!Array.isArray(payload) || payload.length === 0) {
    return { error: "Votre panier est vide." };
  }

  const customerName = clip(String(formData.get("name") ?? ""), 80);
  const phone = clip(String(formData.get("phone") ?? ""), 30);
  const email = clip(String(formData.get("email") ?? ""), 120);
  const city = clip(String(formData.get("city") ?? "Fès"), 60) || "Fès";
  const address = clip(String(formData.get("address") ?? ""), 240);
  const notes = clip(String(formData.get("notes") ?? ""), 800);
  const fulfillment = String(formData.get("fulfillment") ?? "retrait") as Fulfillment;
  if (customerName.length < 2) return { error: "Indiquez votre nom." };
  if (!isPhone(phone)) return { error: "Indiquez un numéro de téléphone valide." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "L'e-mail n'est pas valide." };
  }
  if (fulfillment !== "livraison" && fulfillment !== "retrait") {
    return { error: "Choisissez un retrait ou une livraison." };
  }
  if (fulfillment === "livraison" && address.length < 6) {
    return { error: "Indiquez l'adresse de livraison à Fès." };
  }

  const products = isSupabaseConfigured()
    ? await (async () => {
        const supabase = await createSupabaseServer();
        const { data, error } = await supabase.from("products").select("*, product_images(*)");
        if (error) throw new Error(error.message);
        return (data ?? []).map((row) => mapProduct(row));
      })()
    : await readProducts();

  const items: OrderItem[] = [];
  for (const line of payload.slice(0, 20)) {
    const product = products.find((item) => item.id === line.productId && item.published);
    if (!product) return { error: "Un produit du panier n'est plus disponible." };
    const qty = Number(line.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 12) {
      return { error: "La quantité doit être comprise entre 1 et 12." };
    }
    if (product.stock < qty) return { error: `${product.name} n'a plus assez de stock.` };
    const flavor = line.flavor ? clip(line.flavor, 60) : null;
    if (product.flavors.length && (!flavor || !product.flavors.includes(flavor))) {
      return { error: `Choisissez un parfum pour ${product.name}.` };
    }
    items.push({
      id: randomUUID(),
      productId: product.id,
      name: product.name,
      flavor,
      unitPrice: product.inquire ? 0 : product.price,
      quantity: qty,
      imageUrl: product.images[0]?.url ?? "",
      inquire: product.inquire,
    });
  }

  const totals = quote(
    items.map((item) => ({ price: item.unitPrice, qty: item.quantity, inquire: item.inquire })),
    fulfillment,
  );
  const order: Order = {
    id: randomUUID(),
    number: `TF-${Math.floor(100000 + Math.random() * 900000)}`,
    customerName,
    phone,
    email,
    city,
    address,
    notes,
    fulfillment,
    status: "nouvelle",
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    items,
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    const orders = await readOrders();
    await writeOrders([order, ...orders]);
    const nextProducts = products.map((product) => {
      const sold = items
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      return sold ? { ...product, stock: Math.max(0, product.stock - sold) } : product;
    });
    await writeProducts(nextProducts);
  } else {
    const supabase = await createSupabaseServer();
    const { error } = await supabase.from("orders").insert({
      id: order.id,
      number: order.number,
      customer_name: order.customerName,
      phone: order.phone,
      email: order.email,
      city: order.city,
      address: order.address,
      notes: order.notes,
      fulfillment: order.fulfillment,
      status: order.status,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      total: order.total,
      created_at: order.createdAt,
    });
    if (error) return { error: error.message };
    const { error: itemError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        id: item.id,
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        flavor: item.flavor,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        image_url: item.imageUrl,
        inquire: item.inquire,
      })),
    );
    if (itemError) return { error: itemError.message };
    for (const item of items) {
      if (!item.productId) continue;
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        target_id: item.productId,
        amount: item.quantity,
      });
      if (stockError) return { error: stockError.message };
    }
  }

  touchCatalog();
  return { ok: true, number: order.number };
}

export async function updateOrderStatus(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const allowed: OrderStatus[] = ["nouvelle", "confirmee", "preparation", "livree", "annulee"];
  if (!allowed.includes(status)) return;
  if (!isSupabaseConfigured()) {
    const orders = await readOrders();
    await writeOrders(orders.map((order) => (order.id === id ? { ...order, status } : order)));
    return;
  }
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function sendMessage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = clip(String(formData.get("name") ?? ""), 80);
  const phone = clip(String(formData.get("phone") ?? ""), 30);
  const email = clip(String(formData.get("email") ?? ""), 120);
  const body = clip(String(formData.get("body") ?? ""), 1200);
  if (name.length < 2) return { error: "Indiquez votre nom." };
  if (!isPhone(phone)) return { error: "Indiquez un numéro de téléphone valide." };
  if (body.length < 8) return { error: "Écrivez un message un peu plus précis." };
  const message: ShopMessage = {
    id: randomUUID(),
    name,
    phone,
    email,
    body,
    createdAt: new Date().toISOString(),
  };
  if (!isSupabaseConfigured()) {
    const messages = await readMessages();
    await writeMessages([message, ...messages]);
    return { ok: true };
  }
  const supabase = await createSupabaseServer();
  const { error } = await supabase.from("messages").insert({
    id: message.id,
    name: message.name,
    phone: message.phone,
    email: message.email,
    body: message.body,
    created_at: message.createdAt,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function listOrdersAdmin() {
  await assertAdmin();
  if (!isSupabaseConfigured()) return readOrders();
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    number: row.number as string,
    customerName: row.customer_name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? "",
    city: (row.city as string) ?? "",
    address: (row.address as string) ?? "",
    notes: (row.notes as string) ?? "",
    fulfillment: row.fulfillment as Fulfillment,
    status: row.status as OrderStatus,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    createdAt: row.created_at as string,
    items: ((row.order_items as Array<Record<string, unknown>>) ?? []).map((item) => ({
      id: String(item.id),
      productId: (item.product_id as string | null) ?? null,
      name: String(item.product_name),
      flavor: (item.flavor as string | null) ?? null,
      unitPrice: Number(item.unit_price),
      quantity: Number(item.quantity),
      imageUrl: String(item.image_url ?? ""),
      inquire: Boolean(item.inquire),
    })),
  })) satisfies Order[];
}

export async function listMessagesAdmin() {
  await assertAdmin();
  if (!isSupabaseConfigured()) return readMessages();
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? "",
    body: row.body as string,
    createdAt: row.created_at as string,
  })) satisfies ShopMessage[];
}
