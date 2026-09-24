import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Chip, FlameButton, Label, Screen, TabBar } from "@/components/ui-kit";
import { POST_KINDS, VISIBILITY, currentQuarter } from "@/lib/community";
import { useLog } from "@/lib/store";

export const Route = createFileRoute("/comunidad")({
  head: () => ({
    meta: [
      { title: "Comunidad — Mi Personal Trainer" },
      { name: "description", content: "Comparte tu progreso, únete al reto trimestral y gana premios con criterios transparentes." },
      { property: "og:title", content: "Comunidad — Mi Personal Trainer" },
      { property: "og:description", content: "Retos trimestrales, ranking transparente y fotos de progreso con privacidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
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
  visibility: string;
  hidden: boolean;
};

const KIND_LABEL: Record<string, string> = {
  ...Object.fromEntries(POST_KINDS.map((k) => [k.id, k.label])),
  anuncio: "🏆 Anuncio",
};

const REASONS = ["Contenido sexual o desnudos", "Acoso u ofensas", "Spam o publicidad", "Información falsa o peligrosa", "Otro"];

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

async function namesFor(ids: string[]) {
  const { data } = ids.length
    ? await supabase.from("profiles").select("id, display_name, country").in("id", ids)
    : { data: [] };
  return Object.fromEntries((data ?? []).map((p) => [p.id, p]));
}

function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: async () => {
      const { data: posts } = await supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50);
      const list = (posts ?? []) as Post[];
      const ids = list.map((p) => p.id);
      const [comments, likes] = await Promise.all([
        ids.length ? supabase.from("comments").select("*").in("post_id", ids).order("created_at") : { data: [] },
        ids.length ? supabase.from("likes").select("*").in("post_id", ids) : { data: [] },
      ]);
      const names = await namesFor([
        ...new Set([...list.map((p) => p.user_id), ...(comments.data ?? []).map((c) => c.user_id)]),
      ]);
      const paths = list.map((p) => p.photo_url).filter((x): x is string => !!x);
      const { data: signed } = paths.length
        ? await supabase.storage.from("community").createSignedUrls(paths, 3600)
        : { data: [] };
      const urls = Object.fromEntries((signed ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl]));
      return { posts: list, comments: comments.data ?? [], likes: likes.data ?? [], names, urls };
    },
  });
}

type Tab = "feed" | "reto" | "moderacion";

function Community() {
  const [tab, setTab] = useState<Tab>("feed");
  const me = useMe();
  return (
    <Screen>
      <header className="px-5 pb-4 pt-7 rise">
        <div className="font-display text-[11px] tracking-[0.25em] text-flame">COMUNIDAD</div>
        <h1 className="font-display text-[30px] leading-none tracking-tight">ENTRENAMOS JUNTOS</h1>
        <div className="mt-4 flex gap-2">
          <Chip active={tab === "feed"} onClick={() => setTab("feed")} className="flex-1 text-center font-display text-[12px]">
            PUBLICACIONES
          </Chip>
          <Chip active={tab === "reto"} onClick={() => setTab("reto")} className="flex-1 text-center font-display text-[12px]">
            RETO Y PREMIOS
          </Chip>
          {me.data?.admin && (
            <Chip active={tab === "moderacion"} onClick={() => setTab("moderacion")} className="px-3 text-center font-display text-[12px]">
              MODERAR
            </Chip>
          )}
        </div>
      </header>
      {tab === "feed" ? <Feed /> : tab === "reto" ? <Challenge /> : <Moderation />}
      <TabBar />
    </Screen>
  );
}

function VisibilityPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="mb-1.5 mt-3 text-[9px]">¿Quién puede ver esta publicación?</Label>
      <div className="flex gap-1.5">
        {VISIBILITY.map((v) => (
          <Chip key={v.id} active={value === v.id} onClick={() => onChange(v.id)} className="flex-1 px-2 py-1.5 text-center font-display text-[10px]">
            {v.label.toUpperCase()}
          </Chip>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] text-mute">{VISIBILITY.find((v) => v.id === value)?.help}</p>
    </div>
  );
}

function Composer() {
  const qc = useQueryClient();
  const { log } = useLog();
  const [kind, setKind] = useState<string>("progreso");
  const [visibility, setVisibility] = useState("todos");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const publish = async () => {
    if (!body.trim() && !file) return;
    setBusy(true);
    setErr(null);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return setBusy(false);
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
    await supabase.from("posts").insert({ user_id: u.user.id, kind, body: body.trim(), photo_url: photo, plan_week: log.week, visibility });
    setBody("");
    setFile(null);
    setBusy(false);
    void qc.invalidateQueries({ queryKey: ["feed"] });
    void qc.invalidateQueries({ queryKey: ["my-photos"] });
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
      <VisibilityPicker value={visibility} onChange={setVisibility} />
      {err && <p className="mt-2 text-[12px] text-flame">{err}</p>}
      <FlameButton className={`mt-3 ${busy ? "opacity-60" : ""}`} onClick={publish}>
        {busy ? "PUBLICANDO…" : "PUBLICAR"}
      </FlameButton>
    </Card>
  );
}

function ReportSheet({ target, onClose }: { target: { postId?: string; commentId?: string }; onClose: () => void }) {
  const [reason, setReason] = useState(REASONS[0]!);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const send = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("reports").insert({
      reporter_id: u.user.id,
      post_id: target.postId ?? null,
      comment_id: target.commentId ?? null,
      reason,
      details: details.trim().slice(0, 400),
    });
    setSent(true);
  };
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default" />
      <div className="relative z-10 w-full max-w-[430px] rounded-t-[32px] bg-card p-5">
        {sent ? (
          <>
            <div className="font-display text-[20px]">GRACIAS POR AVISAR</div>
            <p className="mt-2 text-[13px] text-mute">El equipo revisará el reporte. Tu identidad no se muestra a quien publicó.</p>
            <FlameButton className="mt-4" onClick={onClose}>LISTO</FlameButton>
          </>
        ) : (
          <>
            <div className="font-display text-[20px]">REPORTAR {target.commentId ? "COMENTARIO" : "PUBLICACIÓN"}</div>
            <div className="mt-3 space-y-1.5">
              {REASONS.map((r) => (
                <Chip key={r} active={reason === r} onClick={() => setReason(r)} className="w-full text-left text-[13px]">
                  {r}
                </Chip>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={2}
              maxLength={400}
              placeholder="Detalles (opcional)"
              className="mt-3 w-full resize-none rounded-2xl bg-bg/60 px-4 py-3 text-[13px] text-ink outline-none"
            />
            <FlameButton className="mt-3" onClick={send}>ENVIAR REPORTE</FlameButton>
          </>
        )}
      </div>
    </div>
  );
}

function Feed() {
  const feed = useFeed();
  const me = useMe();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["feed"] });
  const [report, setReport] = useState<{ postId?: string; commentId?: string } | null>(null);

  return (
    <div className="space-y-4 px-5 pb-10">
      <Composer />
      {feed.isLoading && <p className="text-center font-mono text-[10px] uppercase text-mute">Cargando…</p>}
      {feed.data?.posts.length === 0 && <p className="text-center text-[13px] text-mute">Sé el primero en publicar.</p>}
      {feed.data?.posts.map((p) => {
        const author = feed.data.names[p.user_id];
        const likes = feed.data.likes.filter((l) => l.post_id === p.id);
        return (
          <PostCard
            key={p.id}
            post={p}
            authorName={author?.display_name ?? "Atleta"}
            country={author?.country ?? null}
            photo={p.photo_url ? feed.data.urls[p.photo_url] : undefined}
            likeCount={likes.length}
            liked={likes.some((l) => l.user_id === me.data?.id)}
            comments={feed.data.comments
              .filter((c) => c.post_id === p.id)
              .map((c) => ({ ...c, name: feed.data.names[c.user_id]?.display_name ?? "Atleta" }))}
            meId={me.data?.id ?? null}
            isAdmin={!!me.data?.admin}
            onChange={refresh}
            onReport={setReport}
          />
        );
      })}
      {report && <ReportSheet target={report} onClose={() => setReport(null)} />}
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
  meId: string | null;
  isAdmin: boolean;
  onChange: () => void;
  onReport: (t: { postId?: string; commentId?: string }) => void;
}) {
  const { post: p } = props;
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [editPrivacy, setEditPrivacy] = useState(false);
  const mine = props.meId === p.user_id;

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
  const setVisibility = async (v: string) => {
    await supabase.from("posts").update({ visibility: v }).eq("id", p.id);
    props.onChange();
  };
  const vis = VISIBILITY.find((v) => v.id === p.visibility);

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
        <span className="rounded-full chip px-2.5 py-1 font-mono text-[9px] uppercase text-flame">{KIND_LABEL[p.kind] ?? ""}</span>
      </div>
      {(mine || props.isAdmin) && (p.visibility !== "todos" || p.hidden) && (
        <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-flame">
          {p.hidden ? "⚠ Oculta por moderación" : `🔒 ${vis?.label}`}
        </div>
      )}
      {p.body && <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-ink/90">{p.body}</p>}
      {props.photo && <img src={props.photo} alt={`Foto de ${props.authorName}`} className="mt-3 w-full rounded-2xl object-cover" loading="lazy" />}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em]">
        <button type="button" onClick={toggleLike} className={props.liked ? "text-flame" : "text-mute"}>
          {props.liked ? "♥" : "♡"} {props.likeCount}
        </button>
        <button type="button" onClick={() => setOpen(!open)} className="text-mute">
          💬 {props.comments.length}
        </button>
        <div className="ml-auto flex gap-3">
          {mine && (
            <button type="button" onClick={() => setEditPrivacy(!editPrivacy)} className="text-mute">
              Privacidad
            </button>
          )}
          {!mine && (
            <button type="button" onClick={() => props.onReport({ postId: p.id })} className="text-mute">
              Reportar
            </button>
          )}
          {(mine || props.isAdmin) && (
            <button type="button" onClick={remove} className="text-mute">
              Borrar
            </button>
          )}
        </div>
      </div>
      {editPrivacy && <VisibilityPicker value={p.visibility} onChange={setVisibility} />}
      {open && (
        <div className="mt-3 space-y-2">
          {props.comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-2 rounded-xl bg-bg/60 px-3 py-2 text-[13px]">
              <span>
                <b className="font-semibold">{c.name}</b> {c.body}
              </span>
              <div className="flex shrink-0 gap-2 font-mono text-[9px] text-mute">
                {c.user_id !== props.meId && (
                  <button type="button" onClick={() => props.onReport({ commentId: c.id })}>
                    ⚑
                  </button>
                )}
                {(props.isAdmin || c.user_id === props.meId) && (
                  <button
                    type="button"
                    onClick={async () => {
                      await supabase.from("comments").delete().eq("id", c.id);
                      props.onChange();
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
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

const CRITERIA = [
  { k: "Sesiones completadas en el trimestre", pts: "3 pts c/u (máx. 60)" },
  { k: "Publicaciones", pts: "5 pts c/u (máx. 30)" },
  { k: "Comentarios de apoyo", pts: "2 pts c/u (máx. 50)" },
  { k: "Me gusta recibidos", pts: "1 pt c/u (máx. 100)" },
  { k: "Foto inicial + foto de progreso", pts: "+30 pts" },
];

function Challenge() {
  const q = currentQuarter();
  const me = useMe();
  const qc = useQueryClient();
  const [picks, setPicks] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const joined = useQuery({
    queryKey: ["joined", q.label, me.data?.id],
    enabled: !!me.data?.id,
    queryFn: async () => {
      const { data } = await supabase.from("challenge_participants").select("user_id").eq("quarter", q.label);
      return { count: data?.length ?? 0, me: !!data?.some((d) => d.user_id === me.data?.id) };
    },
  });
  const board = useQuery({
    queryKey: ["challenge-board", q.label],
    queryFn: async () => {
      const { data } = await supabase.rpc("challenge_leaderboard", { _quarter: q.label, _from: q.from.toISOString(), _to: q.to.toISOString() });
      return data ?? [];
    },
  });
  const awards = useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const { data } = await supabase.from("awards").select("*").order("created_at", { ascending: false }).limit(30);
      const names = await namesFor([...new Set((data ?? []).map((a) => a.user_id))]);
      return (data ?? []).map((a) => ({ ...a, name: names[a.user_id]?.display_name ?? "Atleta", country: names[a.user_id]?.country }));
    },
  });

  const toggleJoin = async () => {
    if (!me.data?.id) return;
    if (joined.data?.me) {
      if (!confirm("¿Salir del reto de este trimestre?")) return;
      await supabase.from("challenge_participants").delete().eq("user_id", me.data.id).eq("quarter", q.label);
    } else {
      await supabase.from("challenge_participants").insert({ user_id: me.data.id, quarter: q.label });
    }
    void qc.invalidateQueries({ queryKey: ["joined"] });
    void qc.invalidateQueries({ queryKey: ["challenge-board"] });
  };

  const togglePick = (id: string) =>
    setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));

  const announce = async () => {
    if (!picks.length || !me.data?.id) return;
    if (!confirm(`¿Anunciar ${picks.length} ganador(es) del ${q.label}? Todos lo verán en publicaciones.`)) return;
    setBusy(true);
    const rows = board.data ?? [];
    const titles = ["Atleta del trimestre", "2º lugar", "3º lugar"];
    await supabase.from("awards").insert(
      picks.map((uid, i) => ({ user_id: uid, quarter: q.label, place: i + 1, title: titles[i]!, announcement: message.trim() })),
    );
    const list = picks
      .map((uid, i) => `${["🥇", "🥈", "🥉"][i]} ${rows.find((r) => r.user_id === uid)?.display_name ?? "Atleta"}`)
      .join("\n");
    await supabase.from("posts").insert({
      user_id: me.data.id,
      kind: "anuncio",
      visibility: "todos",
      body: `GANADORES DEL RETO ${q.label}\n\n${list}${message.trim() ? `\n\n${message.trim()}` : ""}`,
    });
    setPicks([]);
    setMessage("");
    setBusy(false);
    void qc.invalidateQueries({ queryKey: ["awards"] });
    void qc.invalidateQueries({ queryKey: ["feed"] });
  };

  const daysLeft = Math.max(0, Math.ceil((q.to.getTime() - Date.now()) / 86400000));
  const byQuarter = new Map<string, NonNullable<typeof awards.data>>();
  for (const a of awards.data ?? []) byQuarter.set(a.quarter, [...(byQuarter.get(a.quarter) ?? []), a]);

  return (
    <div className="space-y-4 px-5 pb-10">
      <Card>
        <Label>Reto trimestral · {q.label}</Label>
        <div className="mt-1 font-display text-[22px] leading-none tracking-tight">TRANSFÓRMATE EN 90 DÍAS</div>
        <p className="mt-2 text-[13px] leading-relaxed text-mute">
          Únete, publica tu foto inicial y, al final, tu foto de progreso. Quedan {daysLeft} días · {joined.data?.count ?? 0} participantes.
        </p>
        <FlameButton className="mt-3" onClick={toggleJoin}>
          {joined.data?.me ? "✓ PARTICIPANDO · SALIR" : "UNIRME AL RETO"}
        </FlameButton>
      </Card>

      <Card>
        <Label className="mb-2">Cómo se calcula el puntaje</Label>
        <div className="space-y-1.5">
          {CRITERIA.map((c) => (
            <div key={c.k} className="flex justify-between gap-3 text-[13px]">
              <span className="text-ink/90">{c.k}</span>
              <span className="shrink-0 font-mono text-[10px] text-flame">{c.pts}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-mute">
          Solo cuenta la actividad dentro del trimestre. Los topes evitan publicar por publicar. El jurado elige a los
          ganadores entre los primeros puestos revisando también el cambio entre la foto inicial y la final. Las fotos
          marcadas "Solo jurado" solo las ve el equipo.
        </p>
      </Card>

      <div>
        <Label className="mb-2">Clasificación</Label>
        {board.data?.length === 0 && <p className="text-[13px] text-mute">Aún no hay participantes con actividad.</p>}
        <div className="space-y-2">
          {board.data?.map((r, i) => {
            const pick = picks.indexOf(r.user_id);
            return (
              <div key={r.user_id} className={`rounded-2xl bg-card px-4 py-3 ${r.user_id === me.data?.id ? "ring-1 ring-flame/60" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`font-display text-[22px] ${i < 3 ? "text-flame" : "text-mute"}`}>{i + 1}</div>
                  <div className="flex-1">
                    <div className="font-display text-[15px] tracking-tight">{r.display_name.toUpperCase()}</div>
                    <div className="font-mono text-[9px] uppercase text-mute">
                      {r.country ? `${r.country} · ` : ""}
                      {r.sessions} ses · {r.posts} pub · {r.comments} com · {r.likes} ♥
                    </div>
                    <div className="font-mono text-[9px] uppercase text-mute">
                      Foto inicial {r.has_start ? "✓" : "—"} · Foto progreso {r.has_end ? "✓" : "—"}
                    </div>
                  </div>
                  <div className="font-display text-[20px]">{r.score}</div>
                </div>
                {me.data?.admin && (
                  <Chip active={pick >= 0} onClick={() => togglePick(r.user_id)} className="mt-2 w-full text-center font-display text-[11px]">
                    {pick >= 0 ? `SELECCIONADO · ${pick + 1}º LUGAR` : "SELECCIONAR COMO GANADOR"}
                  </Chip>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {me.data?.admin && (
        <Card>
          <Label>Anunciar ganadores (solo administrador)</Label>
          <p className="mt-2 text-[12px] text-mute">
            Selecciona hasta 3 personas en orden (1º, 2º, 3º). Se guardará el premio y se publicará un anuncio para toda la comunidad.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Mensaje del anuncio: premio, felicitaciones…"
            className="mt-3 w-full resize-none rounded-2xl bg-bg/60 px-4 py-3 text-[13px] text-ink outline-none"
          />
          <FlameButton className={`mt-3 ${!picks.length || busy ? "opacity-50" : ""}`} onClick={announce}>
            {busy ? "ANUNCIANDO…" : `ANUNCIAR ${picks.length || ""} GANADOR${picks.length === 1 ? "" : "ES"}`}
          </FlameButton>
        </Card>
      )}

      <div>
        <Label className="mb-2">Salón de ganadores</Label>
        {byQuarter.size === 0 && <p className="text-[13px] text-mute">Los ganadores se anuncian al cierre de cada trimestre.</p>}
        <div className="space-y-3">
          {[...byQuarter.entries()].map(([quarter, list]) => (
            <Card key={quarter} className="p-4">
              <div className="font-display text-[14px] text-flame">{quarter}</div>
              {list
                .sort((a, b) => a.place - b.place)
                .map((a) => (
                  <div key={a.id} className="mt-2 flex items-center justify-between">
                    <div>
                      <div className="font-display text-[15px]">
                        {["🥇", "🥈", "🥉"][a.place - 1] ?? "🏆"} {a.name.toUpperCase()}
                      </div>
                      <div className="font-mono text-[9px] uppercase text-mute">
                        {a.title}
                        {a.country ? ` · ${a.country}` : ""}
                      </div>
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
              {list[0]?.announcement && <p className="mt-2 text-[12px] text-mute">{list[0].announcement}</p>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Moderation() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pendiente" | "resuelto" | "descartado">("pendiente");
  const reports = useQuery({
    queryKey: ["reports", filter],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("*").eq("status", filter).order("created_at", { ascending: false }).limit(50);
      const list = data ?? [];
      const postIds = list.map((r) => r.post_id).filter((x): x is string => !!x);
      const commentIds = list.map((r) => r.comment_id).filter((x): x is string => !!x);
      const [posts, comments] = await Promise.all([
        postIds.length ? supabase.from("posts").select("*").in("id", postIds) : { data: [] },
        commentIds.length ? supabase.from("comments").select("*").in("id", commentIds) : { data: [] },
      ]);
      const names = await namesFor([
        ...new Set([...(posts.data ?? []).map((p) => p.user_id), ...(comments.data ?? []).map((c) => c.user_id)]),
      ]);
      return list.map((r) => {
        const post = (posts.data ?? []).find((p) => p.id === r.post_id);
        const com = (comments.data ?? []).find((c) => c.id === r.comment_id);
        const author = post?.user_id ?? com?.user_id;
        return { ...r, post, com, author: author ? names[author]?.display_name ?? "Atleta" : "—" };
      });
    },
  });
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["reports"] });
    void qc.invalidateQueries({ queryKey: ["feed"] });
  };
  const setStatus = async (id: string, status: string) => {
    await supabase.from("reports").update({ status }).eq("id", id);
    refresh();
  };

  return (
    <div className="space-y-3 px-5 pb-10">
      <div className="flex gap-1.5">
        {(["pendiente", "resuelto", "descartado"] as const).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)} className="flex-1 text-center font-display text-[11px]">
            {f.toUpperCase()}
          </Chip>
        ))}
      </div>
      {reports.data?.length === 0 && <p className="text-center text-[13px] text-mute">No hay reportes {filter}s.</p>}
      {reports.data?.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-flame">
            {r.comment_id ? "Comentario" : "Publicación"} · {r.reason}
          </div>
          <div className="mt-1 font-display text-[14px]">DE {r.author.toUpperCase()}</div>
          <p className="mt-1 rounded-xl bg-bg/60 px-3 py-2 text-[13px] text-ink/90">
            {r.post?.body || r.com?.body || (r.post?.photo_url ? "(solo foto)" : "(ya fue borrado)")}
          </p>
          {r.details && <p className="mt-1 text-[12px] text-mute">Nota: {r.details}</p>}
          {filter === "pendiente" && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {r.post && !r.post.hidden && (
                <Chip
                  onClick={async () => {
                    await supabase.from("posts").update({ hidden: true }).eq("id", r.post!.id);
                    await setStatus(r.id, "resuelto");
                  }}
                  className="px-3 font-display text-[11px]"
                >
                  OCULTAR
                </Chip>
              )}
              {(r.post || r.com) && (
                <Chip
                  onClick={async () => {
                    if (r.post) await supabase.from("posts").delete().eq("id", r.post.id);
                    else if (r.com) await supabase.from("comments").delete().eq("id", r.com.id);
                    refresh();
                  }}
                  className="px-3 font-display text-[11px]"
                >
                  BORRAR
                </Chip>
              )}
              <Chip onClick={() => setStatus(r.id, "descartado")} className="px-3 font-display text-[11px]">
                DESCARTAR
              </Chip>
            </div>
          )}
          {r.post?.hidden && (
            <button
              type="button"
              onClick={async () => {
                await supabase.from("posts").update({ hidden: false }).eq("id", r.post!.id);
                refresh();
              }}
              className="mt-2 font-mono text-[9px] uppercase text-mute"
            >
              Volver a mostrar
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}
