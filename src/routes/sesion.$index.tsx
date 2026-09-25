import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
import { ExerciseGuideSheet } from "@/components/exercise-guide-sheet";
import { ExerciseVideo } from "@/components/exercise-video";
import { RestTimer } from "@/components/rest-timer";
import { setCoachContext } from "@/components/coach-chat";
import { useLog, useProfile } from "@/lib/store";
import { METHODS, alternativesFor, buildPlan, recommendedLoad, roundLoad } from "@/lib/training";
import type { Exercise } from "@/lib/training";

export const Route = createFileRoute("/sesion/$index")({
  head: () => ({
    meta: [
      { title: "Sesión de entrenamiento — Mi Personal Trainer" },
      {
        name: "description",
        content:
          "Sigue tu sesión serie por serie con cargas recomendadas, descansos y registro de repeticiones.",
      },
      { property: "og:title", content: "Sesión de entrenamiento — Mi Personal Trainer" },
      {
        property: "og:description",
        content: "Registra cada serie y deja que el coach ajuste tu carga progresiva.",
      },
    ],
  }),
  component: SessionScreen,
});

function SessionScreen() {
  const { index } = Route.useParams();
  const navigate = useNavigate();
  const { profile, loaded } = useProfile();
  const { log, addSet, completeSession } = useLog();
  const [exIndex, setExIndex] = useState(0);
  const [doneSets, setDoneSets] = useState<Record<string, number>>({});
  const [repsInput, setRepsInput] = useState(8);
  const [loadOverride, setLoadOverride] = useState<Record<string, number>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [restKey, setRestKey] = useState(0);
  const [resting, setResting] = useState(false);
  const [swaps, setSwaps] = useState<Record<number, Exercise>>({});
  const [status, setStatus] = useState<Record<string, "ok" | "ocupada" | "fuera">>({});

  const plan = useMemo(() => (profile ? buildPlan(profile, log.week) : []), [profile, log.week]);
  const rawSession = plan[Number(index)];
  const session = rawSession
    ? { ...rawSession, exercises: rawSession.exercises.map((e, i) => swaps[i] ?? e) }
    : undefined;

  if (!loaded) return <Screen />;
  if (!profile || !session)
    return (
      <Screen>
        <div className="px-5 pt-16 text-center">
          <div className="font-display text-[24px]">SIN SESIÓN</div>
          <Link to="/" className="mt-4 inline-block font-mono text-[11px] text-flame">
            VOLVER AL INICIO
          </Link>
        </div>
      </Screen>
    );

  const exercise = session.exercises[exIndex]!;
  const base = recommendedLoad(exercise, {
    bodyWeight: profile.bodyWeight,
    level: profile.level,
    goal: profile.goal,
    week: log.week,
  });
  const load = loadOverride[exercise.name] ?? base;
  const done = doneSets[exercise.name] ?? 0;
  const totalSets = session.exercises.reduce((n, e) => n + e.sets, 0);
  const totalDone = Object.values(doneSets).reduce((a, b) => a + b, 0);

  const coachContext = [
          `Sesión: ${session.title} (${METHODS[session.method].label})`,
          `Ejercicio actual: ${exercise.name} — ${exercise.sets} series x ${exercise.reps} reps, descanso ${exercise.restSec}s, carga sugerida ${load || "peso corporal"} kg, serie ${Math.min(done + 1, exercise.sets)}/${exercise.sets}`,
          `Estado de la máquina: ${status[exercise.name] ?? "ok"}`,
          `Ejercicios de hoy: ${session.exercises.map((e) => e.name).join(", ")}`,
          `Perfil: nivel ${profile.level}, objetivo ${profile.goal}, gimnasio ${profile.gym ?? "completo"}, peso ${profile.bodyWeight} kg, semana ${log.week}`,
          `Lesiones: ${JSON.stringify(profile.injuries ?? "ninguna")}`,
        ].join("\n");
  if (typeof window !== "undefined") setCoachContext(coachContext, exercise.name);

  const logSet = () => {
    addSet({
      session: session.title,
      exercise: exercise.name,
      setIndex: done + 1,
      kg: load,
      reps: repsInput,
    });
    setDoneSets((p) => ({ ...p, [exercise.name]: Math.min(exercise.sets, done + 1) }));
    setRestKey((k) => k + 1);
    setResting(true);
  };

  const finish = () => {
    completeSession(session.title);
    navigate({ to: "/progreso" });
  };

  return (
    <Screen>
      <header className="flex items-center justify-between px-5 pb-4 pt-7 rise">
        <div>
          <div className="font-display text-[11px] tracking-[0.25em] text-flame">
            {METHODS[session.method].label.toUpperCase()} · {session.minutes} MIN
          </div>
          <h1 className="font-display text-[26px] leading-none tracking-tight text-balance">
            {session.title}
          </h1>
        </div>
        <Link to="/" className="font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
          Salir
        </Link>
      </header>

      <section className="px-5 rise" style={{ animationDelay: "60ms" }}>
        <Card>
          <Label className="tracking-[0.18em]">Método de hoy</Label>
          <div className="mt-1 font-display text-[20px] leading-none tracking-tight">
            {METHODS[session.method].label.toUpperCase()}
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-mute">
            {METHODS[session.method].detail}
          </p>
        </Card>
      </section>

      <section className="mt-6 px-5 rise" style={{ animationDelay: "120ms" }}>
        <Label className="mb-2">Ejercicios</Label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {session.exercises.map((e, i) => (
            <Chip
              key={e.name}
              active={i === exIndex}
              onClick={() => {
                setExIndex(i);
                setRepsInput(parseInt(e.reps, 10) || 10);
              }}
              className="shrink-0"
            >
              <div className="font-mono text-[9px] opacity-70">
                {(doneSets[e.name] ?? 0)}/{e.sets}
              </div>
              <div className="mt-0.5 font-display text-[13px] tracking-tight">
                {e.name.toUpperCase()}
              </div>
            </Chip>
          ))}
        </div>
      </section>

      <section className="mt-6 px-5 rise" style={{ animationDelay: "180ms" }}>
        <Label className="mb-2">Sesión activa</Label>
        <Card>
          <div className="font-display text-[20px] leading-none tracking-tight text-balance">
            {exercise.name.toUpperCase()} · SERIE {Math.min(done + 1, exercise.sets)}/
            {exercise.sets}
          </div>
          <div className="mt-3">
            <ExerciseVideo key={exercise.name} name={exercise.name} />
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-flame"
          >
            ▸ Técnica completa, errores comunes y cargas
          </button>
          <MachineStatus
            value={status[exercise.name] ?? "ok"}
            onChange={(v) => setStatus((p) => ({ ...p, [exercise.name]: v }))}
            alternatives={alternativesFor(
              exercise,
              profile.gym ?? "completo",
              session.exercises.map((e) => e.name),
              profile.injuries,
            )}
            onSwap={(alt) => {
              setSwaps((p) => ({ ...p, [exIndex]: alt }));
              setRepsInput(parseInt(alt.reps, 10) || 10);
            }}
            onSkipAhead={() => {
              const next = session.exercises.findIndex(
                (e, i) => i !== exIndex && (doneSets[e.name] ?? 0) < e.sets,
              );
              if (next >= 0) {
                setExIndex(next);
                setRepsInput(parseInt(session.exercises[next]!.reps, 10) || 10);
              }
            }}
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
              {Array.from({ length: Math.min(exercise.sets, 7) }).map((_, i) => (
                <Plate key={i} size={28} active={i < done} className="click" />
              ))}
            </div>
            <Label className="text-[10px] tracking-[0.15em]">Descanso {exercise.restSec}s</Label>
          </div>

          <div className="mt-3 flex items-end justify-center gap-3">
            <div className="font-display text-[64px] leading-[0.85] tracking-tight">
              {load || "—"}
            </div>
            <div className="pb-1.5 font-display text-[20px] text-mute">KG</div>
            <div className="ml-3 font-display text-[42px] leading-none tracking-tight text-flame">
              ×{repsInput}
            </div>
          </div>

          {base > 0 && (
            <div className="mt-3 flex gap-2">
              <Chip
                onClick={() =>
                  setLoadOverride((p) => ({
                    ...p,
                    [exercise.name]: roundLoad(Math.max(0, load - 2.5)),
                  }))
                }
                className="flex-1 text-center font-display text-[16px]"
              >
                − 2.5
              </Chip>
              <Chip
                onClick={() =>
                  setLoadOverride((p) => ({ ...p, [exercise.name]: roundLoad(load + 2.5) }))
                }
                className="flex-1 text-center font-display text-[16px]"
              >
                + 2.5
              </Chip>
            </div>
          )}

          <div className="mt-2 flex gap-2">
            <Chip
              onClick={() => setRepsInput(Math.max(1, repsInput - 1))}
              className="flex-1 text-center font-display text-[16px]"
            >
              − REP
            </Chip>
            <Chip
              onClick={() => setRepsInput(repsInput + 1)}
              className="flex-1 text-center font-display text-[16px]"
            >
              + REP
            </Chip>
          </div>

          <FlameButton className="mt-3" onClick={logSet}>
            REGISTRAR SERIE
          </FlameButton>

          <ProgressBar value={(totalDone / totalSets) * 100} />
          <div className="mt-1.5 flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
            <span>
              {totalDone} de {totalSets} series
            </span>
            <span>Objetivo {exercise.reps} reps</span>
          </div>
        </Card>
      </section>

      {resting && (
        <section className="mt-6 px-5 rise" style={{ animationDelay: "120ms" }}>
          <RestTimer
            key={restKey}
            seconds={exercise.restSec}
            onDone={() => setResting(false)}
          />
        </section>
      )}

      <section className="mt-6 px-5 pb-10 rise" style={{ animationDelay: "240ms" }}>
        <FlameButton onClick={finish}>TERMINAR SESIÓN</FlameButton>
      </section>

      <TabBar />
      {showGuide && (
        <ExerciseGuideSheet
          exercise={exercise}
          kg={load}
          beginner={profile.level !== "avanzado"}
          onClose={() => setShowGuide(false)}
        />
      )}
    </Screen>
  );
}

function MachineStatus({
  value,
  onChange,
  alternatives,
  onSwap,
  onSkipAhead,
}: {
  value: "ok" | "ocupada" | "fuera";
  onChange: (v: "ok" | "ocupada" | "fuera") => void;
  alternatives: Exercise[];
  onSwap: (e: Exercise) => void;
  onSkipAhead: () => void;
}) {
  const opts = [
    { id: "ok", label: "Disponible" },
    { id: "ocupada", label: "Ocupada" },
    { id: "fuera", label: "Fuera de servicio" },
  ] as const;
  return (
    <div className="mt-3">
      <Label className="mb-1.5 text-[9px]">Estado de la máquina</Label>
      <div className="flex gap-1.5">
        {opts.map((o) => (
          <Chip
            key={o.id}
            active={value === o.id}
            onClick={() => onChange(o.id)}
            className="flex-1 px-2 py-1.5 text-center font-display text-[11px] tracking-[0.05em]"
          >
            {o.label.toUpperCase()}
          </Chip>
        ))}
      </div>
      {value !== "ok" && (
        <div className="mt-2 rounded-2xl bg-bg/60 p-3">
          <p className="text-[12px] leading-relaxed text-ink/90">
            {value === "ocupada"
              ? "Adelanta otro ejercicio y vuelve después, o cámbialo por una alternativa:"
              : "Sin problema, cámbialo por una alternativa que trabaja el mismo músculo:"}
          </p>
          {value === "ocupada" && (
            <button
              type="button"
              onClick={onSkipAhead}
              className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-flame"
            >
              ▸ Hacer el siguiente ejercicio mientras tanto
            </button>
          )}
          <div className="mt-2 flex flex-col gap-1.5">
            {alternatives.length === 0 && (
              <span className="text-[12px] text-mute">No hay alternativas para este ejercicio.</span>
            )}
            {alternatives.map((a) => (
              <Chip key={a.name} onClick={() => { onSwap(a); onChange("ok"); }} className="px-3 py-2">
                <span className="font-display text-[13px] tracking-tight">⇄ {a.name.toUpperCase()}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
