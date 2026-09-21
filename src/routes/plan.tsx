import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, Chip, Label, Plate, Screen, TabBar } from "@/components/ui-kit";
import { useLog, useProfile } from "@/lib/store";
import { METHODS, buildPlan, recommendedLoad } from "@/lib/training";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Mi plan semanal — Coach de Hierro" },
      {
        name: "description",
        content:
          "Tu semana completa: FST-7, piramidales, GVT, descargas, cardio HIIT, pliometría y trabajo específico para tu deporte.",
      },
      { property: "og:title", content: "Mi plan semanal — Coach de Hierro" },
      {
        property: "og:description",
        content: "Cada día con su método, ejercicios, series y cargas recomendadas.",
      },
    ],
  }),
  component: PlanScreen,
});

function PlanScreen() {
  const { profile, loaded } = useProfile();
  const { log, setWeek } = useLog();
  const plan = useMemo(() => (profile ? buildPlan(profile, log.week) : []), [profile, log.week]);

  if (!loaded) return <Screen />;
  if (!profile)
    return (
      <Screen>
        <div className="px-5 pt-16 text-center font-display text-[22px]">
          CREA TU PLAN PRIMERO
          <Link to="/" className="mt-4 block font-mono text-[11px] text-flame">
            IR AL INICIO
          </Link>
        </div>
      </Screen>
    );

  const isDeload = log.week % 4 === 0;

  return (
    <Screen>
      <header className="px-5 pb-4 pt-7 rise">
        <div className="font-display text-[11px] tracking-[0.25em] text-flame">
          {isDeload ? "SEMANA DE DESCARGA" : "BLOQUE DE CARGA"}
        </div>
        <h1 className="font-display text-[26px] leading-none tracking-tight">
          SEMANA {log.week}
        </h1>
        <div className="mt-3 flex gap-2">
          <Chip
            onClick={() => setWeek(log.week - 1)}
            className="flex-1 text-center font-display text-[14px]"
          >
            SEMANA ANTERIOR
          </Chip>
          <Chip
            onClick={() => setWeek(log.week + 1)}
            className="flex-1 text-center font-display text-[14px]"
          >
            SIGUIENTE SEMANA
          </Chip>
        </div>
      </header>

      <div className="space-y-4 px-5 pb-10">
        {plan.map((s, i) => (
          <Card key={s.title} className="rise">
            <div className="flex items-start justify-between">
              <div>
                <Label className="tracking-[0.18em]">
                  {s.day} · {METHODS[s.method].label}
                </Label>
                <div className="mt-1 font-display text-[20px] leading-none tracking-tight">
                  {s.title}
                </div>
                <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
                  {s.focus} · {s.minutes} min
                </div>
              </div>
              <div className="flex items-end gap-1.5">
                <Plate size={22} />
                <Plate size={30} active />
              </div>
            </div>

            <p className="mt-3 text-[12px] leading-relaxed text-mute">
              {METHODS[s.method].detail}
            </p>

            <div className="mt-4 space-y-2">
              {s.exercises.map((e) => {
                const kg = recommendedLoad(e, {
                  bodyWeight: profile.bodyWeight,
                  level: profile.level,
                  goal: profile.goal,
                  week: log.week,
                });
                return (
                  <div
                    key={e.name}
                    className="flex items-center justify-between rounded-2xl bg-bg/60 px-3 py-2"
                  >
                    <div>
                      <div className="font-display text-[14px] tracking-tight">
                        {e.name.toUpperCase()}
                      </div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.13em] text-mute">
                        {e.sets} × {e.reps} · desc {e.restSec}s
                      </div>
                    </div>
                    <div className="font-display text-[18px] text-flame">
                      {kg ? `${kg} kg` : "—"}
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              to="/sesion/$index"
              params={{ index: String(i) }}
              className="mt-4 block rounded-2xl chip-active py-2.5 text-center font-display text-[14px] tracking-[0.1em] text-white"
            >
              ENTRENAR ESTE DÍA
            </Link>
          </Card>
        ))}
      </div>

      <TabBar />
    </Screen>
  );
}
