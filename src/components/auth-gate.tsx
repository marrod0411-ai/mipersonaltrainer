import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pullCloud } from "@/lib/cloud-sync";
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

  if (state === "loading") return <Screen />;
  if (state === "out") return <AuthScreen />;
  return <div key={userId ?? "u"}>{children}</div>;
}

function AuthScreen() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
    window.sessionStorage.setItem("pt.active", "1");
    if (remember) window.localStorage.setItem(EMAIL_KEY, email);
    else window.localStorage.removeItem(EMAIL_KEY);

    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
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

  return (
    <Screen>
      <div className="px-6 pt-20 rise">
        <div className="font-display text-[11px] tracking-[0.3em] text-flame">MI PERSONAL TRAINER</div>
        <h1 className="mt-2 font-display text-[40px] leading-[0.9] tracking-tight">
          {mode === "in" ? "BIENVENIDO DE NUEVO" : "CREA TU CUENTA"}
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-mute">
          {mode === "in"
            ? "Ingresa con tu correo y contraseña para seguir tu plan."
            : "Regístrate una vez y tu plan te acompaña en cualquier dispositivo."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
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

          <label className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 accent-[var(--color-flame)]"
            />
            <span className="text-[13px] text-ink">Recordar mi correo y mantener la sesión</span>
          </label>

          {msg && <p className="text-[13px] leading-relaxed text-flame">{msg}</p>}

          <FlameButton type="submit" className={busy ? "opacity-60" : ""}>
            {busy ? "UN MOMENTO…" : mode === "in" ? "INGRESAR" : "REGISTRARME"}
          </FlameButton>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setMsg(null);
          }}
          className="mt-5 w-full text-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute"
        >
          {mode === "in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
        </button>
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
