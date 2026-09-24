import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Chip, FlameButton, Label, Screen, TabBar } from "@/components/ui-kit";
import { POST_KINDS, currentQuarter } from "@/lib/community";
import { useLog } from "@/lib/store";

export const Route = createFileRoute("/comunidad")({
  head: () => ({
    meta: [
      { title: "Comunidad — Mi Personal Trainer" },
      { name: "description", content: "Comparte tu inicio, tu progreso y tus fotos con otros atletas. Premios cada trimestre." },
      { property: "og:title", content: "Comunidad — Mi Personal Trainer" },
      { property: "og:description", content: "Comparte tu progreso y gana el premio al atleta del trimestre." },
    ],
  }),
  component: Community,
});

type Post = {
  id: string;
  user_id: string;
  kind: string;
  body: string;
  photo_url: string | null;
  plan_week: number | null;
  created_at: string;
};

function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? null;
      let admin = false;
      if (id) {
        const { data: r } = await supabase.rpc("has_role", { _user_id: id, _role: "admin" });
        admin = !!r;
      }
      return { id, admin };
    },
  });
}

function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      const list = (posts ?? []) as Post[];
      const ids = list.map((p) => p.id);
      const [comments, likes] = await Promise.all([
        ids.length ? supabase.from("comments").select("*").in("post_id", ids).order("created_at") : { data: [] },
        ids.length ? supabase.from("likes").select("*").in("post_id", ids) : { data: [] },
      ]);
      const userIds = [
        ...new Set([...list.map((p) => p.user_id), ...(comments.data ?? []).map((c) => c.user_id)]),
      ];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, display_name, country").in("id", userIds)
        : { data: [] };
      const paths = list.map((p) => p.photo_url).filter((x): x is string => !!x);
      const { data: signed } = paths.length
        ? await supabase.storage.from("community").createSignedUrls(paths, 3600)
        : { data: [] };
      const urls = Object.fromEntries((signed ?? []).map((s) => [s.path, s.signedUrl]));
      const names = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      return { posts: list, comments: comments.data ?? [], likes: likes.data ?? [], names, urls };
    },
  });
}

function Community() {
  const [tab, setTab] = useState<"feed" | "ranking">("feed");
  return (
    <Screen>
      <header className="px-5 pb-4 pt-7 rise">
        <div className="font-display text-[11px] tracking-[0.25em] text-flame">COMUNIDAD</div>
        <h1 className="font-display text-[30px] leading-none tracking-tight">ENTRENAMOS JUNTOS</h1>
        <div className="mt-4 flex gap-2">
          <Chip active={tab === "feed"} onClick={() => setTab("feed")} className="flex-1 text-center font-display text-[13px]">
            PUBLICACIONES
          </Chip>
          <Chip active={tab === "ranking"} onClick={() => setTab("ranking")} className="flex-1 text-center font-display text-[13px]">
            RANKING Y PREMIOS
          </Chip>
        </div>
      </header>
      {tab === "feed" ? <Feed /> : <Ranking />}
      <TabBar />
    </Screen>
  );
}

function Composer() {
  const qc = useQueryClient();
  const { log } = useLog();
  const [kind, setKind] = useState<string>("progreso");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const publish = async () => {
    if (!body.trim() && !file) return;
    setBusy(true);
    setErr(null);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    let photo: string | null = null;
    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${u.user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("community").upload(path, file);
      if (error) {
        setErr("No se pudo subir la foto (máximo 8 MB).");
        setBusy(false);
        return;
      }
      photo = path;
    }
    await supabase.from("posts").insert({
      user_id: u.user.id,
      kind,
      body: body.trim(),
      photo_url: photo,
      plan_week: log.week,
    });
    setBody("");
    setFile(null);
    setBusy(false);
    void qc.invalidateQueries({ queryKey: ["feed"] });
  };

  return (
    <Card>
      <Label className="mb-2">Comparte con la comunidad</Label>
      <div className="flex gap-1.5">
        {POST_KINDS.map((k) => (
          <Chip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)} className="flex-1 px-2 py-1.5 text-center font-display text-[11px]">
            {k.label.toUpperCase()}
          </Chip>
        ))}
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={600}
        rows={3}
        placeholder={kind === "inicio" ? "¡Hoy empiezo mi plan! Mi meta es…" : "Llevo X semanas y estos son mis resultados…"}
        className="mt-3 w-full resize-none rounded-2xl bg-bg/60 px-4 py-3 text-[14px] text-ink outline-none placeholder:text-mute/60"
      />
      <label className="mt-2 block cursor-pointer rounded-2xl chip px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink">
        {file ? `📷 ${file.name}` : "📷 Agregar foto"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      {err && <p className="mt-2 text-[12px] text-flame">{err}</p>}
      <FlameButton className={`mt-3 ${busy ? "opacity-60" : ""}`} onClick={publish}>
        {busy ? "PUBLICANDO…" : "PUBLICAR"}
      </FlameButton>
    </Card>
  );
}

function Feed() {
  const feed = useFeed();
  const me = useMe();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["feed"] });

  return (
    <div className="space-y-4 px-5 pb-10">
      <Composer />
      {feed.isLoading && <p className="text-center font-mono text-[10px] uppercase text-mute">Cargando…</p>}
      {feed.data?.posts.length === 0 && (
        <p className="text-center text-[13px] text-mute">Sé el primero en publicar.</p>
      )}
      {feed.data?.posts.map((p) => {
        const author = feed.data.names[p.user_id];
        const likes = feed.data.likes.filter((l) => l.post_id === p.id);
        const liked = likes.some((l) => l.user_id === me.data?.id);
        const comments = feed.data.comments.filter((c) => c.post_id === p.id);
        return (
          <PostCard
            key={p.id}
            post={p}
            authorName={author?.display_name ?? "Atleta"}
            country={author?.country ?? null}
            photo={p.photo_url ? feed.data.urls[p.photo_url] : undefined}
            likeCount={likes.length}
            liked={liked}
            comments={comments.map((c) => ({ ...c, name: feed.data.names[c.user_id]?.display_name ?? "Atleta" }))}
            canDelete={me.data?.admin || me.data?.id === p.user_id}
            meId={me.data?.id ?? null}
            isAdmin={!!me.data?.admin}
            onChange={refresh}
          />
        );
      })}
    </div>
  );
}

function PostCard(props: {
  post: Post;
  authorName: string;
  country: string | null;
  photo: string | undefined;
  likeCount: number;
  liked: boolean;
  comments: { id: string; body: string; name: string; user_id: string }[];
  canDelete: boolean | undefined;
  meId: string | null;
  isAdmin: boolean;
  onChange: () => void;
}) {
  const { post: p } = props;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const kind = POST_KINDS.find((k) => k.id === p.kind)?.label ?? "";

  const toggleLike = async () => {
    if (!props.meId) return;
    if (props.liked) await supabase.from("likes").delete().eq("post_id", p.id).eq("user_id", props.meId);
    else await supabase.from("likes").insert({ post_id: p.id, user_id: props.meId });
    props.onChange();
  };
  const comment = async () => {
    if (!text.trim() || !props.meId) return;
    await supabase.from("comments").insert({ post_id: p.id, user_id: props.meId, body: text.trim().slice(0, 400) });
    setText("");
    props.onChange();
  };
  const remove = async () => {
    if (!confirm("¿Borrar esta publicación?")) return;
    await supabase.from("posts").delete().eq("id", p.id);
    props.onChange();
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-[16px] tracking-tight">{props.authorName.toUpperCase()}</div>
          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
            {props.country ? `${props.country} · ` : ""}
            {new Date(p.created_at).toLocaleDateString("es")}
            {p.plan_week ? ` · Semana ${p.plan_week}` : ""}
          </div>
        </div>
        <span className="rounded-full chip px-2.5 py-1 font-mono text-[9px] uppercase text-flame">{kind}</span>
      </div>
      {p.body && <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-ink/90">{p.body}</p>}
      {props.photo && <img src={props.photo} alt={`Foto de ${props.authorName}`} className="mt-3 w-full rounded-2xl object-cover" loading="lazy" />}
      <div className="mt-3 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.12em]">
        <button type="button" onClick={toggleLike} className={props.liked ? "text-flame" : "text-mute"}>
          {props.liked ? "♥" : "♡"} {props.likeCount}
        </button>
        <button type="button" onClick={() => setOpen(!open)} className="text-mute">
          💬 {props.comments.length} comentarios
        </button>
        {props.canDelete && (
          <button type="button" onClick={remove} className="ml-auto text-mute">
            Borrar
          </button>
        )}
      </div>
      {open && (
        <div className="mt-3 space-y-2">
          {props.comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-2 rounded-xl bg-bg/60 px-3 py-2 text-[13px]">
              <span>
                <b className="font-semibold">{c.name}</b> {c.body}
              </span>
              {(props.isAdmin || c.user_id === props.meId) && (
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.from("comments").delete().eq("id", c.id);
                    props.onChange();
                  }}
                  className="font-mono text-[9px] text-mute"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && comment()}
              placeholder="Escribe un comentario…"
              className="flex-1 rounded-xl bg-bg/60 px-3 py-2 text-[13px] text-ink outline-none"
            />
            <Chip onClick={comment} className="px-3 font-display text-[12px]">ENVIAR</Chip>
          </div>
        </div>
      )}
    </Card>
  );
}

function Ranking() {
  const q = currentQuarter();
  const me = useMe();
  const qc = useQueryClient();
  const board = useQuery({
    queryKey: ["board", q.label],
    queryFn: async () => {
      const { data } = await supabase.rpc("community_leaderboard", {
        _from: q.from.toISOString(),
        _to: q.to.toISOString(),
      });
      return data ?? [];
    },
  });
  const awards = useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const { data } = await supabase.from("awards").select("*").order("created_at", { ascending: false }).limit(30);
      const ids = [...new Set((data ?? []).map((a) => a.user_id))];
      const { data: prof } = ids.length
        ? await supabase.from("profiles").select("id, display_name, country").in("id", ids)
        : { data: [] };
      const names = Object.fromEntries((prof ?? []).map((p) => [p.id, p]));
      return (data ?? []).map((a) => ({ ...a, name: names[a.user_id]?.display_name ?? "Atleta", country: names[a.user_id]?.country }));
    },
  });

  const award = async (userId: string) => {
    if (!confirm(`¿Premiar a este atleta como ganador del ${q.label}?`)) return;
    await supabase.from("awards").insert({ user_id: userId, quarter: q.label });
    void qc.invalidateQueries({ queryKey: ["awards"] });
  };

  return (
    <div className="space-y-4 px-5 pb-10">
      <Card>
        <Label>Premio al atleta del trimestre · {q.label}</Label>
        <p className="mt-2 text-[13px] leading-relaxed text-mute">
          Cada tres meses premiamos a los más activos: publicaciones, comentarios, apoyo recibido y
          sesiones completadas. ¡Sube tu foto inicial y tu foto final para comparar tu progreso!
        </p>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-mute">
          Publicación 5 pts · Sesión 3 · Comentario 2 · Me gusta recibido 1
        </p>
      </Card>

      <div>
        <Label className="mb-2">Ranking actual</Label>
        {board.data?.length === 0 && <p className="text-[13px] text-mute">Aún no hay actividad este trimestre.</p>}
        <div className="space-y-2">
          {board.data?.map((r, i) => (
            <div key={r.user_id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3">
              <div className={`font-display text-[22px] ${i < 3 ? "text-flame" : "text-mute"}`}>{i + 1}</div>
              <div className="flex-1">
                <div className="font-display text-[15px] tracking-tight">{r.display_name.toUpperCase()}</div>
                <div className="font-mono text-[9px] uppercase text-mute">
                  {r.country ?? ""} · {r.posts} pub · {r.comments} com · {r.likes} ♥ · {r.sessions} ses
                </div>
              </div>
              <div className="font-display text-[18px]">{r.score}</div>
              {me.data?.admin && (
                <Chip onClick={() => award(r.user_id)} className="px-2 py-1 font-display text-[10px]">
                  PREMIAR
                </Chip>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2">Ganadores</Label>
        {awards.data?.length === 0 && <p className="text-[13px] text-mute">Los primeros ganadores se anuncian al cierre del trimestre.</p>}
        <div className="space-y-2">
          {awards.data?.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
              <div>
                <div className="font-display text-[15px]">🏆 {a.name.toUpperCase()}</div>
                <div className="font-mono text-[9px] uppercase text-mute">{a.title} · {a.quarter}{a.country ? ` · ${a.country}` : ""}</div>
              </div>
              {me.data?.admin && (
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.from("awards").delete().eq("id", a.id);
                    void qc.invalidateQueries({ queryKey: ["awards"] });
                  }}
                  className="font-mono text-[9px] text-mute"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
