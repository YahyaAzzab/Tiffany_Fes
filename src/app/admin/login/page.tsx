import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="p-10 text-muted">Chargement…</p>}>
      <LoginScreen />
    </Suspense>
  );
}

async function LoginScreen() {
  const session = await getSession();
  if (session) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-md rounded-[1.8rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(242,92,141,0.8)] sm:p-8">
        <p className="font-[family-name:var(--font-script)] text-2xl text-pink-hot">sweet escape</p>
        <h1 className="mt-2 text-4xl">Espace boutique</h1>
        <p className="mt-2 text-sm text-muted">Ajoutez, modifiez ou retirez les produits Tiffany.</p>
        <div className="mt-6">
          <LoginForm demo={!isSupabaseConfigured()} />
        </div>
      </div>
    </div>
  );
}
