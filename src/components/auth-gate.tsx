import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pullCloud } from "@/lib/cloud-sync";
import { useRouterState } from "@tanstack/react-router";
import { ensureCommunityProfile } from "@/lib/community";
import { FlameButton, Label, Screen } from "@/components/ui-kit";

const REMEMBER_KEY = "pt.remember";
const EMAIL_KEY = "pt.email";

type State = "loading" | "out" | "in";

export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("loading");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      // "No recordarme": end the session when the app is reopened
      if (
        window.localStorage.getItem(REMEMBER_KEY) === "0" &&
        !window.sessionStorage.getItem("pt.active")
      ) {
        await supabase.auth.signOut();
      }
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) {
        await pullCloud(data.user.id);
        void ensureCommunityProfile(data.user);
        setUserId(data.user.id);
        setState("in");
      } else setState("out");
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUserId(null);
        setState("out");
      } else if (event === "SIGNED_IN" && session?.user) {
        const id = session.user.id;
        setUserId((prev) => {
          if (prev !== id) void ensureCommunityProfile(session.user);
          if (prev !== id)
            void pullCloud(id).then(() => {
              setUserId(id);
              setState("in");
            });
          return prev;
        });
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const path = useRouterState({ select: (r) => r.location.pathname });
  if (path === "/reset-password") return <>{children}</>;
  if (state === "loading") return <Screen />;
  if (state === "out") return <AuthScreen />;
  return <div key={userId ?? "u"}>{children}</div>;
}

const COUNTRIES = [
  "Colombia", "México", "Argentina", "Chile", "Perú", "Ecuador", "Venezuela", "Bolivia",
  "Paraguay", "Uruguay", "Costa Rica", "Panamá", "Guatemala", "Honduras", "El Salvador",
  "Nicaragua", "República Dominicana", "Puerto Rico", "Cuba", "España", "Estados Unidos",
  "Canadá", "Brasil", "Otro",
];

function AuthScreen() {
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(EMAIL_KEY);
    if (saved) setEmail(saved);
    else setMode("up");
    setRemember(window.localStorage.getItem(REMEMBER_KEY) !== "0");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setMsg(error ? traducir(error.message) : "Listo. Revisa tu correo para crear una nueva contraseña.");
      setBusy(false);
      return;
    }
    window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
    window.sessionStorage.setItem("pt.active", "1");
    if (remember) window.localStorage.setItem(EMAIL_KEY, email);
    else window.localStorage.removeItem(EMAIL_KEY);

    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { country } },
      });
      if (error) setMsg(traducir(error.message));
      else if (!data.session)
        setMsg("Te enviamos un correo. Confírmalo y luego ingresa con tu contraseña.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(traducir(error.message));
    }
    setBusy(false);
  };

  const tab = (m: "in" | "up", label: string) => (
    <button
      type="button"
      onClick={() => { setMode(m); setMsg(null); }}
      className={`flex-1 rounded-2xl py-3 font-display text-[14px] tracking-[0.1em] ${
        mode === m ? "chip-active text-bg" : "chip text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Screen>
      <div className="px-6 pt-16 rise">
        <div className="font-display text-[11px] tracking-[0.3em] text-flame">MI PERSONAL TRAINER</div>
        <h1 className="mt-2 font-display text-[40px] leading-[0.9] tracking-tight">
          {mode === "in" ? "BIENVENIDO DE NUEVO" : mode === "up" ? "CREA TU CUENTA" : "RECUPERA TU CONTRASEÑA"}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-mute">
          {mode === "in"
            ? "Ingresa con tu correo y contraseña para seguir tu plan."
            : mode === "up"
              ? "Regístrate una vez y tu plan te acompaña en cualquier dispositivo."
              : "Escribe tu correo y te enviaremos un enlace para crear una nueva."}
        </p>

        {mode !== "forgot" && (
          <div className="mt-6 flex gap-2">
            {tab("in", "INICIAR SESIÓN")}
            {tab("up", "REGISTRARME")}
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-3">
          <Field label="Correo">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-[16px] text-ink outline-none"
              placeholder="tu@correo.com"
            />
          </Field>
          {mode !== "forgot" && (
            <Field label="Contraseña">
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-[16px] text-ink outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </Field>
          )}
          {mode === "up" && (
            <Field label="País">
              <select
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent text-[16px] text-ink outline-none"
              >
                <option value="" className="bg-card">Elige tu país</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-card">{c}</option>
                ))}
              </select>
            </Field>
          )}

          {mode === "in" && (
            <button
              type="button"
              onClick={() => { setMode("forgot"); setMsg(null); }}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-flame"
            >
              Olvidé mi contraseña
            </button>
          )}

          {mode !== "forgot" && (
            <label className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-5 w-5 accent-[var(--color-flame)]"
              />
              <span className="text-[13px] text-ink">Recordar mi correo y mantener la sesión</span>
            </label>
          )}

          {msg && <p className="text-[13px] leading-relaxed text-flame">{msg}</p>}

          <FlameButton type="submit" className={busy ? "opacity-60" : ""}>
            {busy ? "UN MOMENTO…" : mode === "in" ? "INGRESAR" : mode === "up" ? "CREAR MI CUENTA" : "ENVIAR ENLACE"}
          </FlameButton>
        </form>

        {mode === "forgot" && (
          <button
            type="button"
            onClick={() => { setMode("in"); setMsg(null); }}
            className="mt-5 w-full rounded-2xl chip py-3 font-display text-[14px] tracking-[0.1em] text-ink"
          >
            VOLVER A INICIAR SESIÓN
          </button>
        )}
      </div>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3">
      <Label className="text-[9px]">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function traducir(m: string) {
  if (/invalid login/i.test(m)) return "Correo o contraseña incorrectos.";
  if (/not confirmed/i.test(m)) return "Confirma tu correo antes de ingresar.";
  if (/already registered/i.test(m)) return "Ese correo ya tiene cuenta. Ingresa con tu contraseña.";
  if (/password/i.test(m)) return "La contraseña debe tener al menos 6 caracteres.";
  return m;
}
