import type { GoalId, LevelId, Profile } from "./training";

export type SexId = "hombre" | "mujer";

export type BodyInput = {
  sex?: SexId | undefined;
  age?: number | undefined;
  height?: number | undefined; // cm
  neck?: number | undefined; // cm
  waist?: number | undefined; // cm
  hip?: number | undefined; // cm (mujer)
  bodyWeight: number; // kg
};

export type KnownMetrics = {
  bodyFat?: number | undefined; // %
  water?: number | undefined; // %
  muscleMass?: number | undefined; // kg o %
  visceral?: number | undefined;
  bmi?: number | undefined;
};

export type BodyReadout = {
  bmi: number | null;
  bmiLabel: string;
  bodyFat: number | null;
  bodyFatSource: "medido" | "cintura y cuello" | null;
  bodyFatLabel: string;
  leanMass: number | null;
  water: number | null;
  waterTargetMl: number;
  bmr: number | null;
  tdee: number | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  notes: string[];
};

const log10 = (n: number) => Math.log(n) / Math.LN10;

export function bmiOf(weight: number, heightCm?: number) {
  if (!heightCm || heightCm < 100) return null;
  const m = heightCm / 100;
  return Math.round((weight / (m * m)) * 10) / 10;
}

export function bmiLabelOf(bmi: number | null) {
  if (bmi === null) return "Sin estatura";
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 25) return "Peso normal";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidad";
}

/** US Navy tape method. Returns % body fat or null when measurements are missing. */
export function navyBodyFat(b: BodyInput) {
  const { sex, height, neck, waist, hip } = b;
  if (!sex || !height || !neck || !waist) return null;
  if (sex === "hombre") {
    if (waist - neck <= 0) return null;
    const v =
      495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450;
    return clampPct(v);
  }
  if (!hip) return null;
  const sum = waist + hip - neck;
  if (sum <= 0) return null;
  const v = 495 / (1.29579 - 0.35004 * log10(sum) + 0.221 * log10(height)) - 450;
  return clampPct(v);
}

function clampPct(v: number) {
  if (!Number.isFinite(v)) return null;
  return Math.round(Math.min(65, Math.max(3, v)) * 10) / 10;
}

export function bodyFatLabelOf(bf: number | null, sex?: SexId) {
  if (bf === null) return "Faltan medidas";
  const ranges: [number, string][] =
    sex === "mujer"
      ? [
          [16, "Muy bajo (atleta)"],
          [21, "Atlético"],
          [25, "Fitness"],
          [32, "Promedio"],
          [100, "Alto"],
        ]
      : [
          [8, "Muy bajo (competición)"],
          [13, "Atlético"],
          [18, "Fitness"],
          [25, "Promedio"],
          [100, "Alto"],
        ];
  return ranges.find(([max]) => bf < max)![1];
}

const ACTIVITY: Record<number, number> = {
  3: 1.45,
  4: 1.55,
  5: 1.65,
  6: 1.72,
};

const CAL_ADJUST: Record<GoalId, number> = {
  bajar_peso: -0.2,
  masa_muscular: 0.1,
  mantener: 0,
  subir_peso: 0.15,
  recomposicion: -0.1,
  fuerza: 0.08,
  resistencia: 0,
  deporte: 0.05,
  movilidad: 0,
};

const PROTEIN_PER_KG: Record<GoalId, number> = {
  bajar_peso: 2.2,
  masa_muscular: 2,
  mantener: 1.8,
  subir_peso: 1.9,
  recomposicion: 2.2,
  fuerza: 2,
  resistencia: 1.7,
  deporte: 1.9,
  movilidad: 1.7,
};

export function analyzeBody(
  b: BodyInput,
  known: KnownMetrics | undefined,
  goal: GoalId,
  level: LevelId,
  daysPerWeek: number,
  sportDaily = 0,
): BodyReadout {
  const weight = b.bodyWeight;
  const bmi = known?.bmi ?? bmiOf(weight, b.height);
  const measured = known?.bodyFat && known.bodyFat > 0 ? known.bodyFat : null;
  const tape = navyBodyFat(b);
  const bodyFat = measured ?? tape;
  const leanMass = bodyFat ? Math.round(weight * (1 - bodyFat / 100) * 10) / 10 : null;

  let bmr: number | null = null;
  if (leanMass) bmr = Math.round(370 + 21.6 * leanMass);
  else if (b.height && b.age && b.sex)
    bmr = Math.round(
      10 * weight + 6.25 * b.height - 5 * b.age + (b.sex === "hombre" ? 5 : -161),
    );

  const factor = ACTIVITY[Math.min(6, Math.max(3, daysPerWeek))] ?? 1.55;
  const tdee = bmr ? Math.round(bmr * factor + sportDaily) : null;
  const calories = tdee ? Math.round((tdee * (1 + CAL_ADJUST[goal])) / 10) * 10 : null;

  let protein: number | null = null;
  let fat: number | null = null;
  let carbs: number | null = null;
  if (calories) {
    protein = Math.round((leanMass ?? weight) * PROTEIN_PER_KG[goal]);
    fat = Math.round((calories * 0.25) / 9);
    carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  }

  const notes: string[] = [];
  const highFat = bodyFat !== null && bodyFat >= (b.sex === "mujer" ? 30 : 22);
  const lowFat = bodyFat !== null && bodyFat <= (b.sex === "mujer" ? 20 : 12);

  if (bodyFat === null)
    notes.push(
      "Agrega estatura, cuello y cintura (y cadera si eres mujer) para estimar tu grasa corporal.",
    );
  if (highFat)
    notes.push(
      "Tu grasa está por encima del rango fitness: sumo un bloque de cardio metabólico y más trabajo en circuito.",
    );
  if (lowFat && (goal === "masa_muscular" || goal === "subir_peso"))
    notes.push(
      "Estás delgado: priorizo carga pesada y series básicas antes del trabajo de bombeo.",
    );
  if (bmi !== null && bmi >= 30)
    notes.push("Con tu IMC evito impacto alto: cambio saltos por potencia de bajo impacto.");
  if (known?.water && known.water < 55)
    notes.push("Tu porcentaje de agua está bajo: sube líquidos y sodio/potasio antes de entrenar.");
  if (known?.muscleMass)
    notes.push("Uso tu masa muscular medida para calcular calorías con mayor precisión.");
  if (level === "iniciando")
    notes.push("Nivel inicial: técnica primero, la carga sube 2% por semana.");

  return {
    bmi,
    bmiLabel: bmiLabelOf(bmi),
    bodyFat,
    bodyFatSource: bodyFat === null ? null : measured ? "medido" : "cintura y cuello",
    bodyFatLabel: bodyFatLabelOf(bodyFat, b.sex),
    leanMass,
    water: known?.water ?? null,
    waterTargetMl: Math.round(weight * 35),
    bmr,
    tdee,
    calories,
    protein,
    fat,
    carbs,
    notes,
  };
}

export function readoutFor(profile: Profile) {
  return analyzeBody(
    {
      sex: profile.sex,
      age: profile.age,
      height: profile.height,
      neck: profile.neck,
      waist: profile.waist,
      hip: profile.hip,
      bodyWeight: profile.bodyWeight,
    },
    profile.known,
    profile.goal,
    profile.level,
    profile.daysPerWeek,
    sportActivityOf(profile)?.daily ?? 0,
  );
}

/** Training bias derived from body composition, used to tune the weekly plan. */
export function bodyBias(profile: Profile) {
  const r = readoutFor(profile);
  const female = profile.sex === "mujer";
  return {
    extraMetabolic: r.bodyFat !== null && r.bodyFat >= (female ? 30 : 22),
    lowImpact: (r.bmi ?? 0) >= 30,
    heavyFocus: r.bodyFat !== null && r.bodyFat <= (female ? 20 : 12),
    readout: r,
  };
}
