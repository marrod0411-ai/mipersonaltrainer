import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, Label, Plate, Screen, TabBar } from "@/components/ui-kit";
import { useLog, useProfile } from "@/lib/store";

export const Route = createFileRoute("/progreso")({
  head: () => ({
    meta: [
      { title: "Mi progreso — Coach de Hierro" },
      {
        name: "description",
        content:
          "Mira cómo suben tus cargas semana a semana, tus récords por ejercicio y las sesiones completadas.",
      },
      { property: "og:title", content: "Mi progreso — Coach de Hierro" },
      {
        property: "og:description",
        content: "Récords por ejercicio, volumen acumulado y progresión de cargas.",
      },
    ],
  }),
  component: ProgressScreen,
});

function ProgressScreen() {
  const { profile, loaded } = useProfile();
  const { log } = useLog();

  const byExercise = useMemo(() => {
    const map = new Map<string, { best: number; sets: number; history: number[] }>();
    for (const s of log.sets) {
      const cur = map.get(s.exercise) ?? { best: 0, sets: 0, history: [] };
      cur.best = Math.max(cur.best, s.kg);
      cur.sets += 1;
      cur.history = [...cur.history.slice(-7), s.kg];
      map.set(s.exercise, cur);
    }
    return [...map.entries()].sort((a, b) => b[1].sets - a[1].sets);
  }, [log.sets]);

  if (!loaded) return <Screen />;

  const totalVolume = log.sets.reduce((n, s) => n + s.kg * s.reps, 0);

  return (
    <Screen>
      <header className="px-5 pb-4 pt-7 rise">
        <div className="font-display text-[11px] tracking-[0.25em] text-flame">
          {profile ? `${profile.name.toUpperCase()} · SEMANA ${log.week}` : "TU HISTORIAL"}
        </div>
        <h1 className="font-display text-[26px] leading-none tracking-tight">PROGRESO</h1>
      </header>

      <section className="px-5 rise" style={{ animationDelay: "60ms" }}>
        <Card>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Sesiones</Label>
              <div className="mt-0.5 font-display text-[20px]">{log.completedSessions.length}</div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Series</Label>
              <div className="mt-0.5 font-display text-[20px]">{log.sets.length}</div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Volumen</Label>
              <div className="mt-0.5 font-display text-[20px]">
                {Math.round(totalVolume / 1000)}t
              </div>
            </div>
          </div>
        </Card>
      </section>

      {byExercise.length === 0 ? (
        <section className="mt-6 px-5 rise">
          <Card>
            <div className="font-display text-[20px] leading-none tracking-tight">
              AÚN SIN REGISTROS
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-mute">
              Registra tus series en una sesión y aquí verás cómo sube tu carga.
            </p>
            <Link to="/" className="mt-3 inline-block font-mono text-[10px] tracking-[0.15em] text-flame">
              IR A MI SESIÓN DE HOY
            </Link>
          </Card>
        </section>
      ) : (
        <div className="mt-6 space-y-4 px-5 pb-10">
          {byExercise.map(([name, data]) => (
            <div key={name} className="rise">
              <Label className="mb-2">Progresión · {name}</Label>
              <Card>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-display text-[34px] leading-none tracking-tight">
                      {data.best} <span className="text-[16px] text-mute">KG</span>
                    </div>
                    <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-flame">
                      {data.sets} SERIES REGISTRADAS
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5">
                    {data.history.map((kg, i) => (
                      <div
                        key={i}
                        className={
                          i === data.history.length - 1
                            ? "fill w-3 rounded-full"
                            : "w-3 rounded-full bg-clay/60"
                        }
                        style={{ height: 12 + (kg / Math.max(data.best, 1)) * 32 }}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <section className="mt-6 flex justify-center px-5 pb-10">
        <div className="flex items-end gap-1.5">
          <Plate size={22} />
          <Plate size={30} active />
          <Plate size={22} />
        </div>
      </section>

      <TabBar />
    </Screen>
  );
}
