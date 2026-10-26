import type { Metadata } from "next";
import Link from "next/link";
import { store, whatsappHref } from "@/lib/store";

export const metadata: Metadata = {
  title: "Commande envoyée",
  robots: { index: false, follow: false },
};

export default async function ThanksPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const safe = /^TF-\d{6}$/.test(number) ? number : "votre commande";
  const whatsapp = whatsappHref(`Bonjour Tiffany, je viens de passer la commande ${safe}.`);

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <p className="text-xs font-semibold tracking-[0.16em] text-mint-deep uppercase">C'est noté</p>
      <h1 className="mt-3 text-5xl">La commande {safe} est chez Tiffany.</h1>
      <p className="mt-4 text-lg leading-8 text-muted">
        La boutique vous rappelle pour confirmer le retrait au {store.address}, ou la livraison à Fès.
        Le paiement se fait à la réception.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/boutique" transitionTypes={["nav-back"]} className="btn btn-primary">
          Continuer
        </Link>
        {whatsapp ? (
          <a className="btn btn-ghost" href={whatsapp}>
            Confirmer sur WhatsApp
          </a>
        ) : (
          <a className="btn btn-ghost" href={store.instagram}>
            Instagram
          </a>
        )}
      </div>
    </div>
  );
}
