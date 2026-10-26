"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/actions";

export function LoginForm({ demo }: { demo: boolean }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">
        E-mail
        <input className="field mt-1" name="email" type="email" autoComplete="username" required />
      </label>
      <label className="block text-sm font-medium">
        Mot de passe
        <input className="field mt-1" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? <p className="text-sm text-price">{state.error}</p> : null}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Connexion…" : "Entrer"}
      </button>
      {demo ? (
        <p className="text-xs leading-5 text-muted">
          Mode démo : les identifiants sont dans le fichier .env, le temps de déposer les clés Supabase.
          Changez-les avant toute mise en ligne.
        </p>
      ) : (
        <p className="text-xs leading-5 text-muted">
          Utilisez le compte créé dans Supabase, Authentication, Users.
        </p>
      )}
    </form>
  );
}
