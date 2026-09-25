import images from "@/lib/exercise-images.json";
import { guideFor } from "@/lib/exercise-guide";

const MAP = images as Record<string, string>;

export function exerciseSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Own 3-step demo image (inicio / mitad / final) with key technique tips. */
export function ExerciseVideo({ name }: { name: string; kind?: "tecnica" | "principiante" }) {
  const url = MAP[exerciseSlug(name)];
  const g = guideFor(name);
  const phases = ["Inicio", "Mitad", "Final"];
  return (
    <div className="overflow-hidden rounded-2xl bg-bg/60">
      {url ? (
        <img
          src={url}
          alt={`${name}: posición inicial, mitad y final del movimiento`}
          loading="lazy"
          className="block w-full"
        />
      ) : (
        <div className="grid aspect-video place-items-center px-4 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
          Imagen en preparación
        </div>
      )}
      <div className="grid grid-cols-3 gap-px bg-black/30">
        {phases.map((p, i) => (
          <div key={p} className="bg-card px-2 py-2">
            <div className="font-display text-[11px] tracking-[0.12em] text-flame">
              {i + 1} · {p.toUpperCase()}
            </div>
            <p className="mt-1 text-[11px] leading-snug text-ink/85">{g.steps[i] ?? g.steps[g.steps.length - 1]}</p>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
        Ritmo: {g.tempo}
      </div>
    </div>
  );
}
