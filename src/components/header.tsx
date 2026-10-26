"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartView } from "@/components/cart-view";
import { useCart } from "@/components/cart-provider";
import { store } from "@/lib/store";

const links = [
  { href: "/boutique", label: "Boutique" },
  { href: "/maison", label: "La maison" },
  { href: "/livraison", label: "Livraison" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open || menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, menu]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setMenu(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color:color-mix(in_srgb,var(--cream)_86%,white)] backdrop-blur-xl">
      <div className="mx-auto flex h-[var(--header)] max-w-6xl items-center justify-between gap-3 px-4 sm:px-5">
        <Link href="/" transitionTypes={["nav-back"]} className="flex items-center gap-2.5">
          <Image
            src="/media/avatar.jpg"
            alt="Logo Tiffany"
            width={48}
            height={48}
            className="h-11 w-11 rounded-2xl object-cover"
            priority
          />
          <span>
            <span className="display block text-xl leading-none">Tiffany</span>
            <span className="text-[0.68rem] tracking-[0.16em] text-muted uppercase">Fès</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} transitionTypes={["nav-forward"]} className="transition-colors hover:text-pink-hot">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/boutique" transitionTypes={["nav-forward"]} className="btn btn-primary hidden !min-h-10 !px-4 sm:inline-flex">
            Commander
          </Link>
          <button
            className="btn btn-ghost !min-h-10 !px-3"
            onClick={() => {
              setMenu(false);
              setOpen(true);
            }}
            aria-label="Ouvrir le panier"
          >
            Panier
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-mint text-xs text-ink">
              {cart.ready ? cart.count : 0}
            </span>
          </button>
          <button
            className="btn btn-ghost !min-h-10 !px-3 md:hidden"
            aria-expanded={menu}
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => {
              setOpen(false);
              setMenu((value) => !value);
            }}
          >
            Menu
          </button>
        </div>
      </div>
    </header>
      <div
        className={`fixed inset-x-0 top-[var(--header)] z-40 h-[calc(100dvh-var(--header))] bg-cream/96 backdrop-blur-xl transition-all duration-500 md:hidden ${
          menu ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-2 px-5 py-6">
          {links.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              transitionTypes={["nav-forward"]}
              onClick={() => setMenu(false)}
              className="display border-b border-[var(--line)] py-4 text-4xl"
              style={{ transitionDelay: menu ? `${index * 40}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
          <a className="mt-4 text-sm text-mint-deep" href={store.instagram}>
            {store.instagramHandle}
          </a>
        </nav>
      </div>

      <div className={`fixed inset-0 z-50 h-dvh w-dvw ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <button
          className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
          aria-label="Fermer le panier"
          onClick={() => setOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 right-0 flex h-dvh w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-label="Panier"
        >
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-2xl">Votre panier</h2>
            <button className="btn btn-ghost !min-h-10 !px-3" onClick={() => setOpen(false)}>
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-auto px-5 py-5">
            <CartView showCheckout onNavigate={() => setOpen(false)} />
          </div>
        </aside>
      </div>
    </>
  );
}
