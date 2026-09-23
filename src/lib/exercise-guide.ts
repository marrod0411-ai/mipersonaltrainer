import type { Exercise } from "./training";

export type Guide = {
  /** short family name shown as subtitle */
  family: string;
  /** step by step execution */
  steps: string[];
  /** common mistakes */
  errors: string[];
  /** how to pick and progress the load */
  loadTip: string;
  /** tempo guidance */
  tempo: string;
};

type Rule = { keys: string[]; guide: Guide };

const RULES: Rule[] = [
  {
    keys: ["sentadilla", "hack", "prensa", "zancada", "bulgara", "búlgara", "step", "pistol", "goblet"],
    guide: {
      family: "Pierna · patrón de empuje",
      steps: [
        "Pies al ancho de hombros, puntas ligeramente afuera y peso repartido en todo el pie.",
        "Saca pecho, aprieta abdomen y baja controlando hasta que el muslo quede paralelo o un poco más abajo.",
        "Rodillas en línea con los pies, sin que se vayan hacia dentro.",
        "Sube empujando el piso con el talón y medio pie, sin bloquear de golpe la rodilla arriba.",
      ],
      errors: [
        "Levantar los talones o pasar todo el peso a la punta.",
        "Redondear la espalda baja en el fondo del movimiento.",
        "Bajar rebotando en vez de frenar el descenso.",
      ],
      loadTip:
        "Empieza con la carga sugerida y súbela 2.5 a 5 kg cuando completes todas las series con buena técnica y aún te queden 1 o 2 repeticiones en el tanque.",
      tempo: "2 segundos bajando · 1 de pausa abajo · subida firme",
    },
  },
  {
    keys: ["peso muerto", "rumano", "femoral", "hip thrust", "gluteo", "glúteo", "buenos dias", "buenos días", "puente"],
    guide: {
      family: "Cadena posterior",
      steps: [
        "Barra o carga pegada al cuerpo, hombros atrás y espalda recta desde el inicio.",
        "Lleva la cadera hacia atrás como si cerraras una puerta con los glúteos.",
        "Baja hasta sentir tensión en la parte de atrás del muslo, sin perder la curva natural de la espalda.",
        "Sube apretando glúteos y terminando con la cadera completamente extendida.",
      ],
      errors: [
        "Convertirlo en sentadilla doblando demasiado la rodilla.",
        "Alejar la carga del cuerpo y cargar la espalda baja.",
        "Hiperextender la espalda al final en vez de apretar glúteo.",
      ],
      loadTip:
        "Es un ejercicio de mucha carga pero poca tolerancia a fallar la técnica: sube el peso solo si la espalda se mantiene recta en todas las repeticiones.",
      tempo: "3 segundos bajando · subida potente sin tirón",
    },
  },
  {
    keys: ["press banca", "press inclinado", "press declinado", "press pecho", "pecho", "apertura", "cruce", "pec", "fondo", "flexion", "flexión", "push up"],
    guide: {
      family: "Empuje horizontal · pecho",
      steps: [
        "Escápulas juntas y hacia abajo, pecho arriba y pies firmes en el piso.",
        "Codos a unos 45 a 60 grados del torso, nunca totalmente abiertos.",
        "Baja controlando hasta sentir estiramiento en el pecho, sin rebotar.",
        "Empuja pensando en juntar el pecho, no en estirar el brazo.",
      ],
      errors: [
        "Despegar hombros de la banca o perder la retracción escapular.",
        "Bajar la carga con los codos totalmente abiertos (riesgo de hombro).",
        "Bloquear el codo y descansar arriba en cada repetición.",
      ],
      loadTip:
        "En pecho el salto seguro es de 2.5 kg por lado. Si la última serie baja más de 3 repeticiones respecto a la primera, la carga está muy alta.",
      tempo: "2 segundos bajando · 1 de pausa · empuje explosivo",
    },
  },
  {
    keys: ["jalon", "jalón", "dominada", "remo", "pulldown", "pullover", "espalda", "polea baja", "face pull"],
    guide: {
      family: "Tirón · espalda",
      steps: [
        "Antes de tirar, baja los hombros y lleva las escápulas atrás.",
        "Tira con el codo, imaginando que la mano solo es un gancho.",
        "Lleva la carga hasta tocar o casi tocar el cuerpo y aprieta 1 segundo.",
        "Regresa controlando y estirando la espalda sin soltar la tensión.",
      ],
      errors: [
        "Usar impulso de espalda baja o balancear el torso.",
        "Tirar con bíceps y antebrazo en vez de espalda.",
        "Soltar la carga de golpe en la fase de regreso.",
      ],
      loadTip:
        "Si no logras apretar 1 segundo al final del recorrido, baja la carga: en espalda el rango completo vale más que el peso.",
      tempo: "1 segundo tirando · 1 apretando · 2 regresando",
    },
  },
  {
    keys: ["press militar", "hombro", "elevacion lateral", "elevación lateral", "posterior", "arnold", "encogimiento", "trapecio", "landmine"],
    guide: {
      family: "Hombro y trapecio",
      steps: [
        "Abdomen apretado y costillas abajo para no arquear la espalda.",
        "En press, sube en línea con la oreja y baja hasta la barbilla o el mentón.",
        "En elevaciones, sube hasta la altura del hombro con el codo un poco más alto que la mano.",
        "Controla el regreso: el hombro se construye bajando, no subiendo.",
      ],
      errors: [
        "Arquear la espalda baja para poder empujar más peso.",
        "Subir por encima del hombro en elevaciones laterales (entra trapecio).",
        "Usar balanceo de cadera en cada repetición.",
      ],
      loadTip:
        "Hombro es un músculo pequeño: sube 1 a 2.5 kg por vez y prioriza series de 12 a 20 repeticiones limpias.",
      tempo: "1 segundo subiendo · 2 a 3 bajando",
    },
  },
  {
    keys: ["curl", "biceps", "bíceps", "martillo", "predicador", "concentrado"],
    guide: {
      family: "Bíceps",
      steps: [
        "Codos pegados al costado y fijos: solo se mueve el antebrazo.",
        "Sube apretando el bíceps hasta el tope del recorrido.",
        "Aprieta 1 segundo arriba sin dejar caer el codo hacia adelante.",
        "Baja lento hasta estirar por completo el brazo.",
      ],
      errors: [
        "Balancear el torso para lanzar la carga.",
        "No estirar el brazo abajo y perder la mitad del ejercicio.",
        "Subir los hombros al final de la serie.",
      ],
      loadTip:
        "Si necesitas impulso para la primera repetición, la carga sobra. Progresa con repeticiones antes que con peso.",
      tempo: "1 segundo subiendo · 1 apretando · 3 bajando",
    },
  },
  {
    keys: ["tricep", "tríceps", "copa", "patada", "fondos banco", "rompecraneos", "rompecráneos", "extension polea", "extensión polea"],
    guide: {
      family: "Tríceps",
      steps: [
        "Fija el codo al costado o arriba según la variante y no lo muevas.",
        "Estira por completo el brazo y aprieta 1 segundo.",
        "Regresa controlando hasta sentir estiramiento, sin abrir el codo.",
        "Mantén muñeca firme y alineada con el antebrazo.",
      ],
      errors: [
        "Mover el codo hacia adelante y atrás en cada repetición.",
        "Usar el peso del cuerpo para bajar la polea.",
        "No estirar del todo el brazo al final.",
      ],
      loadTip:
        "Trabaja en 10 a 15 repeticiones. Sube la carga solo cuando llegues a la última serie sin perder el bloqueo final.",
      tempo: "1 segundo estirando · 2 regresando",
    },
  },
  {
    keys: ["gemelo", "pantorrilla", "soleo", "sóleo"],
    guide: {
      family: "Gemelo",
      steps: [
        "Talón por debajo del escalón o plataforma para estirar al máximo.",
        "Sube lo más alto posible sobre la punta del pie.",
        "Aprieta 1 a 2 segundos arriba.",
        "Baja muy lento hasta el estiramiento completo.",
      ],
      errors: ["Rebotar sin rango", "Doblar la rodilla para ayudarse", "Series demasiado rápidas"],
      loadTip:
        "El gemelo aguanta carga alta pero necesita rango completo: prioriza 15 a 25 repeticiones con pausa arriba.",
      tempo: "1 subiendo · 2 arriba · 3 bajando",
    },
  },
  {
    keys: ["plancha", "abdomen", "crunch", "rueda", "elevacion piernas", "elevación piernas", "core", "pallof", "hollow"],
    guide: {
      family: "Core",
      steps: [
        "Costillas abajo y pelvis ligeramente recogida: la espalda baja no se arquea.",
        "Respira sin soltar la tensión del abdomen.",
        "Mueve solo el tramo que trabaja el ejercicio, sin usar impulso.",
        "Termina la serie cuando pierdas la posición, no cuando duela.",
      ],
      errors: [
        "Tirar del cuello con las manos.",
        "Arquear la espalda baja en elevaciones de piernas.",
        "Aguantar la respiración toda la serie.",
      ],
      loadTip: "Progresa aumentando tiempo o rango antes de añadir peso.",
      tempo: "Movimiento lento y continuo",
    },
  },
  {
    keys: ["salto", "pliometr", "box", "bound", "sprint", "escalera", "cono", "lanzamiento", "balon medicinal", "balón medicinal"],
    guide: {
      family: "Pliometría y potencia",
      steps: [
        "Calienta tobillo, rodilla y cadera antes de cualquier salto.",
        "Aterriza suave, con rodilla flexionada y pie completo.",
        "Prioriza calidad: cada repetición debe ser al 100 % de intención.",
        "Descansa completo entre series; la potencia se entrena descansado.",
      ],
      errors: [
        "Hacer muchas repeticiones seguidas y perder la explosividad.",
        "Aterrizar con rodillas rígidas o hacia dentro.",
        "Entrenar potencia al final de la sesión ya fatigado.",
      ],
      loadTip:
        "Sin carga externa: la progresión es más altura, más distancia o menos tiempo de contacto con el piso.",
      tempo: "Explosivo · contacto corto con el piso",
    },
  },
  {
    keys: ["hiit", "intervalo", "cinta", "bici", "eliptic", "elíptic", "remo ergo", "escalera mecanica", "escaladora", "cuerda", "trote", "caminata", "nado", "liss"],
    guide: {
      family: "Cardio",
      steps: [
        "5 minutos de calentamiento progresivo antes del primer intervalo.",
        "En los tramos fuertes sube a un esfuerzo de 8 a 9 sobre 10.",
        "En los tramos suaves no te detengas: sigue en movimiento ligero.",
        "Cierra con 3 a 5 minutos suaves para bajar pulsaciones.",
      ],
      errors: [
        "Arrancar demasiado fuerte y no completar los intervalos.",
        "Recuperar totalmente parado entre intervalos.",
        "Saltarse el enfriamiento.",
      ],
      loadTip:
        "Progresa subiendo velocidad, inclinación o resistencia antes de alargar la sesión.",
      tempo: "Intervalos marcados con el cronómetro de descanso",
    },
  },
  {
    keys: ["movilidad", "estiramiento", "cat", "gato", "cadera 90", "world", "thoracic", "toracica", "torácica"],
    guide: {
      family: "Movilidad",
      steps: [
        "Busca el rango sin dolor y respira profundo en cada posición.",
        "Mantén la postura activa: no te cuelgues de la articulación.",
        "Gana centímetros con cada respiración, no forzando de golpe.",
        "Trabaja ambos lados el mismo tiempo.",
      ],
      errors: ["Rebotar en el estiramiento", "Aguantar la respiración", "Forzar hasta el dolor"],
      loadTip: "Sin carga: progresa con más rango y más control.",
      tempo: "20 a 40 segundos por posición",
    },
  },
];

const FALLBACK: Guide = {
  family: "Técnica general",
  steps: [
    "Colócate firme, abdomen apretado y hombros en posición antes de mover la carga.",
    "Haz el recorrido completo del ejercicio, sin acortarlo para mover más peso.",
    "Controla la fase de regreso: ahí está la mayor parte del estímulo.",
    "Mantén la misma técnica en la primera y en la última repetición.",
  ],
  errors: [
    "Usar impulso del cuerpo para completar repeticiones.",
    "Acortar el rango cuando llega la fatiga.",
    "Subir la carga antes de dominar el movimiento.",
  ],
  loadTip:
    "Sube la carga cuando completes todas las series del rango indicado dejando 1 o 2 repeticiones de margen.",
  tempo: "2 segundos bajando · subida controlada",
};

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function guideFor(name: string): Guide {
  const n = norm(name);
  for (const rule of RULES) {
    if (rule.keys.some((k) => n.includes(norm(k)))) return rule.guide;
  }
  return FALLBACK;
}

/** Search URL with a demo video of the exercise (Spanish technique videos). */
export function videoSearchUrl(name: string) {
  const q = `${name} técnica correcta ejecución gym`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function loadLine(ex: Exercise, kg: number) {
  if (!kg) return `Sin carga externa · ${ex.reps} repeticiones`;
  return `${kg} kg × ${ex.reps} repeticiones · descanso ${ex.restSec}s`;
}
