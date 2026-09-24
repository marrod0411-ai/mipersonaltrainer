import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UA = { "Accept-Language": "es-ES,es;q=0.9", "User-Agent": "Mozilla/5.0" };

async function searchIds(query: string, sp = ""): Promise<string[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${sp ? `&sp=${sp}` : ""}`;
  const html = await (await fetch(url, { headers: UA })).text();
  const ids = [...html.matchAll(/"videoId":"([\w-]{11})"/g)].map((m) => m[1]!);
  return [...new Set(ids)].slice(0, 10);
}

// oEmbed returns 401/403/404 for videos whose owner disabled embedding, private or removed.
async function isEmbeddable(id: string): Promise<boolean> {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
      { headers: UA },
    );
    return r.ok;
  } catch {
    return false;
  }
}

async function firstEmbeddable(ids: string[]): Promise<string | null> {
  const checks = await Promise.all(ids.map(async (id) => ((await isEmbeddable(id)) ? id : null)));
  return checks.find(Boolean) ?? null;
}

export const findExerciseVideo = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ name: z.string().min(1).max(120), kind: z.enum(["tecnica", "principiante"]).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const q =
      data.kind === "principiante"
        ? `${data.name} cómo se hace explicación para principiantes máquina gimnasio`
        : `${data.name} técnica correcta ejecución gym`;
    try {
      // 1) Prefer Creative Commons videos (free to reuse), 2) then any embeddable video.
      const cc = await searchIds(q, "EgIwAQ%3D%3D");
      const ccHit = await firstEmbeddable(cc.slice(0, 6));
      if (ccHit) return { id: ccHit as string | null };
      const all = await searchIds(q);
      return { id: (await firstEmbeddable(all)) as string | null };
    } catch {
      return { id: null as string | null };
    }
  });
