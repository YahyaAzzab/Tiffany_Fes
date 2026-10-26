function supabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = supabaseKey();
  if (!url || !key) return false;
  if (url.includes("votre-projet") || key.startsWith("votre")) return false;
  return url.startsWith("https://") && key.length > 20;
}

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
}

export function supabaseAnonKey() {
  return supabaseKey();
}
