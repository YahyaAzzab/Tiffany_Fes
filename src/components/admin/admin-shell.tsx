import { logout } from "@/lib/actions";
import Link from "next/link";

const links = [
  { href: "/admin", label: "Tableau" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/produits/nouveau", label: "Nouveau" },
  { href: "/admin/commandes", label: "Commandes" },
];

export function AdminShell({
  email,
  mode,
  children,
}: {
  email: string;
  mode: "demo" | "supabase";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-cream md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-[var(--line)] bg-white md:min-h-dvh md:border-r md:border-b-0">
        <div className="px-5 py-5">
          <Link href="/" className="display text-2xl">
            Tiffany
          </Link>
          <p className="mt-1 text-xs text-muted">{mode === "demo" ? "Mode démo local" : "Supabase"}</p>
          <p className="mt-1 truncate text-xs">{email}</p>
        </div>
        <nav className="flex gap-2 overflow-auto px-3 pb-4 md:flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-sm hover:bg-blush md:rounded-xl">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="rounded-full px-3 py-2 text-sm hover:bg-blush md:rounded-xl">
            Voir le site
          </Link>
        </nav>
        <form action={logout} className="px-3 pb-5">
          <button className="btn btn-ghost w-full !min-h-10">Déconnexion</button>
        </form>
      </aside>
      <div className="px-4 py-6 sm:px-8">{children}</div>
    </div>
  );
}
