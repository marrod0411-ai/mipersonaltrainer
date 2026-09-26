import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment, getPaddlePriceId, initializePaddle } from "@/lib/paddle";
import { FlameButton, Screen } from "@/components/ui-kit";

type Plan = "athlete" | "trainer";
const PLANS: Record<Plan, { product: string; price: string; amount: string; title: string; perks: string[] }> = {
  athlete: {
    product: "athlete_plan",
    price: "athlete_monthly",
    amount: "US$15",
    title: "ACTIVA TU PLAN",
    perks: ["Plan personalizado según tu cuerpo, nivel y lesiones", "Coach IA durante y después de entrenar", "Progreso, medidas y gráficas", "Comunidad y retos trimestrales"],
  },
  trainer: {
    product: "trainer_plan",
    price: "trainer_monthly",
    amount: "US$5",
    title: "ACTIVA TU PANEL",
    perks: ["Registra alumnos con sus medidas", "Genera y ajusta sus rutinas", "Cargas sugeridas y calorías por sesión"],
  },
};

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;
  return (
    <div className="w-full bg-flame px-4 py-2 text-center text-[12px] text-bg">
      Modo de prueba: los pagos en la vista previa no cobran dinero real.
    </div>
  );
}

/** Blocks children until the signed-in user has an active subscription for the plan. */
export function Paywall({ plan, children }: { plan: Plan; children: ReactNode }) {
  const cfg = PLANS[plan];
  const [state, setState] = useState<"loading" | "locked" | "open">("loading");
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return false;
    setUser({ id: data.user.id, email: data.user.email ?? undefined });
    const { data: ok } = await supabase.rpc("has_active_subscription", {
      user_uuid: data.user.id,
      check_env: getPaddleEnvironment(),
      check_product: cfg.product,
    });
    setState(ok ? "open" : "locked");
    return !!ok;
  }, [cfg.product]);

  useEffect(() => void check(), [check]);
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(async () => { if (await check()) setWaiting(false); }, 3000);
    return () => clearInterval(t);
  }, [waiting, check]);

  const pay = async () => {
    if (!user) return;
    setErr(null);
    try {
      await initializePaddle();
      const priceId = await getPaddlePriceId(cfg.price);
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user.email ? { email: user.email } : undefined,
        customData: { userId: user.id },
        settings: { displayMode: "overlay", successUrl: window.location.href, allowLogout: false, variant: "one-page", locale: "es" },
      });
      setWaiting(true);
    } catch {
      setErr("No se pudo abrir el pago. Intenta de nuevo.");
    }
  };

  if (state === "loading") return <Screen />;
  if (state === "open") return <>{children}</>;
  return (
    <>
      <PaymentTestModeBanner />
      <Screen>
        <div className="px-6 pt-14">
          <div className="font-display text-[11px] tracking-[0.3em] text-flame">MI PERSONAL TRAINER</div>
          <h1 className="mt-2 font-display text-[40px] leading-[0.9]">{cfg.title}</h1>
          <div className="mt-6 rounded-[28px] bg-card p-6 ring-1 ring-line/60">
            <div className="font-display text-[48px] leading-none text-flame">{cfg.amount}<span className="text-[16px] text-mute"> / mes</span></div>
            <p className="mt-2 text-[12px] text-mute">Se cobra hoy y se renueva el mismo día cada mes. Cancela cuando quieras.</p>
            <ul className="mt-4 space-y-2 text-[14px]">
              {cfg.perks.map((p) => <li key={p}>✓ {p}</li>)}
            </ul>
          </div>
          {err && <p className="mt-3 text-[13px] text-flame">{err}</p>}
          <FlameButton onClick={pay} className="mt-6 w-full">{waiting ? "CONFIRMANDO PAGO..." : "PAGAR Y CONTINUAR"}</FlameButton>
          {waiting && <p className="mt-2 text-center text-[12px] text-mute">Cuando termines el pago, entrarás automáticamente.</p>}
          <button onClick={() => supabase.auth.signOut()} className="mt-3 w-full py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-mute">Cerrar sesión</button>
        </div>
      </Screen>
    </>
  );
}
