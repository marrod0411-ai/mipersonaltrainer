import { supabase } from "@/integrations/supabase/client";

export const PROFILE_KEY = "pt.profile.v1";
export const LOG_KEY = "pt.log.v1";

let timer: ReturnType<typeof setTimeout> | null = null;

/** Debounced upload of local profile + log to the signed-in user's cloud row. */
export function pushCloud() {
  if (typeof window === "undefined") return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const parse = (k: string) => {
      const raw = window.localStorage.getItem(k);
      return raw ? JSON.parse(raw) : null;
    };
    await supabase.from("user_data").upsert({
      user_id: data.user.id,
      profile: parse(PROFILE_KEY),
      log: parse(LOG_KEY),
      updated_at: new Date().toISOString(),
    });
  }, 600);
}

/** Replace local data with the user's cloud copy (or upload local if cloud is empty). */
export async function pullCloud(userId: string) {
  const { data } = await supabase
    .from("user_data")
    .select("profile, log")
    .eq("user_id", userId)
    .maybeSingle();
  const lastUser = window.localStorage.getItem("pt.user");
  if (data?.profile) {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
    if (data.log) window.localStorage.setItem(LOG_KEY, JSON.stringify(data.log));
    else window.localStorage.removeItem(LOG_KEY);
  } else if (lastUser && lastUser !== userId) {
    window.localStorage.removeItem(PROFILE_KEY);
    window.localStorage.removeItem(LOG_KEY);
  } else {
    pushCloud();
  }
  window.localStorage.setItem("pt.user", userId);
}
