import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServer } from "@/lib/supabase/server";

export const ADMIN_COOKIE = "tiffany_admin";

function secret() {
  return process.env.DEMO_SESSION_SECRET?.trim() ?? "";
}

export function verifyDemoToken(token?: string | null) {
  const key = secret();
  if (!token || !key) return false;
  const [version, exp, sig] = token.split(".");
  if (version !== "v1" || !exp || !sig) return false;
  if (Number(exp) < Date.now() / 1000) return false;
  const expected = createHmac("sha256", key).update(exp).digest("hex");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function setDemoSession() {
  const key = secret();
  if (!key) throw new Error("DEMO_SESSION_SECRET manquant dans .env");
  const exp = Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 14);
  const sig = createHmac("sha256", key).update(String(exp)).digest("hex");
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, `v1.${exp}.${sig}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearDemoSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function getSession() {
  // Date.now() in the demo token must run at request time, not while prerendering.
  await connection();
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServer();
    const { data } = await supabase.auth.getUser();
    if (!data.user?.email) return null;
    return { email: data.user.email, mode: "supabase" as const };
  }
  const jar = await cookies();
  if (!verifyDemoToken(jar.get(ADMIN_COOKIE)?.value)) return null;
  return {
    email: process.env.DEMO_ADMIN_EMAIL || "admin",
    mode: "demo" as const,
  };
}
