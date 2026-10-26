import type { Metadata } from "next";
import { Fredoka, Outfit, Pacifico } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { store } from "@/lib/store";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const script = Pacifico({
  subsets: ["latin"],
  variable: "--font-script",
  weight: "400",
});

const description =
  "Tiffany, confiserie à Fès : swirls, Choco Rice, Maxi Dough et Choco Missu. Commandez en ligne, retirez boulevard Moulay Hicham, en face de l'école IPEP3, ou faites-vous livrer à Fès.";

export const metadata: Metadata = {
  metadataBase: new URL(store.siteUrl),
  title: {
    default: "Tiffany Fès | Confiserie & sweet escape, boulevard Moulay Hicham",
    template: "%s · Tiffany Fès",
  },
  description,
  applicationName: "Tiffany Fès",
  keywords: [
    "Tiffany Fès",
    "confiserie Fès",
    "Tiffany Swirl",
    "Choco Rice",
    "Maxi Dough",
    "Choco Missu",
    "bonbons Fès",
    "boulevard Moulay Hicham",
    "sweet escape",
  ],
  authors: [{ name: "Tiffany", url: store.instagram }],
  openGraph: {
    type: "website",
    locale: "fr_MA",
    siteName: "Tiffany Fès",
    title: "Tiffany Fès | Confiserie & sweet escape",
    description,
    images: [
      {
        url: "/media/swirl-flavors.jpg",
        width: 360,
        height: 640,
        alt: "Tiffany Swirl, trois parfums à 25 DH",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiffany Fès",
    description,
    images: ["/media/swirl-flavors.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} ${script.variable}`}>
      <body className="min-h-dvh antialiased">
        <a className="skip" href="#contenu">
          Aller au contenu
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
