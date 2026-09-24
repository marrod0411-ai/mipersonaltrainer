import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const findExerciseVideo = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ name: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const q = encodeURIComponent(`${data.name} técnica correcta ejecución gym`);
    try {
      const res = await fetch(`https://www.youtube.com/results?search_query=${q}`, {
        headers: { "Accept-Language": "es-ES,es;q=0.9", "User-Agent": "Mozilla/5.0" },
      });
      const html = await res.text();
      const m = html.match(/"videoId":"([\w-]{11})"/);
      return { id: m ? m[1]! : null };
    } catch {
      return { id: null as string | null };
    }
  });
