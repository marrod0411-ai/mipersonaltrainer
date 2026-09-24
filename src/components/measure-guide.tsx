import { useState } from "react";

const TIPS: { title: string; steps: string[]; only?: "mujer" }[] = [
  {
    title: "Antes de medir",
    steps: [
      "Usa una cinta métrica flexible (de costura), no metálica.",
      "Mide en la mañana, en ayunas y después de ir al baño.",
      "Párate derecho, pies juntos, sin ropa gruesa y respira normal.",
      "La cinta debe quedar pegada a la piel, sin apretar ni hundirla, y paralela al piso.",
      "Mide 2 veces y usa el promedio.",
    ],
  },
  {
    title: "Estatura",
    steps: [
      "Descalzo, espalda y talones contra la pared, mirando al frente.",
      "Pon un libro plano sobre tu cabeza, marca la pared y mide del piso a la marca.",
    ],
  },
  {
    title: "Cuello",
    steps: [
      "Justo debajo de la nuez (manzana de Adán), con la cinta inclinada un poco hacia abajo por delante.",
      "Mira al frente, hombros relajados; no bajes la cabeza.",
    ],
  },
  {
    title: "Cintura",
    steps: [
      "Hombres: a la altura del ombligo.",
      "Mujeres: en la parte más estrecha, entre las costillas y el ombligo.",
      "Mide al final de una exhalación normal, sin meter el abdomen.",
    ],
  },
  {
    title: "Cadera",
    only: "mujer",
    steps: ["En la parte más ancha de los glúteos, con los pies juntos.", "Mírate de lado en un espejo para asegurar que la cinta esté recta."],
  },
];

export function MeasureGuide({ sex }: { sex?: string | undefined }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-2xl bg-bg/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-flame"
      >
        <span>📏 ¿Cómo tomo mis medidas?</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4">
          {TIPS.filter((t) => !t.only || t.only === sex).map((t) => (
            <div key={t.title}>
              <div className="font-display text-[13px] tracking-tight text-ink">{t.title.toUpperCase()}</div>
              <ul className="mt-1 space-y-1">
                {t.steps.map((s) => (
                  <li key={s} className="flex gap-2 text-[12px] leading-relaxed text-mute">
                    <span className="text-flame">·</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[11px] leading-relaxed text-mute">
            Con estas medidas calculamos tu grasa aproximada (método de la Marina de EE. UU.). Si tienes un examen de
            bioimpedancia, usa esos datos: son más precisos.
          </p>
        </div>
      )}
    </div>
  );
}
