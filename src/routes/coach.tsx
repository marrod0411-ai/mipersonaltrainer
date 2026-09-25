import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TabBar } from "@/components/ui-kit";
import { CoachPanel, readCoachContext } from "@/components/coach-chat";
import { isSessionDoneToday, todaySessionIndex, useLog, useProfile } from "@/lib/store";
import { METHODS, buildPlan, recommendedLoad, sessionKcal } from "@/lib/training";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach IA — Mi Personal Trainer" },
      { name: "description", content: "Habla con tu coach IA: técnica, cambios de ejercicio, cargas y dudas de tu plan." },
      { property: "og:title", content: "Coach IA — Mi Personal Trainer" },
      { property: "og:description", content: "Tu entrenador personal con IA, disponible durante y después de entrenar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoachScreen,
});

function CoachScreen() {
  const { profile, loaded } = useProfile();
  const { log } = useLog();
  const [session, setSession] = useState<{ context: string; exerciseName?: string } | null>(null);
  useEffect(() => setSession(readCoachContext()), []);

  const plan = useMemo(() => (profile ? buildPlan(profile, log.week) : []), [profile, log.week]);

  if (!loaded) return null;
  let context = "Sin perfil todavía.";
  if (profile) {
    const now = new Date();
    const fecha = now.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const hora = now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false });
    const ti = todaySessionIndex(plan, log);
    const opts = { bodyWeight: profile.bodyWeight, level: profile.level, goal: profile.goal, week: log.week };
    const detail = (i: number) => {
      const s = plan[i]!;
      const ex = s.exercises
        .map((e) => {
          const kg = recommendedLoad(e, opts);
          return `  - ${e.name}: ${e.sets}x${e.reps}, descanso ${e.restSec}s${kg ? `, carga sugerida ${kg} kg` : ""}`;
        })
        .join("\n");
      return `${s.title} — método ${METHODS[s.method].label}, ${s.minutes} min, ≈${sessionKcal(s, profile.bodyWeight)} kcal. ${s.focus}\n${ex}`;
    };
    const week = plan
      .map((s, i) => `${i + 1}. ${s.title}${isSessionDoneToday(log, s.title) ? " (hecha hoy)" : ""}${i === ti ? " ← HOY" : ""}`)
      .join("\n");
    const recent = log.completedSessions.slice(-5).map((k) => k.replace("|", ": ")).join("; ") || "ninguna";
    const m = log.measurements?.at(-1);
    context = [
      `Hoy es ${fecha}, ${hora}.`,
      `Persona: ${profile.name}, nivel ${profile.level}, objetivo ${profile.goal}, gimnasio ${profile.gym ?? "completo"}, peso ${profile.bodyWeight} kg, ${profile.daysPerWeek} días/semana, deporte ${profile.sport}. Semana ${log.week} del plan${log.week % 4 === 0 ? " (semana de descarga)" : ""}.`,
      `Lesiones: ${JSON.stringify(profile.injuries ?? "ninguna")}`,
      m ? `Última medición (${m.date}): peso ${m.weight} kg, cintura ${m.waist ?? "-"} cm.` : "",
      `RUTINA QUE LE TOCA HOY:\n${plan.length ? detail(ti) : "sin plan"}`,
      `Plan de la semana en orden (la app avanza a la siguiente sesión al completar la anterior):\n${week}`,
      `Últimas sesiones completadas: ${recent}`,
      session ? `Sesión en curso ahora mismo:\n${session.context}` : "",
      "Tienes acceso completo a su plan: nunca le pidas que te copie o mande su rutina.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return (
    <>
      <h1 className="sr-only">Tu Coach IA</h1>
      <CoachPanel context={context} exerciseName={session?.exerciseName} />
      <TabBar />
    </>
  );
}
