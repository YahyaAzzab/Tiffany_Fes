export type ImageFit = "cover" | "contain";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  sort: number;
  fit: ImageFit;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  details: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  stock: number;
  unit: string;
  featured: boolean;
  published: boolean;
  badge: string | null;
  inquire: boolean;
  flavors: string[];
  seoTitle: string;
  seoDescription: string;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type Fulfillment = "livraison" | "retrait";

export type OrderStatus =
  | "nouvelle"
  | "confirmee"
  | "preparation"
  | "livree"
  | "annulee";

export type OrderItem = {
  id: string;
  productId: string | null;
  name: string;
  flavor: string | null;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  inquire: boolean;
};

export type Order = {
  id: string;
  number: string;
  customerName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  notes: string;
  fulfillment: Fulfillment;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
};

export type ShopMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  body: string;
  createdAt: string;
};

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  flavor: string | null;
  price: number;
  image: string;
  qty: number;
  inquire: boolean;
  unit: string;
};
