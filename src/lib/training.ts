export type GoalId =
  | "bajar_peso"
  | "masa_muscular"
  | "mantener"
  | "subir_peso"
  | "recomposicion"
  | "fuerza"
  | "resistencia"
  | "deporte"
  | "movilidad";

export type LevelId = "iniciando" | "intermedio" | "avanzado";

export type SportId =
  | "ninguno"
  | "futbol"
  | "tenis"
  | "voleibol"
  | "basquetbol"
  | "running"
  | "natacion"
  | "ciclismo"
  | "boxeo";

export type MethodId =
  | "fst7"
  | "piramidal"
  | "piramidal_inverso"
  | "descarga"
  | "hiit"
  | "cardio_intervalos"
  | "liss"
  | "pliometria"
  | "gvt"
  | "rest_pause"
  | "cluster"
  | "dropset"
  | "prefatiga"
  | "movilidad"
  | "sport";

export const GOALS: { id: GoalId; label: string; blurb: string }[] = [
  { id: "bajar_peso", label: "Bajar de peso", blurb: "Déficit + cardio inteligente" },
  { id: "masa_muscular", label: "Subir masa muscular", blurb: "Hipertrofia y volumen" },
  { id: "mantener", label: "Mantenerme", blurb: "Mantener forma y fuerza" },
  { id: "subir_peso", label: "Aumentar peso", blurb: "Superávit y carga alta" },
  { id: "recomposicion", label: "Recomposición", blurb: "Perder grasa, ganar músculo" },
  { id: "fuerza", label: "Fuerza máxima", blurb: "Piramidales y clusters" },
  { id: "resistencia", label: "Resistencia", blurb: "Capacidad cardiovascular" },
  { id: "deporte", label: "Rendimiento deportivo", blurb: "Gym para tu deporte" },
  { id: "movilidad", label: "Movilidad y potencia", blurb: "Pliometría y control" },
];

export const LEVELS: { id: LevelId; label: string; blurb: string; sessions: number }[] = [
  { id: "iniciando", label: "Iniciando", blurb: "0 a 6 meses entrenando", sessions: 3 },
  { id: "intermedio", label: "Intermedio", blurb: "6 meses a 2 años", sessions: 4 },
  { id: "avanzado", label: "Avanzado", blurb: "Más de 2 años", sessions: 5 },
];

export const SPORTS: { id: SportId; label: string }[] = [
  { id: "ninguno", label: "Ninguno" },
  { id: "futbol", label: "Fútbol" },
  { id: "tenis", label: "Tenis" },
  { id: "voleibol", label: "Voleibol" },
  { id: "basquetbol", label: "Básquet" },
  { id: "running", label: "Running" },
  { id: "natacion", label: "Natación" },
  { id: "ciclismo", label: "Ciclismo" },
  { id: "boxeo", label: "Boxeo" },
];

export const METHODS: Record<MethodId, { label: string; detail: string }> = {
  fst7: {
    label: "FST-7",
    detail:
      "Fascia Stretch Training: 6 series pesadas y luego 7 series de 10-12 reps con 30-45s de descanso para estirar la fascia.",
  },
  piramidal: {
    label: "Piramidal",
    detail: "Sube carga y baja reps serie a serie. Fuerza y tensión mecánica.",
  },
  piramidal_inverso: {
    label: "Piramidal inverso",
    detail: "Arranca pesado y baja carga subiendo reps. Máximo reclutamiento en fresco.",
  },
  descarga: {
    label: "Descarga",
    detail: "Semana de deload: 60% de carga, mismo movimiento. Recuperas y vuelves más fuerte.",
  },
  hiit: {
    label: "Cardio HIIT",
    detail: "Intervalos máximos 20-30s con descanso 60-90s. Quema alta, sesión corta.",
  },
  cardio_intervalos: {
    label: "Intervalos",
    detail: "Bloques 2-4 min a ritmo alto alternando con recuperación activa.",
  },
  liss: { label: "Cardio LISS", detail: "Ritmo constante y bajo impacto, 30-45 min." },
  pliometria: {
    label: "Pliometría",
    detail: "Saltos y trabajo reactivo. Potencia, movilidad y tejido elástico.",
  },
  gvt: {
    label: "GVT 10×10",
    detail: "German Volume Training: 10 series de 10 con 60s. Volumen brutal en un patrón.",
  },
  rest_pause: {
    label: "Rest-Pause",
    detail: "Al fallo, 15s de pausa, más reps. Intensidad de Dorian Yates.",
  },
  cluster: {
    label: "Cluster sets",
    detail: "Series partidas con micro-descansos de 15-20s para mover más carga.",
  },
  dropset: {
    label: "Drop sets",
    detail: "Bajas peso sin descanso hasta el fallo. Cierre metabólico.",
  },
  prefatiga: {
    label: "Pre-fatiga",
    detail: "Aislamiento antes del básico para llevar el músculo objetivo al límite.",
  },
  movilidad: { label: "Movilidad", detail: "Rango articular, control y estabilidad." },
  sport: { label: "Específico", detail: "Transferencia directa a tu deporte." },
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  /** fraction of body weight used as a baseline load estimate */
  loadFactor?: number;
};

export type Session = {
  day: string;
  title: string;
  method: MethodId;
  focus: string;
  minutes: number;
  exercises: Exercise[];
};

const DAYS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

const LEVEL_FACTOR: Record<LevelId, number> = {
  iniciando: 0.55,
  intermedio: 0.8,
  avanzado: 1.05,
};

const GOAL_FACTOR: Record<GoalId, number> = {
  bajar_peso: 0.9,
  masa_muscular: 1,
  mantener: 0.95,
  subir_peso: 1.05,
  recomposicion: 0.95,
  fuerza: 1.1,
  resistencia: 0.8,
  deporte: 0.9,
  movilidad: 0.75,
};

export function roundLoad(kg: number) {
  return Math.max(0, Math.round(kg / 2.5) * 2.5);
}

/** Recommended load in kg for an exercise, given profile and completed weeks. */
export function recommendedLoad(
  ex: Exercise,
  opts: { bodyWeight: number; level: LevelId; goal: GoalId; week: number },
) {
  if (!ex.loadFactor) return 0;
  const progression = 1 + Math.min(opts.week, 12) * 0.02;
  const raw =
    opts.bodyWeight *
    ex.loadFactor *
    LEVEL_FACTOR[opts.level] *
    GOAL_FACTOR[opts.goal] *
    progression;
  return roundLoad(raw);
}

const PUSH: Exercise[] = [
  { name: "Press banca", sets: 4, reps: "8", restSec: 120, loadFactor: 0.8 },
  { name: "Press inclinado con mancuernas", sets: 4, reps: "10", restSec: 90, loadFactor: 0.28 },
  { name: "Aperturas en polea", sets: 7, reps: "10-12", restSec: 40, loadFactor: 0.14 },
  { name: "Fondos en paralelas", sets: 3, reps: "10-12", restSec: 90 },
  { name: "Extensión de tríceps en cuerda", sets: 4, reps: "12", restSec: 60, loadFactor: 0.22 },
];

const PULL: Exercise[] = [
  { name: "Peso muerto", sets: 4, reps: "6", restSec: 150, loadFactor: 1.1 },
  { name: "Remo con barra", sets: 4, reps: "8-10", restSec: 100, loadFactor: 0.6 },
  { name: "Jalón al pecho", sets: 4, reps: "10-12", restSec: 80, loadFactor: 0.55 },
  { name: "Remo en polea baja", sets: 7, reps: "10-12", restSec: 40, loadFactor: 0.45 },
  { name: "Curl con barra", sets: 4, reps: "10", restSec: 60, loadFactor: 0.3 },
];

const LEGS: Exercise[] = [
  { name: "Sentadilla trasera", sets: 5, reps: "8-6-4", restSec: 150, loadFactor: 1 },
  { name: "Prensa 45°", sets: 4, reps: "12", restSec: 110, loadFactor: 1.6 },
  { name: "Peso muerto rumano", sets: 4, reps: "10", restSec: 100, loadFactor: 0.75 },
  { name: "Extensión de cuádriceps", sets: 7, reps: "12", restSec: 40, loadFactor: 0.45 },
  { name: "Elevación de gemelos", sets: 4, reps: "15", restSec: 50, loadFactor: 0.7 },
];

const SHOULDERS: Exercise[] = [
  { name: "Press militar de pie", sets: 4, reps: "8", restSec: 120, loadFactor: 0.5 },
  { name: "Elevaciones laterales", sets: 5, reps: "12-15", restSec: 50, loadFactor: 0.09 },
  { name: "Pájaros en banco", sets: 4, reps: "15", restSec: 50, loadFactor: 0.08 },
  { name: "Encogimientos con barra", sets: 4, reps: "12", restSec: 60, loadFactor: 0.7 },
];

const FULLBODY: Exercise[] = [
  { name: "Sentadilla goblet", sets: 3, reps: "12", restSec: 75, loadFactor: 0.22 },
  { name: "Press banca con mancuernas", sets: 3, reps: "12", restSec: 75, loadFactor: 0.24 },
  { name: "Remo con mancuerna", sets: 3, reps: "12", restSec: 75, loadFactor: 0.24 },
  { name: "Plancha", sets: 3, reps: "40 s", restSec: 45 },
];

const HIIT: Exercise[] = [
  { name: "Sprint en bicicleta", sets: 8, reps: "25 s máx / 75 s suave", restSec: 75 },
  { name: "Remo ergómetro", sets: 6, reps: "30 s fuerte", restSec: 60 },
  { name: "Battle rope", sets: 5, reps: "20 s", restSec: 60 },
];

const INTERVALOS: Exercise[] = [
  { name: "Cinta en cuesta", sets: 6, reps: "3 min fuerte / 2 min suave", restSec: 120 },
  { name: "Escaladora", sets: 4, reps: "2 min", restSec: 90 },
];

const PLIO: Exercise[] = [
  { name: "Salto al cajón", sets: 5, reps: "5", restSec: 90 },
  { name: "Salto amplio horizontal", sets: 4, reps: "4", restSec: 90 },
  { name: "Skipping alto", sets: 4, reps: "20 s", restSec: 60 },
  { name: "Movilidad de cadera 90/90", sets: 3, reps: "8 por lado", restSec: 45 },
];

const SPORT_WORK: Record<Exclude<SportId, "ninguno">, Exercise[]> = {
  futbol: [
    { name: "Sentadilla búlgara", sets: 4, reps: "8 por pierna", restSec: 90, loadFactor: 0.25 },
    { name: "Nórdico de isquios", sets: 4, reps: "6", restSec: 90 },
    { name: "Cambios de dirección en conos", sets: 6, reps: "15 s", restSec: 60 },
    { name: "Aductores en polea", sets: 3, reps: "12", restSec: 60, loadFactor: 0.12 },
  ],
  tenis: [
    { name: "Rotación de tronco en polea", sets: 4, reps: "10 por lado", restSec: 60, loadFactor: 0.18 },
    { name: "Lanzamiento de balón medicinal lateral", sets: 5, reps: "6", restSec: 75 },
    { name: "Desplazamiento lateral con banda", sets: 4, reps: "20 s", restSec: 60 },
    { name: "Rotadores externos de hombro", sets: 3, reps: "15", restSec: 45, loadFactor: 0.05 },
  ],
  voleibol: [
    { name: "Salto vertical con contramovimiento", sets: 6, reps: "4", restSec: 90 },
    { name: "Sentadilla con salto", sets: 4, reps: "5", restSec: 90, loadFactor: 0.3 },
    { name: "Press por encima de la cabeza", sets: 4, reps: "8", restSec: 90, loadFactor: 0.45 },
    { name: "Manguito rotador con banda", sets: 3, reps: "15", restSec: 45 },
  ],
  basquetbol: [
    { name: "Hip thrust", sets: 4, reps: "8", restSec: 100, loadFactor: 0.9 },
    { name: "Salto a una pierna", sets: 5, reps: "5 por lado", restSec: 80 },
    { name: "Paso lateral defensivo con banda", sets: 4, reps: "25 s", restSec: 60 },
    { name: "Core anti-rotación", sets: 3, reps: "10 por lado", restSec: 45, loadFactor: 0.12 },
  ],
  running: [
    { name: "Zancadas caminando", sets: 4, reps: "10 por pierna", restSec: 80, loadFactor: 0.2 },
    { name: "Elevación de gemelo a una pierna", sets: 4, reps: "15", restSec: 60 },
    { name: "Puente de isquios a una pierna", sets: 3, reps: "12", restSec: 60 },
  ],
  natacion: [
    { name: "Pull-over en polea", sets: 4, reps: "12", restSec: 70, loadFactor: 0.3 },
    { name: "Dominadas asistidas", sets: 4, reps: "8", restSec: 90 },
    { name: "Hollow hold", sets: 3, reps: "30 s", restSec: 45 },
  ],
  ciclismo: [
    { name: "Sentadilla frontal", sets: 4, reps: "8", restSec: 110, loadFactor: 0.75 },
    { name: "Step-up al cajón", sets: 4, reps: "10 por pierna", restSec: 80, loadFactor: 0.25 },
    { name: "Plancha lateral", sets: 3, reps: "40 s", restSec: 45 },
  ],
  boxeo: [
    { name: "Press de banca explosivo", sets: 5, reps: "3", restSec: 120, loadFactor: 0.55 },
    { name: "Lanzamiento de balón al suelo", sets: 5, reps: "8", restSec: 70 },
    { name: "Cuello y trapecio con banda", sets: 3, reps: "15", restSec: 45 },
  ],
};

function cardioFor(goal: GoalId): Session {
  if (goal === "bajar_peso" || goal === "recomposicion")
    return {
      day: "",
      title: "CARDIO HIIT",
      method: "hiit",
      focus: "Quema y capacidad",
      minutes: 26,
      exercises: HIIT,
    };
  if (goal === "resistencia")
    return {
      day: "",
      title: "INTERVALOS",
      method: "cardio_intervalos",
      focus: "Motor aeróbico",
      minutes: 38,
      exercises: INTERVALOS,
    };
  return {
    day: "",
    title: "CARDIO LISS",
    method: "liss",
    focus: "Recuperación activa",
    minutes: 35,
    exercises: [{ name: "Caminata inclinada", sets: 1, reps: "35 min", restSec: 0 }],
  };
}

function hypertrophyMethod(level: LevelId, goal: GoalId): MethodId {
  if (goal === "fuerza") return "piramidal";
  if (level === "iniciando") return "piramidal";
  if (level === "avanzado") return goal === "masa_muscular" ? "fst7" : "rest_pause";
  return "fst7";
}

export type Profile = {
  name: string;
  goal: GoalId;
  level: LevelId;
  sport: SportId;
  bodyWeight: number;
  daysPerWeek: number;
  reminderTime: string;
  reminderDays: number[];
};

/** Builds the weekly plan from the profile. Week 4, 8, 12... become deload weeks. */
export function buildPlan(profile: Profile, week = 1): Session[] {
  const { goal, level, sport, daysPerWeek } = profile;
  const isDeload = week > 0 && week % 4 === 0;
  const method = hypertrophyMethod(level, goal);
  const sessions: Session[] = [];

  const strength: Session[] =
    daysPerWeek <= 3
      ? [
          {
            day: "",
            title: "CUERPO COMPLETO A",
            method: level === "iniciando" ? "piramidal" : method,
            focus: "Patrones básicos",
            minutes: 50,
            exercises: FULLBODY.concat(PUSH.slice(0, 2)),
          },
          {
            day: "",
            title: "CUERPO COMPLETO B",
            method: "piramidal_inverso",
            focus: "Tirón y pierna",
            minutes: 52,
            exercises: PULL.slice(0, 3).concat(LEGS.slice(0, 2)),
          },
        ]
      : [
          {
            day: "",
            title: "PECHO · TRÍCEPS",
            method,
            focus: "Empuje",
            minutes: 55,
            exercises: PUSH,
          },
          {
            day: "",
            title: "ESPALDA · BÍCEPS",
            method: level === "avanzado" ? "cluster" : "piramidal",
            focus: "Tirón",
            minutes: 58,
            exercises: PULL,
          },
          {
            day: "",
            title: "PIERNA COMPLETA",
            method: goal === "fuerza" ? "piramidal" : "gvt",
            focus: "Cuádriceps e isquios",
            minutes: 62,
            exercises: LEGS,
          },
          {
            day: "",
            title: "HOMBRO · CORE",
            method: level === "avanzado" ? "dropset" : "prefatiga",
            focus: "Deltoides",
            minutes: 45,
            exercises: SHOULDERS,
          },
        ];

  const strengthCount = Math.max(2, Math.min(strength.length, daysPerWeek - 1));
  sessions.push(...strength.slice(0, strengthCount));
  sessions.push(cardioFor(goal));

  if (daysPerWeek >= 5 || goal === "movilidad") {
    sessions.push({
      day: "",
      title: "PLIOMETRÍA",
      method: "pliometria",
      focus: "Potencia y movilidad",
      minutes: 40,
      exercises: PLIO,
    });
  }

  if (sport !== "ninguno") {
    sessions.push({
      day: "",
      title: `ESPECÍFICO ${SPORTS.find((s) => s.id === sport)!.label.toUpperCase()}`,
      method: "sport",
      focus: "Transferencia deportiva",
      minutes: 45,
      exercises: SPORT_WORK[sport],
    });
  }

  const trimmed = sessions.slice(0, Math.max(3, daysPerWeek));

  return trimmed.map((s, i) => ({
    ...s,
    day: DAYS[i % 7] ?? "",
    method: isDeload && s.exercises.some((e) => e.loadFactor) ? "descarga" : s.method,
    minutes: isDeload ? Math.round(s.minutes * 0.7) : s.minutes,
  }));
}

export function deloadFactor(week: number) {
  return week > 0 && week % 4 === 0 ? 0.6 : 1;
}

export function goalLabel(id: GoalId) {
  return GOALS.find((g) => g.id === id)?.label ?? "";
}
export function levelLabel(id: LevelId) {
  return LEVELS.find((l) => l.id === id)?.label ?? "";
}
export function sportLabel(id: SportId) {
  return SPORTS.find((s) => s.id === id)?.label ?? "";
}
