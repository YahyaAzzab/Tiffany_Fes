export const store = {
  name: "Tiffany",
  city: "Fès",
  tagline: "More than just a candy store — it's a sweet escape",
  shortTagline: "it's a sweet escape",
  address: "Boulevard Moulay Hicham, en face de l'école IPEP3",
  addressLocality: "Fès",
  country: "MA",
  instagram: "https://www.instagram.com/tiffany_maroc/",
  instagramHandle: "@tiffany_maroc",
  followersLabel: "29,6 k",
  latitude: 34.026552,
  longitude: -4.9965,
  mapsUrl: "https://maps.app.goo.gl/uT6BR2DmM5KeS5fD8",
  deliveryFee: 20,
  freeDeliveryFrom: 150,
  allergenNote:
    "Nos coupes peuvent contenir du lait, du gluten, des fruits à coque, des arachides et du soja. Le détail des allergènes se confirme en boutique.",
  phone: process.env.NEXT_PUBLIC_PHONE?.trim() ?? "",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP?.trim() ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
};

export const categories = [
  {
    slug: "swirls",
    name: "Swirls",
    description:
      "Le Tiffany Swirl, servi en pot, en Rainbow Candy, Chocolate Brownie ou Caramel Cookie Dough.",
  },
  {
    slug: "coupes",
    name: "Coupes",
    description:
      "Choco Rice, Maxi Dough et Choco Missu : les coupes signature de Tiffany à Fès.",
  },
  {
    slug: "coffrets",
    name: "Coffrets",
    description:
      "Boîtes roses composées pour un anniversaire, un cadeau ou une table à Fès.",
  },
] as const;

export function categoryName(slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}

export function whatsappHref(text?: string) {
  const digits = store.whatsapp.replace(/\D/g, "");
  if (!digits) return "";
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}
