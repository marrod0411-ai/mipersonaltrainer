import { bodyBias } from "./body";

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

export type GymId = "casa" | "basico" | "completo" | "premium";

export const GYMS: { id: GymId; label: string; blurb: string }[] = [
  { id: "casa", label: "En casa", blurb: "Peso corporal, mancuernas y bandas" },
  { id: "basico", label: "Gym básico", blurb: "Barras, discos, banco y poleas simples" },
  { id: "completo", label: "Gym completo", blurb: "Máquinas, poleas cruzadas y agarres" },
  { id: "premium", label: "Gym premium", blurb: "Hack, convergentes y máquinas de marca" },
];

export const GYM_TIER: Record<GymId, number> = {
  casa: 0,
  basico: 1,
  completo: 2,
  premium: 3,
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  /** fraction of body weight used as a baseline load estimate */
  loadFactor?: number;
  /** equipment level needed: 0 casa, 1 básico, 2 completo, 3 premium */
  tier?: number;
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

type Pool = { anchors: Exercise[]; acc: Exercise[] };

function availableIn(list: Exercise[], gym: GymId) {
  const t = GYM_TIER[gym];
  const f = list.filter((e) => (e.tier ?? 1) <= t);
  return f.length ? f : list.filter((e) => (e.tier ?? 1) <= 1);
}

/** Rotates the exercise selection week by week so the routine never repeats flat. */
function pick(list: Exercise[], gym: GymId, count: number, week: number, seed = 0) {
  const a = availableIn(list, gym);
  if (!a.length) return [];
  const out: Exercise[] = [];
  const start = Math.abs((week - 1) * count + seed) % a.length;
  for (let i = 0; i < Math.min(count, a.length); i++) out.push(a[(start + i) % a.length]!);
  return out;
}

const PUSH: Pool = {
  anchors: [
    { name: "Press banca", sets: 4, reps: "8", restSec: 120, loadFactor: 0.8, tier: 1 },
    { name: "Press inclinado con barra", sets: 4, reps: "8", restSec: 120, loadFactor: 0.65, tier: 1 },
    { name: "Press banca con mancuernas", sets: 4, reps: "10", restSec: 100, loadFactor: 0.3, tier: 0 },
    { name: "Press inclinado con mancuernas", sets: 4, reps: "10", restSec: 90, loadFactor: 0.28, tier: 0 },
    { name: "Flexiones con déficit y lastre", sets: 4, reps: "12-15", restSec: 75, tier: 0 },
    { name: "Press en máquina Hammer", sets: 4, reps: "10", restSec: 100, loadFactor: 0.9, tier: 2 },
    { name: "Press declinado en multipower", sets: 4, reps: "10", restSec: 100, loadFactor: 0.7, tier: 2 },
    { name: "Press convergente inclinado 30°", sets: 4, reps: "8-10", restSec: 110, loadFactor: 0.85, tier: 3 },
    { name: "Fondos en paralelas lastrados", sets: 4, reps: "8-10", restSec: 100, tier: 1 },
  ],
  acc: [
    { name: "Aperturas con mancuernas en banco inclinado", sets: 4, reps: "12", restSec: 60, loadFactor: 0.12, tier: 0 },
    { name: "Cruce en polea alta", sets: 7, reps: "10-12", restSec: 40, loadFactor: 0.14, tier: 2 },
    { name: "Cruce en polea baja a pecho alto", sets: 4, reps: "12-15", restSec: 50, loadFactor: 0.13, tier: 2 },
    { name: "Cruce unilateral en polea media", sets: 4, reps: "12 por lado", restSec: 45, loadFactor: 0.1, tier: 2 },
    { name: "Pec deck", sets: 4, reps: "12-15", restSec: 50, loadFactor: 0.35, tier: 2 },
    { name: "Extensión de tríceps en cuerda", sets: 4, reps: "12", restSec: 60, loadFactor: 0.22, tier: 2 },
    { name: "Extensión de tríceps agarre inverso en polea", sets: 4, reps: "12 por brazo", restSec: 50, loadFactor: 0.14, tier: 2 },
    { name: "Extensión sobre la cabeza en polea baja", sets: 4, reps: "12", restSec: 55, loadFactor: 0.2, tier: 2 },
    { name: "Press francés con barra Z", sets: 4, reps: "10", restSec: 70, loadFactor: 0.25, tier: 1 },
    { name: "Patada de tríceps con mancuerna", sets: 3, reps: "15 por brazo", restSec: 45, loadFactor: 0.06, tier: 0 },
    { name: "Fondos en máquina asistida", sets: 4, reps: "12", restSec: 60, tier: 2 },
    { name: "Extensión de tríceps en máquina sentado", sets: 4, reps: "12-15", restSec: 50, loadFactor: 0.3, tier: 3 },
  ],
};

const PULL: Pool = {
  anchors: [
    { name: "Peso muerto convencional", sets: 4, reps: "6", restSec: 150, loadFactor: 1.1, tier: 1 },
    { name: "Peso muerto sumo", sets: 4, reps: "6", restSec: 150, loadFactor: 1.15, tier: 1 },
    { name: "Remo con barra agarre prono", sets: 4, reps: "8-10", restSec: 100, loadFactor: 0.6, tier: 1 },
    { name: "Remo Pendlay", sets: 4, reps: "6-8", restSec: 110, loadFactor: 0.6, tier: 1 },
    { name: "Remo en barra T agarre neutro", sets: 4, reps: "10", restSec: 100, loadFactor: 0.55, tier: 2 },
    { name: "Dominadas agarre prono ancho", sets: 4, reps: "8", restSec: 100, tier: 0 },
    { name: "Dominadas agarre supino", sets: 4, reps: "8-10", restSec: 90, tier: 0 },
    { name: "Remo con mancuerna a un brazo", sets: 4, reps: "10 por lado", restSec: 80, loadFactor: 0.25, tier: 0 },
    { name: "Remo en máquina Hammer unilateral", sets: 4, reps: "10 por lado", restSec: 90, loadFactor: 0.5, tier: 2 },
    { name: "Jalón al pecho agarre ancho", sets: 4, reps: "10-12", restSec: 80, loadFactor: 0.55, tier: 1 },
    { name: "Jalón agarre neutro cerrado", sets: 4, reps: "10-12", restSec: 80, loadFactor: 0.5, tier: 1 },
  ],
  acc: [
    { name: "Remo en polea baja con triángulo", sets: 7, reps: "10-12", restSec: 40, loadFactor: 0.45, tier: 1 },
    { name: "Remo sentado en polea agarre ancho", sets: 4, reps: "12", restSec: 60, loadFactor: 0.4, tier: 2 },
    { name: "Pull-over en polea alta con barra recta", sets: 4, reps: "12-15", restSec: 50, loadFactor: 0.3, tier: 2 },
    { name: "Face pull en polea alta", sets: 4, reps: "15", restSec: 45, loadFactor: 0.15, tier: 2 },
    { name: "Remo en polea alta unilateral arrodillado", sets: 4, reps: "12 por lado", restSec: 45, loadFactor: 0.15, tier: 2 },
    { name: "Encogimientos en polea alta", sets: 4, reps: "15", restSec: 45, loadFactor: 0.4, tier: 2 },
    { name: "Curl con barra recta", sets: 4, reps: "10", restSec: 60, loadFactor: 0.3, tier: 1 },
    { name: "Curl con barra Z agarre ancho", sets: 4, reps: "10-12", restSec: 60, loadFactor: 0.28, tier: 1 },
    { name: "Curl martillo con mancuernas", sets: 4, reps: "12", restSec: 55, loadFactor: 0.12, tier: 0 },
    { name: "Curl inclinado en banco a 60°", sets: 3, reps: "12", restSec: 55, loadFactor: 0.1, tier: 0 },
    { name: "Curl en polea baja con cuerda", sets: 4, reps: "12-15", restSec: 45, loadFactor: 0.2, tier: 2 },
    { name: "Curl predicador en máquina", sets: 4, reps: "12", restSec: 50, loadFactor: 0.25, tier: 3 },
  ],
};

const LEGS: Pool = {
  anchors: [
    { name: "Sentadilla trasera", sets: 5, reps: "8-6-4", restSec: 150, loadFactor: 1, tier: 1 },
    { name: "Sentadilla frontal", sets: 4, reps: "8", restSec: 130, loadFactor: 0.75, tier: 1 },
    { name: "Sentadilla en multipower", sets: 4, reps: "10", restSec: 120, loadFactor: 0.9, tier: 2 },
    { name: "Hack squat", sets: 4, reps: "10-12", restSec: 120, loadFactor: 1.3, tier: 3 },
    { name: "Prensa 45°", sets: 4, reps: "12", restSec: 110, loadFactor: 1.6, tier: 2 },
    { name: "Prensa horizontal", sets: 4, reps: "12-15", restSec: 100, loadFactor: 1.4, tier: 2 },
    { name: "Peso muerto rumano", sets: 4, reps: "10", restSec: 100, loadFactor: 0.75, tier: 1 },
    { name: "Zancadas caminando con barra", sets: 4, reps: "10 por pierna", restSec: 90, loadFactor: 0.4, tier: 1 },
    { name: "Sentadilla búlgara con mancuernas", sets: 4, reps: "10 por pierna", restSec: 90, loadFactor: 0.25, tier: 0 },
    { name: "Sentadilla goblet", sets: 4, reps: "12", restSec: 75, loadFactor: 0.22, tier: 0 },
  ],
  acc: [
    { name: "Extensión de cuádriceps", sets: 7, reps: "12", restSec: 40, loadFactor: 0.45, tier: 2 },
    { name: "Extensión unilateral de cuádriceps", sets: 4, reps: "12 por pierna", restSec: 45, loadFactor: 0.2, tier: 2 },
    { name: "Curl femoral tumbado", sets: 4, reps: "12", restSec: 60, loadFactor: 0.35, tier: 2 },
    { name: "Curl femoral sentado", sets: 4, reps: "12-15", restSec: 55, loadFactor: 0.35, tier: 2 },
    { name: "Curl nórdico de isquios", sets: 4, reps: "6", restSec: 90, tier: 0 },
    { name: "Hip thrust con barra", sets: 4, reps: "10", restSec: 100, loadFactor: 0.9, tier: 1 },
    { name: "Abductores en máquina", sets: 4, reps: "15", restSec: 45, loadFactor: 0.4, tier: 2 },
    { name: "Aductores en máquina", sets: 4, reps: "15", restSec: 45, loadFactor: 0.35, tier: 2 },
    { name: "Patada de glúteo en polea baja", sets: 4, reps: "12 por lado", restSec: 45, loadFactor: 0.15, tier: 2 },
    { name: "Peso muerto a una pierna con polea", sets: 3, reps: "10 por lado", restSec: 60, loadFactor: 0.2, tier: 2 },
    { name: "Elevación de gemelos de pie", sets: 4, reps: "15", restSec: 50, loadFactor: 0.7, tier: 1 },
    { name: "Gemelo sentado en máquina", sets: 4, reps: "18", restSec: 45, loadFactor: 0.5, tier: 2 },
  ],
};

const SHOULDERS: Pool = {
  anchors: [
    { name: "Press militar de pie", sets: 4, reps: "8", restSec: 120, loadFactor: 0.5, tier: 1 },
    { name: "Press Arnold con mancuernas", sets: 4, reps: "10", restSec: 90, loadFactor: 0.22, tier: 0 },
    { name: "Press de hombro en máquina", sets: 4, reps: "10-12", restSec: 90, loadFactor: 0.5, tier: 2 },
    { name: "Press tras nuca en multipower", sets: 4, reps: "10", restSec: 100, loadFactor: 0.4, tier: 2 },
  ],
  acc: [
    { name: "Elevaciones laterales con mancuernas", sets: 5, reps: "12-15", restSec: 50, loadFactor: 0.09, tier: 0 },
    { name: "Elevación lateral en polea baja unilateral", sets: 4, reps: "15 por lado", restSec: 45, loadFactor: 0.07, tier: 2 },
    { name: "Elevación lateral en máquina", sets: 4, reps: "12-15", restSec: 45, loadFactor: 0.25, tier: 3 },
    { name: "Pájaros en banco inclinado", sets: 4, reps: "15", restSec: 50, loadFactor: 0.08, tier: 0 },
    { name: "Reverse pec deck", sets: 4, reps: "15", restSec: 45, loadFactor: 0.25, tier: 2 },
    { name: "Elevación frontal con disco", sets: 3, reps: "15", restSec: 45, loadFactor: 0.15, tier: 1 },
    { name: "Encogimientos con barra", sets: 4, reps: "12", restSec: 60, loadFactor: 0.7, tier: 1 },
    { name: "Rueda abdominal", sets: 4, reps: "12", restSec: 50, tier: 1 },
    { name: "Crunch en polea alta arrodillado", sets: 4, reps: "15", restSec: 45, loadFactor: 0.25, tier: 2 },
    { name: "Elevación de piernas colgado", sets: 4, reps: "12", restSec: 50, tier: 0 },
    { name: "Plancha con lastre", sets: 3, reps: "45 s", restSec: 45, tier: 0 },
  ],
};

const FULLBODY: Pool = {
  anchors: [
    { name: "Sentadilla goblet", sets: 4, reps: "12", restSec: 75, loadFactor: 0.22, tier: 0 },
    { name: "Press banca con mancuernas", sets: 4, reps: "12", restSec: 75, loadFactor: 0.24, tier: 0 },
    { name: "Peso muerto rumano con mancuernas", sets: 4, reps: "12", restSec: 80, loadFactor: 0.3, tier: 0 },
    { name: "Remo con mancuerna a un brazo", sets: 4, reps: "12 por lado", restSec: 75, loadFactor: 0.24, tier: 0 },
    { name: "Sentadilla trasera", sets: 4, reps: "8-10", restSec: 120, loadFactor: 0.9, tier: 1 },
    { name: "Jalón al pecho agarre neutro", sets: 4, reps: "12", restSec: 70, loadFactor: 0.5, tier: 1 },
  ],
  acc: [
    { name: "Plancha con lastre", sets: 3, reps: "45 s", restSec: 45, tier: 0 },
    { name: "Elevaciones laterales con mancuernas", sets: 3, reps: "15", restSec: 45, loadFactor: 0.09, tier: 0 },
    { name: "Curl martillo con mancuernas", sets: 3, reps: "12", restSec: 50, loadFactor: 0.12, tier: 0 },
    { name: "Extensión de tríceps en cuerda", sets: 3, reps: "15", restSec: 45, loadFactor: 0.22, tier: 2 },
    { name: "Hip thrust con barra", sets: 3, reps: "12", restSec: 75, loadFactor: 0.8, tier: 1 },
    { name: "Face pull en polea alta", sets: 3, reps: "15", restSec: 45, loadFactor: 0.15, tier: 2 },
  ],
};

const HIIT: Exercise[] = [
  { name: "Sprint en bicicleta estática", sets: 8, reps: "25 s máx / 75 s suave", restSec: 75, tier: 1 },
  { name: "Remo ergómetro", sets: 6, reps: "30 s fuerte", restSec: 60, tier: 1 },
  { name: "Battle rope", sets: 5, reps: "20 s", restSec: 60, tier: 2 },
  { name: "Sprint en cinta curva", sets: 8, reps: "20 s", restSec: 70, tier: 3 },
  { name: "Trineo de empuje", sets: 6, reps: "20 m", restSec: 75, tier: 3 },
  { name: "Burpees", sets: 6, reps: "30 s", restSec: 60, tier: 0 },
  { name: "Salto a la cuerda doble", sets: 6, reps: "30 s", restSec: 55, tier: 0 },
  { name: "Ski erg", sets: 6, reps: "30 s", restSec: 60, tier: 2 },
];

const INTERVALOS: Exercise[] = [
  { name: "Cinta en cuesta", sets: 6, reps: "3 min fuerte / 2 min suave", restSec: 120, tier: 1 },
  { name: "Escaladora", sets: 4, reps: "2 min", restSec: 90, tier: 2 },
  { name: "Elíptica por intervalos", sets: 5, reps: "2 min", restSec: 90, tier: 1 },
  { name: "Bicicleta de aire", sets: 5, reps: "90 s", restSec: 90, tier: 2 },
  { name: "Caminata rápida por bloques", sets: 5, reps: "3 min", restSec: 90, tier: 0 },
];

const PLIO: Exercise[] = [
  { name: "Salto al cajón", sets: 5, reps: "5", restSec: 90, tier: 0 },
  { name: "Salto amplio horizontal", sets: 4, reps: "4", restSec: 90, tier: 0 },
  { name: "Salto en profundidad (drop jump)", sets: 4, reps: "5", restSec: 100, tier: 1 },
  { name: "Skipping alto", sets: 4, reps: "20 s", restSec: 60, tier: 0 },
  { name: "Movilidad de cadera 90/90", sets: 3, reps: "8 por lado", restSec: 45, tier: 0 },
  { name: "Sentadilla con salto", sets: 4, reps: "6", restSec: 80, tier: 0 },
  { name: "Lanzamiento de balón medicinal al suelo", sets: 5, reps: "6", restSec: 70, tier: 1 },
];

const LOW_IMPACT: Exercise[] = [
  { name: "Empuje de trineo", sets: 6, reps: "20 m", restSec: 75, tier: 3 },
  { name: "Step-up explosivo al cajón bajo", sets: 4, reps: "8 por pierna", restSec: 75, loadFactor: 0.15, tier: 0 },
  { name: "Lanzamiento de balón medicinal al frente", sets: 5, reps: "6", restSec: 70, tier: 1 },
  { name: "Movilidad de cadera 90/90", sets: 3, reps: "8 por lado", restSec: 45, tier: 0 },
  { name: "Puente de glúteo con banda", sets: 3, reps: "15", restSec: 45, tier: 0 },
  { name: "Remo ergómetro potente", sets: 5, reps: "20 s", restSec: 70, tier: 1 },
];

const SPORT_WORK: Record<Exclude<SportId, "ninguno">, Exercise[]> = {
  futbol: [
    { name: "Sentadilla búlgara", sets: 4, reps: "8 por pierna", restSec: 90, loadFactor: 0.25, tier: 0 },
    { name: "Nórdico de isquios", sets: 4, reps: "6", restSec: 90, tier: 0 },
    { name: "Cambios de dirección en conos", sets: 6, reps: "15 s", restSec: 60, tier: 0 },
    { name: "Aductores en polea", sets: 3, reps: "12", restSec: 60, loadFactor: 0.12, tier: 2 },
  ],
  tenis: [
    { name: "Rotación de tronco en polea", sets: 4, reps: "10 por lado", restSec: 60, loadFactor: 0.18, tier: 2 },
    { name: "Lanzamiento de balón medicinal lateral", sets: 5, reps: "6", restSec: 75, tier: 1 },
    { name: "Desplazamiento lateral con banda", sets: 4, reps: "20 s", restSec: 60, tier: 0 },
    { name: "Rotadores externos de hombro", sets: 3, reps: "15", restSec: 45, loadFactor: 0.05, tier: 0 },
  ],
  voleibol: [
    { name: "Salto vertical con contramovimiento", sets: 6, reps: "4", restSec: 90, tier: 0 },
    { name: "Sentadilla con salto", sets: 4, reps: "5", restSec: 90, loadFactor: 0.3, tier: 1 },
    { name: "Press por encima de la cabeza", sets: 4, reps: "8", restSec: 90, loadFactor: 0.45, tier: 1 },
    { name: "Manguito rotador con banda", sets: 3, reps: "15", restSec: 45, tier: 0 },
  ],
  basquetbol: [
    { name: "Hip thrust", sets: 4, reps: "8", restSec: 100, loadFactor: 0.9, tier: 1 },
    { name: "Salto a una pierna", sets: 5, reps: "5 por lado", restSec: 80, tier: 0 },
    { name: "Paso lateral defensivo con banda", sets: 4, reps: "25 s", restSec: 60, tier: 0 },
    { name: "Core anti-rotación en polea", sets: 3, reps: "10 por lado", restSec: 45, loadFactor: 0.12, tier: 2 },
  ],
  running: [
    { name: "Zancadas caminando", sets: 4, reps: "10 por pierna", restSec: 80, loadFactor: 0.2, tier: 0 },
    { name: "Elevación de gemelo a una pierna", sets: 4, reps: "15", restSec: 60, tier: 0 },
    { name: "Puente de isquios a una pierna", sets: 3, reps: "12", restSec: 60, tier: 0 },
  ],
  natacion: [
    { name: "Pull-over en polea", sets: 4, reps: "12", restSec: 70, loadFactor: 0.3, tier: 2 },
    { name: "Dominadas asistidas", sets: 4, reps: "8", restSec: 90, tier: 1 },
    { name: "Hollow hold", sets: 3, reps: "30 s", restSec: 45, tier: 0 },
  ],
  ciclismo: [
    { name: "Sentadilla frontal", sets: 4, reps: "8", restSec: 110, loadFactor: 0.75, tier: 1 },
    { name: "Step-up al cajón", sets: 4, reps: "10 por pierna", restSec: 80, loadFactor: 0.25, tier: 0 },
    { name: "Plancha lateral", sets: 3, reps: "40 s", restSec: 45, tier: 0 },
  ],
  boxeo: [
    { name: "Press de banca explosivo", sets: 5, reps: "3", restSec: 120, loadFactor: 0.55, tier: 1 },
    { name: "Lanzamiento de balón al suelo", sets: 5, reps: "8", restSec: 70, tier: 1 },
    { name: "Cuello y trapecio con banda", sets: 3, reps: "15", restSec: 45, tier: 0 },
  ],
};

function cardioFor(goal: GoalId, gym: GymId, week: number): Session {
  if (goal === "bajar_peso" || goal === "recomposicion")
    return {
      day: "",
      title: "CARDIO HIIT",
      method: "hiit",
      focus: "Quema y capacidad",
      minutes: 26,
      exercises: pick(HIIT, gym, 3, week),
    };
  if (goal === "resistencia")
    return {
      day: "",
      title: "INTERVALOS",
      method: "cardio_intervalos",
      focus: "Motor aeróbico",
      minutes: 38,
      exercises: pick(INTERVALOS, gym, 2, week),
    };
  return {
    day: "",
    title: "CARDIO LISS",
    method: "liss",
    focus: "Recuperación activa",
    minutes: 35,
    exercises: [{ name: "Caminata inclinada", sets: 1, reps: "35 min", restSec: 0, tier: 0 }],
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
  sportActivity?:
    | { minutes: number; timesPerWeek: number; intensity: "baja" | "media" | "alta" }
    | undefined;
  bodyWeight: number;
  daysPerWeek: number;
  reminderTime: string;
  reminderDays: number[];
  /** gym equipment available */
  gym?: GymId | undefined;
  sex?: "hombre" | "mujer" | undefined;
  age?: number | undefined;
  height?: number | undefined;
  neck?: number | undefined;
  waist?: number | undefined;
  hip?: number | undefined;
  known?:
    | {
        bodyFat?: number | undefined;
        water?: number | undefined;
        muscleMass?: number | undefined;
        visceral?: number | undefined;
        bmi?: number | undefined;
      }
    | undefined;
};


/** Builds the weekly plan from the profile. Week 4, 8, 12... become deload weeks. */
export function buildPlan(profile: Profile, week = 1): Session[] {
  const { goal, level, sport, daysPerWeek } = profile;
  const gym: GymId = profile.gym ?? "completo";
  const bias = bodyBias(profile);
  const isDeload = week > 0 && week % 4 === 0;
  const method = hypertrophyMethod(level, goal);
  const sessions: Session[] = [];

  // Volumen semanal por músculo basado en evidencia (Schoenfeld 2017, Krieger 2010,
  // Israetel MEV–MAV): ~10 series iniciando, ~14 intermedio, ~18 avanzado,
  // repartido en frecuencia 2x/semana y máx. ~10 series por músculo por sesión.
  const weeklySets = level === "iniciando" ? 10 : level === "intermedio" ? 14 : 18;
  const strengthDays =
    daysPerWeek <= 2 ? 2 : daysPerWeek === 3 ? 3 : daysPerWeek - 1;
  const perMuscle = (freq: number) =>
    Math.max(1, Math.min(3, Math.round(weeklySets / freq / 3.5)));
  const vol = (freq: number) =>
    `≈${Math.round(weeklySets / freq)} series/músculo hoy · ${weeklySets}/semana`;
  const split = (anchors: Exercise[], acc: Exercise[], n: number, off = 0) => {
    const a = bias.heavyFocus ? n + 1 : n;
    const c = bias.heavyFocus ? Math.max(1, n - 1) : n;
    return [...pick(anchors, gym, a, week, off), ...pick(acc, gym, c, week, off)];
  };

  const fullBody = (title: string, off: number, freq: number): Session => {
    const n = perMuscle(freq) >= 2 && level === "avanzado" ? 2 : 1;
    return {
      day: "",
      title,
      method: level === "iniciando" ? "piramidal" : off % 2 ? "piramidal_inverso" : method,
      focus: `Cuerpo completo · ${vol(freq)}`,
      minutes: 55,
      exercises: [
        ...pick(LEGS.anchors, gym, n, week, off),
        ...pick(PUSH.anchors, gym, n, week, off),
        ...pick(PULL.anchors, gym, n, week, off),
        ...pick(SHOULDERS.acc, gym, 1, week, off),
        ...pick(FULLBODY.acc, gym, 1, week, off),
      ],
    };
  };
  const upper = (title: string, off: number, freq: number): Session => {
    const n = Math.min(2, perMuscle(freq));
    return {
      day: "",
      title,
      method,
      focus: `Torso · ${vol(freq)}`,
      minutes: 58,
      exercises: [
        ...pick(PUSH.anchors, gym, n, week, off),
        ...pick(PULL.anchors, gym, n, week, off),
        ...pick(SHOULDERS.acc, gym, 1, week, off),
        ...pick(PUSH.acc, gym, 1, week, off),
        ...pick(PULL.acc, gym, 1, week, off),
      ],
    };
  };
  const lower = (title: string, off: number, freq: number): Session => ({
    day: "",
    title,
    method: goal === "fuerza" ? "piramidal" : level === "iniciando" ? "piramidal" : "gvt",
    focus: `Pierna · ${vol(freq)}`,
    minutes: 58,
    exercises: split(LEGS.anchors, LEGS.acc, perMuscle(freq) + 1, off + 2),
  });
  const push = (off: number, freq: number): Session => ({
    day: "", title: "PECHO · HOMBRO · TRÍCEPS", method, focus: `Empuje · ${vol(freq)}`, minutes: 58,
    exercises: [...split(PUSH.anchors, PUSH.acc, perMuscle(freq), off), ...pick(SHOULDERS.acc, gym, 1, week, off)],
  });
  const pull = (off: number, freq: number): Session => ({
    day: "", title: "ESPALDA · BÍCEPS", method: level === "avanzado" ? "cluster" : "piramidal",
    focus: `Tirón · ${vol(freq)}`, minutes: 58,
    exercises: split(PULL.anchors, PULL.acc, perMuscle(freq), off + 1),
  });

  let strength: Session[];
  if (strengthDays === 2) strength = [fullBody("CUERPO COMPLETO A", 0, 2), fullBody("CUERPO COMPLETO B", 3, 2)];
  else if (strengthDays === 3)
    strength = [fullBody("CUERPO COMPLETO A", 0, 3), fullBody("CUERPO COMPLETO B", 3, 3), fullBody("CUERPO COMPLETO C", 6, 3)];
  else if (strengthDays === 4)
    strength = [upper("TORSO A", 0, 2), lower("PIERNA A", 0, 2), upper("TORSO B", 3, 2), lower("PIERNA B", 3, 2)];
  else if (strengthDays === 5)
    strength = [push(0, 2), pull(0, 2), lower("PIERNA A", 0, 2), upper("TORSO", 3, 2), lower("PIERNA B", 3, 2)];
  else
    strength = [push(0, 2), pull(0, 2), lower("PIERNA A", 0, 2), push(3, 2), pull(3, 2), lower("PIERNA B", 3, 2)];
  if (daysPerWeek === 3) strength = strength.slice(0, 2).map((s) => ({ ...s, focus: s.focus.replace(/≈\d+/, `≈${Math.round(weeklySets / 2)}`) }));
  sessions.push(...strength);
  sessions.push(cardioFor(goal, gym, week));

  if (bias.extraMetabolic && goal !== "bajar_peso" && goal !== "recomposicion") {
    sessions.push({
      day: "",
      title: "BLOQUE METABÓLICO",
      method: "hiit",
      focus: "Grasa y condición",
      minutes: 24,
      exercises: pick(bias.lowImpact ? LOW_IMPACT : HIIT, gym, 3, week, 2),
    });
  }

  if (daysPerWeek >= 5 || goal === "movilidad") {
    sessions.push({
      day: "",
      title: bias.lowImpact ? "POTENCIA BAJO IMPACTO" : "PLIOMETRÍA",
      method: "pliometria",
      focus: "Potencia y movilidad",
      minutes: 40,
      exercises: pick(bias.lowImpact ? LOW_IMPACT : PLIO, gym, 4, week),
    });
  }

  if (sport !== "ninguno") {
    sessions.push({
      day: "",
      title: `ESPECÍFICO ${SPORTS.find((s) => s.id === sport)!.label.toUpperCase()}`,
      method: "sport",
      focus: "Transferencia deportiva",
      minutes: 45,
      exercises: availableIn(SPORT_WORK[sport], gym),
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
