import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tiffany Fès",
    short_name: "Tiffany",
    description: "Confiserie Tiffany à Fès. Commandez swirls, coupes et coffrets.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7f8",
    theme_color: "#f25c8d",
    lang: "fr",
    icons: [
      { src: "/media/avatar.jpg", sizes: "150x150", type: "image/jpeg", purpose: "any" },
    ],
  };
}
