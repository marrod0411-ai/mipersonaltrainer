import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export async function ensureCommunityProfile(user: User) {
  let name = "Atleta";
  try {
    const raw = window.localStorage.getItem("pt.profile.v1");
    if (raw) name = (JSON.parse(raw) as { name?: string }).name || name;
  } catch {
    /* ignore */
  }
  const country = (user.user_metadata?.["country"] as string | undefined) ?? null;
  const { data } = await supabase.from("profiles").select("id, country").eq("id", user.id).maybeSingle();
  if (!data) await supabase.from("profiles").insert({ id: user.id, display_name: name, country });
  else
    await supabase
      .from("profiles")
      .update({ display_name: name, ...(country && !data.country ? { country } : {}) })
      .eq("id", user.id);
}

export function currentQuarter(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3);
  const from = new Date(d.getFullYear(), q * 3, 1);
  const to = new Date(d.getFullYear(), q * 3 + 3, 1);
  return { label: `T${q + 1} ${d.getFullYear()}`, from, to };
}

export const POST_KINDS = [
  { id: "inicio", label: "Inicié mi plan" },
  { id: "progreso", label: "Mi progreso" },
  { id: "logro", label: "Logro" },
] as const;
