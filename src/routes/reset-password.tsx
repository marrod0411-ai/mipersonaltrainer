import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FlameButton, Label, Screen } from "@/components/ui-kit";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — Mi Personal Trainer" },
      { name: "description", content: "Crea una nueva contraseña para tu cuenta de Mi Personal Trainer." },
      { property: "og:title", content: "Nueva contraseña — Mi Personal Trainer" },
      { property: "og:description", content: "Recupera el acceso a tu plan de entrenamiento." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMsg("No se pudo cambiar. Abre de nuevo el enlace de tu correo.");
    else navigate({ to: "/", replace: true });
  };

  return (
    <Screen>
      <div className="px-6 pt-20 rise">
        <div className="font-display text-[11px] tracking-[0.3em] text-flame">MI PERSONAL TRAINER</div>
        <h1 className="mt-2 font-display text-[40px] leading-[0.9] tracking-tight">NUEVA CONTRASEÑA</h1>
        <form onSubmit={submit} className="mt-8 space-y-3">
          <div className="rounded-2xl bg-card px-4 py-3">
            <Label className="text-[9px]">Contraseña nueva</Label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-transparent text-[16px] text-ink outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          {msg && <p className="text-[13px] text-flame">{msg}</p>}
          <FlameButton type="submit" className={busy ? "opacity-60" : ""}>
            {busy ? "UN MOMENTO…" : "GUARDAR CONTRASEÑA"}
          </FlameButton>
        </form>
      </div>
    </Screen>
  );
}
