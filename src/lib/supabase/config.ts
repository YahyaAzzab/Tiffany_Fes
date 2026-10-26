export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) return false;
  if (url.includes("votre-projet") || key.startsWith("votre")) return false;
  return url.startsWith("https://") && key.length > 20;
}

export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
}

export function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();
}
