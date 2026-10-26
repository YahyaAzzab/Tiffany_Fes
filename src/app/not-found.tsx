import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="font-[family-name:var(--font-script)] text-3xl text-pink-hot">sweet escape</p>
      <h1 className="mt-3 text-5xl">Cette page a fondu.</h1>
      <p className="mt-4 text-muted">Le lien ne correspond à aucune douceur du catalogue.</p>
      <Link href="/boutique" className="btn btn-primary mt-8">
        Retour à la boutique
      </Link>
    </div>
  );
}
