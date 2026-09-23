import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Chip,
  FlameButton,
  Label,
  Plate,
  ProgressBar,
  Screen,
  TabBar,
} from "@/components/ui-kit";
import { useLog, useProfile, bestSetFor, isSessionDoneToday } from "@/lib/store";
import {
  METHODS,
  SPORTS,
  buildPlan,
  goalLabel,
  levelLabel,
  recommendedLoad,
} from "@/lib/training";
import { Onboarding } from "@/components/onboarding";
import { nextReminderLabel, startReminderWatcher } from "@/lib/reminders";
import { readoutFor } from "@/lib/body";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coach de Hierro — tu entrenador personal" },
      {
        name: "description",
        content:
          "Plan de entrenamiento personal con métodos como FST-7, piramidales, HIIT y pliometría, cargas progresivas y recordatorios desde tu celular.",
      },
      { property: "og:title", content: "Coach de Hierro — tu entrenador personal" },
      {
        property: "og:description",
        content:
          "Elige tu objetivo y nivel, recibe cargas recomendadas y sigue cada serie desde tu celular.",
      },
    ],
  }),
  component: Index,
});

const DAY_NAMES = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

function Index() {
  const { profile, loaded, save } = useProfile();
  const { log } = useLog();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => setNow(new Date()), []);

  const plan = useMemo(
    () => (profile ? buildPlan(profile, log.week) : []),
    [profile, log.week],
  );

  const todayIndex = useMemo(() => {
    if (!plan.length || !now) return 0;
    const pending = plan.findIndex((s) => !isSessionDoneToday(log, s.title));
    return pending === -1 ? 0 : pending;
  }, [plan, log, now]);

  const session = plan[todayIndex];

  useEffect(() => {
    if (!profile || !session) return;
    return startReminderWatcher(profile, session.title);
  }, [profile, session]);

  if (!loaded) return <Screen />;
  if (!profile) return <Onboarding onDone={save} />;
  if (!session) return <Screen />;

  const doneToday = plan.filter((s) => isSessionDoneToday(log, s.title)).length;
  const mainLift = (session.exercises.find((e) => e.loadFactor) ?? session.exercises[0])!;
  const load = recommendedLoad(mainLift, {
    bodyWeight: profile.bodyWeight,
    level: profile.level,
    goal: profile.goal,
    week: log.week,
  });
  const best = bestSetFor(log.sets, mainLift.name);
  const totalSets = session.exercises.reduce((n, e) => n + e.sets, 0);
  const readout = readoutFor(profile);


  return (
    <Screen>
      <header className="flex items-center justify-between px-5 pb-4 pt-7 rise">
        <div>
          <div className="font-display text-[11px] tracking-[0.25em] text-flame">
            COACH · {nextReminderLabel(profile)}
          </div>
          <h1 className="font-display text-[26px] leading-none tracking-tight text-balance">
            HOY, {now ? DAY_NAMES[now.getDay()] : ""}
          </h1>
        </div>
        <Plate size={40}>
          <span className="font-mono text-[13px] text-ink/80">
            {profile.name.slice(0, 1).toUpperCase() || "M"}
          </span>
        </Plate>
      </header>

      <section className="px-5 rise" style={{ animationDelay: "60ms" }}>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <Label className="tracking-[0.18em]">Próxima sesión</Label>
              <div className="mt-1 font-display text-[22px] leading-none tracking-tight">
                {session.title}
              </div>
            </div>
            <div className="flex items-end gap-1.5">
              <Plate size={24} />
              <Plate size={32} active />
              <Plate size={24} />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Método</Label>
              <div className="mt-0.5 font-display text-[15px] tracking-tight">
                {METHODS[session.method].label}
              </div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Duración</Label>
              <div className="mt-0.5 font-display text-[15px] tracking-tight">
                {session.minutes} MIN
              </div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Volumen</Label>
              <div className="mt-0.5 font-display text-[15px] tracking-tight">
                {totalSets} SETS
              </div>
            </div>
          </div>
          <Link to="/sesion/$index" params={{ index: String(todayIndex) }} className="block">
            <FlameButton className="mt-4">EMPEZAR SESIÓN</FlameButton>
          </Link>
        </Card>
      </section>

      <section className="mt-6 px-5 rise" style={{ animationDelay: "120ms" }}>
        <Label className="mb-2">Semana {log.week} · métodos</Label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plan.map((s, i) => (
            <Link key={s.title} to="/sesion/$index" params={{ index: String(i) }}>
              <Chip as="div" active={i === todayIndex} className="shrink-0">
                <div className="font-mono text-[9px] text-current opacity-70">{s.day}</div>
                <div className="mt-0.5 font-display text-[13px] tracking-tight">
                  {METHODS[s.method].label.toUpperCase()}
                </div>
              </Chip>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5 rise" style={{ animationDelay: "180ms" }}>
        <Label className="mb-2">Carga de arranque</Label>
        <Card>
          <div className="font-display text-[20px] leading-none tracking-tight text-balance">
            {mainLift.name.toUpperCase()} · {mainLift.sets} SERIES
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              {Array.from({ length: Math.min(mainLift.sets, 5) }).map((_, i) => (
                <Plate
                  key={i}
                  size={28}
                  active={i === 0}
                  className="click"
                  // eslint-disable-next-line react/no-unknown-property
                />
              ))}
            </div>
            <Label className="text-[10px] tracking-[0.15em]">Carga recomendada</Label>
          </div>
          <div className="mt-3 flex items-end justify-center gap-3">
            <div className="font-display text-[64px] leading-[0.85] tracking-tight">
              {load || "—"}
            </div>
            <div className="pb-1.5 font-display text-[20px] text-mute">KG</div>
            <div className="ml-3 font-display text-[42px] leading-none tracking-tight text-flame">
              ×{mainLift.reps}
            </div>
          </div>
          <ProgressBar value={(doneToday / plan.length) * 100} />
          <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
            <span>
              {doneToday} de {plan.length} sesiones hechas
            </span>
            <span>{best ? `Mejor ${best.kg} kg` : "Sin registro aún"}</span>
          </div>
        </Card>
      </section>

      <section className="mt-6 px-5 rise" style={{ animationDelay: "240ms" }}>
        <Label className="mb-2">Deporte</Label>
        <div className="flex flex-wrap gap-2">
          {SPORTS.filter((s) => s.id !== "ninguno")
            .slice(0, 4)
            .map((s) => (
              <Chip
                key={s.id}
                as="div"
                active={profile.sport === s.id}
                className="rounded-full px-3 py-1.5 font-display text-[12px] tracking-[0.08em]"
              >
                {s.label.toUpperCase()}
              </Chip>
            ))}
        </div>
      </section>

      <section className="mt-6 px-5 rise" style={{ animationDelay: "270ms" }}>
        <Label className="mb-2">Tu cuerpo hoy</Label>
        <Card>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Grasa</Label>
              <div className="mt-0.5 font-display text-[18px] tracking-tight text-flame">
                {readout.bodyFat !== null ? `${readout.bodyFat}%` : "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">IMC</Label>
              <div className="mt-0.5 font-display text-[18px] tracking-tight">
                {readout.bmi ?? "—"}
              </div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">Calorías</Label>
              <div className="mt-0.5 font-display text-[18px] tracking-tight">
                {readout.calories ?? "—"}
              </div>
            </div>
          </div>
          {readout.notes[0] && (
            <p className="mt-3 text-[12px] leading-relaxed text-mute">{readout.notes[0]}</p>
          )}
          <Link to="/perfil" className="mt-3 block font-mono text-[10px] uppercase tracking-[0.15em] text-flame">
            Ver y editar mis medidas
          </Link>
        </Card>
      </section>

      <section className="mt-6 px-5 pb-10 rise" style={{ animationDelay: "300ms" }}>
        <Label className="mb-2">Tu objetivo</Label>

        <Card>
          <div className="flex items-end justify-between">
            <div>
              <div className="font-display text-[26px] leading-none tracking-tight">
                {goalLabel(profile.goal).toUpperCase()}
              </div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-flame">
                NIVEL {levelLabel(profile.level).toUpperCase()} · {profile.daysPerWeek} DÍAS
              </div>
            </div>
            <div className="flex items-end gap-1.5">
              <div className="w-3 rounded-full bg-clay/60" style={{ height: 16 }} />
              <div className="w-3 rounded-full bg-clay/60" style={{ height: 22 }} />
              <div className="w-3 rounded-full bg-clay/60" style={{ height: 28 }} />
              <div className="fill w-3 rounded-full" style={{ height: 40 }} />
            </div>
          </div>
        </Card>
      </section>

      <TabBar />
    </Screen>
  );
}
