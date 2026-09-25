import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TabBar } from "@/components/ui-kit";
import { CoachPanel, readCoachContext } from "@/components/coach-chat";
import { useLog, useProfile } from "@/lib/store";

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

  if (!loaded) return null;
  const base = profile
    ? `Perfil: nivel ${profile.level}, objetivo ${profile.goal}, gimnasio ${profile.gym ?? "completo"}, peso ${profile.bodyWeight} kg, semana ${log.week}\nLesiones: ${JSON.stringify(profile.injuries ?? "ninguna")}`
    : "Sin perfil todavía.";
  const context = session ? `Última sesión en curso:\n${session.context}` : base;

  return (
    <>
      <CoachPanel context={context} exerciseName={session?.exerciseName} />
      <TabBar />
    </>
  );
}
