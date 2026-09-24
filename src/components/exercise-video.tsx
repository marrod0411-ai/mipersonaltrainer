import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { findExerciseVideo } from "@/lib/video.functions";
import { videoSearchUrl } from "@/lib/exercise-guide";

export function ExerciseVideo({ name, kind = "tecnica" }: { name: string; kind?: "tecnica" | "principiante" }) {
  const fetchVideo = useServerFn(findExerciseVideo);
  const video = useQuery({
    queryKey: [kind === "tecnica" ? "video" : "video-intro", name],
    queryFn: () => fetchVideo({ data: { name, kind } }),
    staleTime: Infinity,
  });
  return (
    <div className="overflow-hidden rounded-2xl bg-bg/60">
      <div className="relative aspect-video w-full">
        {video.isLoading ? (
          <div className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
            Cargando video…
          </div>
        ) : video.data?.id ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${video.data.id}?rel=0&playsinline=1&modestbranding=1`}
            title={`Video: ${name}`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <a
            href={videoSearchUrl(name)}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 grid place-items-center px-4 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-flame"
          >
            ▶ Ver video en YouTube
          </a>
        )}
      </div>
    </div>
  );
}
