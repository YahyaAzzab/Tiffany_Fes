"use client";

import { useActionState } from "react";
import { sendMessage, type ActionState } from "@/lib/actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(sendMessage, {});
  if (state.ok) {
    return (
      <p className="rounded-[1.4rem] bg-white p-6 text-lg">
        Message reçu. Tiffany vous répond au numéro indiqué.
      </p>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">
        Nom
        <input className="field mt-1" name="name" required />
      </label>
      <label className="block text-sm font-medium">
        Téléphone
        <input className="field mt-1" name="phone" required inputMode="tel" />
      </label>
      <label className="block text-sm font-medium">
        E-mail <span className="text-muted">(facultatif)</span>
        <input className="field mt-1" name="email" type="email" />
      </label>
      <label className="block text-sm font-medium">
        Message
        <textarea className="field mt-1 min-h-32" name="body" required placeholder="Un coffret, un horaire, une question…" />
      </label>
      {state.error ? <p className="text-sm text-price">{state.error}</p> : null}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
