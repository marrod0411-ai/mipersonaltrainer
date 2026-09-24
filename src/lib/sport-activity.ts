import type { Profile, SportId } from "./training";

export type Intensity = "baja" | "media" | "alta";
export type SportActivity = { minutes: number; timesPerWeek: number; intensity: Intensity };

export const INTENSITIES: { id: Intensity; label: string }[] = [
  { id: "baja", label: "Suave" },
  { id: "media", label: "Moderada" },
  { id: "alta", label: "Intensa" },
];

// MET values (Compendium of Physical Activities) by intensity
const MET: Record<Exclude<SportId, "ninguno">, [number, number, number]> = {
  futbol: [5, 7, 10],
  tenis: [5, 7.3, 8],
  voleibol: [3, 4, 8],
  basquetbol: [4.5, 6.5, 8],
  running: [7, 9.8, 12.3],
  natacion: [5.8, 8.3, 10],
  ciclismo: [5.8, 8, 10],
  boxeo: [5.5, 7.8, 12.8],
};

// approx. steps per minute of practice (0 = no steps: water/bike)
const STEPS_PER_MIN: Record<Exclude<SportId, "ninguno">, number> = {
  futbol: 110,
  tenis: 90,
  voleibol: 60,
  basquetbol: 110,
  running: 160,
  natacion: 0,
  ciclismo: 0,
  boxeo: 80,
};

export function sportActivityOf(profile: Profile) {
  const a = profile.sportActivity;
  if (profile.sport === "ninguno" || !a || !a.minutes || !a.timesPerWeek) return null;
  const idx = a.intensity === "baja" ? 0 : a.intensity === "media" ? 1 : 2;
  const met = MET[profile.sport][idx];
  const perSession = Math.round(met * profile.bodyWeight * (a.minutes / 60));
  const weekly = perSession * a.timesPerWeek;
  const weeklyMin = a.minutes * a.timesPerWeek;
  const vigorous = met >= 6;
  // WHO: 150 min moderate or 75 vigorous per week
  const cardioEquivalent = vigorous ? weeklyMin * 2 : weeklyMin;
  const stepsPerSession = STEPS_PER_MIN[profile.sport] * a.minutes;
  return {
    met,
    perSession,
    weekly,
    daily: Math.round(weekly / 7),
    weeklyMin,
    cardioEquivalent,
    cardioPct: Math.min(100, Math.round((cardioEquivalent / 150) * 100)),
    stepsPerSession,
    stepsWeekly: stepsPerSession * a.timesPerWeek,
    stepGoal: Math.max(6000, 10000 - Math.round((stepsPerSession * a.timesPerWeek) / 7)),
  };
}
