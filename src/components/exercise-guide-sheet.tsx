import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Label } from "@/components/ui-kit";
import { guideFor, loadLine, videoSearchUrl } from "@/lib/exercise-guide";
import { findExerciseVideo } from "@/lib/video.functions";
import type { Exercise } from "@/lib/training";

export function ExerciseGuideSheet({
  exercise,
  kg,
  onClose,
  beginner = false,
}: {
  exercise: Exercise;
  kg: number;
  beginner?: boolean;
  onClose: () => void;
}) {
  const guide = guideFor(exercise.name);
  const fetchVideo = useServerFn(findExerciseVideo);
  const video = useQuery({
    queryKey: ["video", exercise.name],
    queryFn: () => fetchVideo({ data: { name: exercise.name } }),
    staleTime: Infinity,
  });

  const intro = useQuery({
    queryKey: ["video-intro", exercise.name],
    queryFn: () => fetchVideo({ data: { name: exercise.name, kind: "principiante" } }),
    staleTime: Infinity,
    enabled: beginner,
  });

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

        <div className="mt-4 overflow-hidden rounded-2xl bg-bg/60">
          <div className="relative aspect-video w-full">
            {video.isLoading ? (
              <div className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
                Cargando video…
              </div>
            ) : video.data?.id ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${video.data.id}?rel=0&playsinline=1`}
                title={`Video: ${exercise.name}`}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center px-4 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
                Video no disponible
              </div>
            )}
          </div>
          <a
            href={videoSearchUrl(exercise.name)}
            target="_blank"
            rel="noreferrer"
            className="block px-4 py-2 font-mono text-[9px] uppercase tracking-[0.15em] text-flame"
          >
            ▸ Ver más videos de este ejercicio
          </a>
        </div>

        {beginner && (
          <div className="mt-5">
            <Label className="mb-1">Si eres nuevo: explicación paso a paso</Label>
            <p className="mb-2 text-[12px] text-mute">
              Qué máquina o implemento usar, cómo ajustarlo y cómo moverte.
            </p>
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-bg/60">
              {intro.isLoading ? (
                <div className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
                  Cargando video…
                </div>
              ) : intro.data?.id && intro.data.id !== video.data?.id ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${intro.data.id}?rel=0&playsinline=1`}
                  title={`Explicación para principiantes: ${exercise.name}`}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center px-4 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
                  Mira el video de arriba
                </div>
              )}
            </div>
          </div>
        )}

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
