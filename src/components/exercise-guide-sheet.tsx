import { useEffect } from "react";
import { Label } from "@/components/ui-kit";
import { guideFor, loadLine, videoSearchUrl } from "@/lib/exercise-guide";
import type { Exercise } from "@/lib/training";

export function ExerciseGuideSheet({
  exercise,
  kg,
  onClose,
}: {
  exercise: Exercise;
  kg: number;
  onClose: () => void;
}) {
  const guide = guideFor(exercise.name);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div className="relative z-10 max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-[32px] bg-card p-5 ring-1 ring-black/40">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-mute/40" />
        <Label className="tracking-[0.18em]">{guide.family}</Label>
        <h2 className="mt-1 font-display text-[22px] leading-none tracking-tight text-balance">
          {exercise.name.toUpperCase()}
        </h2>
        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-flame">
          {loadLine(exercise, kg)}
        </div>

        <a
          href={videoSearchUrl(exercise.name)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center gap-3 rounded-2xl bg-bg/60 px-4 py-3"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full chip-active">
            <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
          </span>
          <span>
            <span className="block font-display text-[15px] tracking-tight">VER VIDEO DEMOSTRATIVO</span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
              Ejecución y técnica en video
            </span>
          </span>
        </a>

        <div className="mt-5">
          <Label className="mb-2">Cómo se ejecuta</Label>
          <ol className="space-y-2">
            {guide.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-ink/90">
                <span className="font-display text-[13px] text-flame">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-5">
          <Label className="mb-2">Errores comunes</Label>
          <ul className="space-y-1.5">
            {guide.errors.map((e, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-mute">
                <span className="text-flame">·</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 grid gap-2">
          <div className="rounded-2xl bg-bg/60 px-4 py-3">
            <Label className="text-[9px] tracking-[0.15em]">Cargas</Label>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/90">{guide.loadTip}</p>
          </div>
          <div className="rounded-2xl bg-bg/60 px-4 py-3">
            <Label className="text-[9px] tracking-[0.15em]">Ritmo</Label>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/90">{guide.tempo}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl chip py-3 font-display text-[14px] tracking-[0.1em] text-ink"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}
