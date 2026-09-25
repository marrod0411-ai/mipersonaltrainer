import type { Exercise } from "./training";

export type InjuryArea =
  | "rodilla"
  | "espalda_baja"
  | "cervical"
  | "hombro"
  | "codo"
  | "muneca"
  | "cadera"
  | "tobillo";

export type InjuryStatus = "actual" | "pasada";

export type Injuries = {
  items: { area: InjuryArea; status: InjuryStatus }[];
  notes: string;
};

type AreaInfo = {
  id: InjuryArea;
  label: string;
  examples: string;
  /** exercises that load the area in a risky way */
  risky: RegExp;
  /** strengthening / prevention work for the area */
  prehab: Exercise[];
};

const p = (name: string, reps: string): Exercise => ({ name, sets: 2, reps, restSec: 45, tier: 0 });

export const INJURY_AREAS: AreaInfo[] = [
  {
    id: "rodilla",
    label: "Rodilla",
    examples: "Ligamentos (LCA, meniscos), tendinitis, dolor al bajar",
    risky:
      /salto|sprint|burpee|zancada|búlgara|sentadilla trasera|sentadilla frontal|hack squat|profundidad|extensión unilateral de cuádriceps|skipping|cambios de dirección|cuerda doble|nórdico/i,
    prehab: [
      p("Sentadilla isométrica en pared", "30-40 s"),
      p("Extensión terminal de rodilla con banda", "15"),
      p("Puente de glúteo con banda", "15"),
    ],
  },
  {
    id: "espalda_baja",
    label: "Espalda baja / lumbar",
    examples: "Hernia discal, lumbalgia, ciática",
    risky:
      /peso muerto convencional|peso muerto sumo|peso muerto rumano$|sentadilla trasera|sentadilla frontal|remo con barra|pendlay|press militar de pie|burpee|profundidad|trineo|rueda abdominal|colgado|encogimientos con barra|zancadas caminando con barra/i,
    prehab: [
      p("Bird dog", "10 por lado"),
      p("Dead bug", "10 por lado"),
      p("Plancha lateral", "20-30 s"),
    ],
  },
  {
    id: "cervical",
    label: "Cuello / columna cervical",
    examples: "Cervicalgia, hernia cervical, contracturas",
    risky: /tras nuca|encogimientos|cuello|press militar de pie|sentadilla trasera|colgado/i,
    prehab: [
      p("Retracción cervical (doble mentón)", "12"),
      p("Face pull con banda ligera", "15"),
    ],
  },
  {
    id: "hombro",
    label: "Hombro",
    examples: "Manguito rotador, luxación, pinzamiento",
    risky:
      /tras nuca|fondos|^press banca$|press militar|por encima de la cabeza|pull-over|agarre prono ancho|jalón al pecho agarre ancho|aperturas|elevación frontal|battle rope|balón medicinal al suelo|balón al suelo|banca explosivo|press inclinado con barra/i,
    prehab: [
      p("Rotación externa de hombro con banda", "15"),
      p("Y-T-W en banco inclinado", "8 cada letra"),
      p("Deslizamientos en pared (wall slides)", "12"),
    ],
  },
  {
    id: "codo",
    label: "Codo",
    examples: "Epicondilitis (codo de tenista/golfista)",
    risky: /press francés|fondos|extensión sobre la cabeza|curl con barra recta|dominadas agarre supino/i,
    prehab: [
      p("Extensión excéntrica de muñeca con mancuerna ligera", "15"),
      p("Pronación y supinación con mancuerna", "12"),
    ],
  },
  {
    id: "muneca",
    label: "Muñeca / mano",
    examples: "Túnel carpiano, esguince de muñeca, fracturas",
    risky: /flexiones|curl con barra recta|press francés|burpee|rueda abdominal|sentadilla frontal|plancha con lastre/i,
    prehab: [
      p("Flexión y extensión de muñeca con banda", "15"),
      p("Apretar pelota o grip", "20"),
    ],
  },
  {
    id: "cadera",
    label: "Cadera",
    examples: "Pinzamiento, bursitis, dolor de ingle",
    risky: /sumo|zancada|búlgara|aductores|profundidad|sentadilla con salto|salto amplio|cambios de dirección/i,
    prehab: [
      p("Movilidad de cadera 90/90", "8 por lado"),
      p("Clamshell (almeja) con banda", "15 por lado"),
      p("Puente de glúteo a una pierna", "10 por lado"),
    ],
  },
  {
    id: "tobillo",
    label: "Tobillo / pie",
    examples: "Esguinces, tendón de Aquiles, fascitis plantar",
    risky: /salto|sprint|skipping|cuerda|burpee|cambios de dirección|zancadas caminando|paso lateral|gemelo a una pierna|cinta curva/i,
    prehab: [
      p("Equilibrio a una pierna", "30 s por lado"),
      p("Elevación de talones excéntrica lenta", "12"),
      p("Movilidad de tobillo en pared", "10 por lado"),
    ],
  },
];

export const areaInfo = (id: InjuryArea) => INJURY_AREAS.find((a) => a.id === id)!;

export function isRisky(ex: Exercise, inj?: Injuries): boolean {
  if (!inj?.items.length) return false;
  return inj.items.some((i) => areaInfo(i.area).risky.test(ex.name));
}

/** One prevention exercise per affected area, rotating by week/session. */
export function prehabFor(inj: Injuries | undefined, seed: number): Exercise[] {
  if (!inj?.items.length) return [];
  return inj.items.map((i, k) => {
    const list = areaInfo(i.area).prehab;
    return list[(seed + k) % list.length]!;
  });
}
