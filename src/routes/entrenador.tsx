import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, Chip, FlameButton, Label, Screen } from "@/components/ui-kit";
import { InjuryPicker } from "@/components/injury-picker";
import { MeasureGuide } from "@/components/measure-guide";
import { GOALS, GYMS, LEVELS, buildPlan, recommendedLoad, sessionKcal, type Profile, type Session } from "@/lib/training";
import { readoutFor } from "@/lib/body";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/entrenador")({
  head: () => ({
    meta: [
      { title: "Entrenadores — Mi Personal Trainer" },
      { name: "description", content: "Panel para entrenadores: registra a tus alumnos con sus medidas y planifica sus rutinas." },
      { property: "og:title", content: "Entrenadores — Mi Personal Trainer" },
      { property: "og:description", content: "Planifica rutinas personalizadas para tus alumnos con sus medidas y lesiones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrainerPage,
});

type Student = { id: string; profile: Profile & { notes?: string }; plan: Session[] | null; week: number; notes: string };

const inputCls = "w-full rounded-2xl bg-card px-4 py-3 text-[15px] text-ink outline-none ring-1 ring-line/60";

function TrainerPage() {
  const [state, setState] = useState<"loading" | "out" | "notTrainer" | "in">("loading");
  const check = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setState("out");
    const { data: t } = await supabase.from("trainers").select("user_id").eq("user_id", data.user.id).maybeSingle();
    setState(t ? "in" : "notTrainer");
  }, []);
  useEffect(() => {
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT") void check();
    });
    return () => sub.subscription.unsubscribe();
  }, [check]);

  if (state === "loading") return <Screen />;
  if (state === "out") return <TrainerAuth />;
  if (state === "notTrainer") return <Activate onDone={check} />;
  return <Dashboard />;
}

function Header({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-6 pt-12">
      <div className="font-display text-[11px] tracking-[0.3em] text-flame">MI PERSONAL TRAINER · ENTRENADORES</div>
      <h1 className="mt-2 font-display text-[36px] leading-[0.9] tracking-tight">{title}</h1>
      {sub && <p className="mt-3 text-[13px] leading-relaxed text-mute">{sub}</p>}
    </div>
  );
}

function TrainerAuth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r =
      mode === "up"
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/entrenador` } })
        : await supabase.auth.signInWithPassword({ email, password });
    if (r.error) setMsg(r.error.message.includes("Invalid") ? "Correo o contraseña incorrectos." : r.error.message);
    else if (mode === "up" && !r.data.session) setMsg("Te enviamos un correo. Confírmalo y luego ingresa aquí.");
    setBusy(false);
  };
  return (
    <Screen>
      <Header title={mode === "in" ? "ACCESO ENTRENADOR" : "CUENTA DE ENTRENADOR"} sub="Planifica rutinas personalizadas para tus alumnos con sus medidas y características." />
      <div className="px-6">
        <div className="mt-6 flex gap-2">
          {(["in", "up"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 rounded-2xl py-3 font-display text-[14px] tracking-[0.1em] ${mode === m ? "chip-active text-bg" : "chip text-ink"}`}>
              {m === "in" ? "INICIAR SESIÓN" : "REGISTRARME"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo" className={inputCls} />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña (mín. 6)" className={inputCls} />
          {msg && <p className="text-[13px] text-flame">{msg}</p>}
          <FlameButton type="submit" className="w-full">{busy ? "..." : mode === "in" ? "ENTRAR" : "CREAR CUENTA"}</FlameButton>
          <a href="/" className="block py-2 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-mute underline">Soy atleta, ir a mi app</a>
        </form>
      </div>
    </Screen>
  );
}

function Activate({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const go = async () => {
    const { error } = await supabase.from("trainers").insert({ display_name: name.trim() || "Entrenador" });
    if (error) setErr("No se pudo activar. Intenta de nuevo.");
    else onDone();
  };
  return (
    <Screen>
      <Header title="ACTIVA TU PANEL" sub="Tu cuenta aún no es de entrenador. Escribe tu nombre profesional para activarla." />
      <div className="mt-6 space-y-3 px-6">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre profesional" className={inputCls} />
        {err && <p className="text-[13px] text-flame">{err}</p>}
        <FlameButton onClick={go} className="w-full">ACTIVAR PANEL DE ENTRENADOR</FlameButton>
        <button onClick={() => supabase.auth.signOut()} className="w-full py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-mute">Cerrar sesión</button>
      </div>
    </Screen>
  );
}

function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState<Student | "new" | null>(null);
  const load = useCallback(async () => {
    const { data } = await supabase.from("trainer_students").select("id, profile, plan, week, notes").order("created_at", { ascending: false });
    setStudents((data ?? []) as unknown as Student[]);
  }, []);
  useEffect(() => void load(), [load]);

  if (open) return <StudentEditor student={open === "new" ? null : open} onClose={() => { setOpen(null); void load(); }} />;

  return (
    <Screen>
      <Header title="MIS ALUMNOS" sub={`${students.length} alumno${students.length === 1 ? "" : "s"}. Registra sus medidas y genera o ajusta su rutina.`} />
      <div className="mt-6 space-y-3 px-6">
        <FlameButton onClick={() => setOpen("new")} className="w-full">+ NUEVO ALUMNO</FlameButton>
        {students.map((s) => (
          <button key={s.id} onClick={() => setOpen(s)} className="block w-full text-left">
            <Card>
              <div className="font-display text-[20px]">{s.profile.name}</div>
              <div className="mt-1 text-[12px] text-mute">
                {GOALS.find((g) => g.id === s.profile.goal)?.label} · {LEVELS.find((l) => l.id === s.profile.level)?.label} · {s.profile.bodyWeight} kg · {s.profile.daysPerWeek} días
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-flame">{s.plan ? `Plan semana ${s.week}` : "Sin plan todavía"}</div>
            </Card>
          </button>
        ))}
        <button onClick={() => supabase.auth.signOut()} className="w-full py-4 font-mono text-[10px] uppercase tracking-[0.15em] text-mute">Cerrar sesión</button>
      </div>
    </Screen>
  );
}

const blank: Profile = {
  name: "", goal: GOALS[0]!.id, level: "iniciando", sport: "ninguno" as Profile["sport"], bodyWeight: 70, daysPerWeek: 4,
  reminderTime: "07:00", reminderDays: [], gym: "completo", injuries: { items: [], notes: "" },
};

function Num({ label, value, onChange }: { label: string; value?: number | undefined; onChange: (v: number | undefined) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input type="number" inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} className={`${inputCls} mt-1`} />
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-6">
      <Label className="mb-2">{title}</Label>
      {children}
    </div>
  );
}

function StudentEditor({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const [p, setP] = useState<Profile>(student?.profile ?? blank);
  const [plan, setPlan] = useState<Session[] | null>(student?.plan ?? null);
  const [week, setWeek] = useState(student?.week ?? 1);
  const [notes, setNotes] = useState(student?.notes ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const r = p.bodyWeight ? readoutFor(p) : null;

  const save = async () => {
    if (!p.name.trim()) return setMsg("Escribe el nombre del alumno.");
    const row = { profile: p as unknown as Json, plan: plan as unknown as Json, week, notes, updated_at: new Date().toISOString() };
    const { error } = student
      ? await supabase.from("trainer_students").update(row).eq("id", student.id)
      : await supabase.from("trainer_students").insert(row);
    if (error) setMsg("No se pudo guardar.");
    else onClose();
  };
  const remove = async () => {
    if (!student || !confirm(`¿Borrar a ${p.name}?`)) return;
    await supabase.from("trainer_students").delete().eq("id", student.id);
    onClose();
  };
  const editEx = (si: number, ei: number, k: "name" | "sets" | "reps" | "restSec", v: string) =>
    setPlan((pl) =>
      pl!.map((s, i) => (i !== si ? s : { ...s, exercises: s.exercises.map((e, j) => (j !== ei ? e : { ...e, [k]: k === "sets" || k === "restSec" ? Number(v) || 0 : v })) })),
    );
  const delEx = (si: number, ei: number) => setPlan((pl) => pl!.map((s, i) => (i !== si ? s : { ...s, exercises: s.exercises.filter((_, j) => j !== ei) })));
  const addEx = (si: number) => setPlan((pl) => pl!.map((s, i) => (i !== si ? s : { ...s, exercises: [...s.exercises, { name: "Nuevo ejercicio", sets: 3, reps: "10", restSec: 60 }] })));

  return (
    <Screen>
      <div className="px-6 pt-8">
        <button onClick={onClose} className="font-mono text-[10px] uppercase tracking-[0.15em] text-flame">← Mis alumnos</button>
        <h1 className="mt-3 font-display text-[32px] leading-[0.9]">{student ? p.name.toUpperCase() : "NUEVO ALUMNO"}</h1>

        <Section title="Datos">
          <input value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Nombre" className={inputCls} />
          <div className="mt-2 flex gap-2">
            {(["hombre", "mujer"] as const).map((s) => <Chip key={s} active={p.sex === s} onClick={() => set("sex", s)}>{s === "hombre" ? "Hombre" : "Mujer"}</Chip>)}
          </div>
        </Section>

        <Section title="Medidas">
          <MeasureGuide sex={p.sex} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Num label="Edad" value={p.age} onChange={(v) => set("age", v)} />
            <Num label="Peso kg" value={p.bodyWeight} onChange={(v) => set("bodyWeight", v ?? 0)} />
            <Num label="Estatura cm" value={p.height} onChange={(v) => set("height", v)} />
            <Num label="Cuello cm" value={p.neck} onChange={(v) => set("neck", v)} />
            <Num label="Cintura cm" value={p.waist} onChange={(v) => set("waist", v)} />
            {p.sex === "mujer" && <Num label="Cadera cm" value={p.hip} onChange={(v) => set("hip", v)} />}
            <Num label="% grasa medida" value={p.known?.bodyFat} onChange={(v) => set("known", { ...p.known, bodyFat: v })} />
            <Num label="Masa muscular kg" value={p.known?.muscleMass} onChange={(v) => set("known", { ...p.known, muscleMass: v })} />
          </div>
          {r && (
            <div className="mt-2 text-[12px] text-mute">
              {r.bodyFat != null && <>Grasa ≈{r.bodyFat}% · </>}{r.bmi != null && <>IMC {r.bmi} · </>}{r.calories != null && <>≈{r.calories} kcal/día</>}
            </div>
          )}
        </Section>

        <Section title="Objetivo">
          <div className="flex flex-wrap gap-2">{GOALS.map((g) => <Chip key={g.id} active={p.goal === g.id} onClick={() => set("goal", g.id)}>{g.label}</Chip>)}</div>
        </Section>
        <Section title="Nivel">
          <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <Chip key={l.id} active={p.level === l.id} onClick={() => set("level", l.id)}>{l.label}</Chip>)}</div>
        </Section>
        <Section title="Gimnasio">
          <div className="flex flex-wrap gap-2">{GYMS.map((g) => <Chip key={g.id} active={p.gym === g.id} onClick={() => set("gym", g.id)}>{g.label}</Chip>)}</div>
        </Section>
        <Section title="Días por semana">
          <div className="flex flex-wrap gap-2">{[2, 3, 4, 5, 6, 7].map((d) => <Chip key={d} active={p.daysPerWeek === d} onClick={() => set("daysPerWeek", d)}>{d}</Chip>)}</div>
        </Section>
        <Section title="Lesiones y restricciones">
          <InjuryPicker value={p.injuries ?? { items: [], notes: "" }} onChange={(v) => set("injuries", v)} />
        </Section>
        <Section title="Notas del entrenador">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputCls} placeholder="Observaciones, metas, historial..." />
        </Section>

        <Section title={`Rutina · semana ${week}`}>
          <div className="flex items-center gap-2">
            <Chip onClick={() => setWeek((w) => Math.max(1, w - 1))}>−</Chip>
            <span className="font-mono text-[12px]">SEMANA {week}{week % 4 === 0 ? " (DESCARGA)" : ""}</span>
            <Chip onClick={() => setWeek((w) => w + 1)}>+</Chip>
          </div>
          <FlameButton onClick={() => { if (!plan || confirm("¿Reemplazar la rutina actual por una nueva generada?")) setPlan(buildPlan(p, week)); }} className="mt-3 w-full">
            {plan ? "REGENERAR RUTINA CON ESTOS DATOS" : "GENERAR RUTINA"}
          </FlameButton>
          {plan?.map((s, si) => (
            <Card key={si} className="mt-3">
              <div className="font-mono text-[10px] text-flame">{s.day} · {s.minutes} MIN · ≈{sessionKcal(s, p.bodyWeight)} KCAL</div>
              <input value={s.title} onChange={(e) => setPlan((pl) => pl!.map((x, i) => (i === si ? { ...x, title: e.target.value } : x)))} className="mt-1 w-full bg-transparent font-display text-[16px] outline-none" />
              <div className="mt-2 space-y-2">
                {s.exercises.map((e, ei) => {
                  const kg = recommendedLoad(e, { bodyWeight: p.bodyWeight, level: p.level, goal: p.goal, week });
                  return (
                    <div key={ei} className="rounded-2xl bg-bg/60 p-2">
                      <div className="flex gap-2">
                        <input value={e.name} onChange={(v) => editEx(si, ei, "name", v.target.value)} className="flex-1 bg-transparent text-[13px] outline-none" />
                        <button aria-label="Quitar ejercicio" onClick={() => delEx(si, ei)} className="text-mute">✕</button>
                      </div>
                      <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-mute">
                        <input aria-label="Series" value={e.sets} onChange={(v) => editEx(si, ei, "sets", v.target.value)} className="w-8 bg-transparent text-ink outline-none" />×
                        <input aria-label="Repeticiones" value={e.reps} onChange={(v) => editEx(si, ei, "reps", v.target.value)} className="w-14 bg-transparent text-ink outline-none" />
                        desc <input aria-label="Descanso" value={e.restSec} onChange={(v) => editEx(si, ei, "restSec", v.target.value)} className="w-10 bg-transparent text-ink outline-none" />s
                        {kg ? <span className="ml-auto text-flame">≈{kg} kg</span> : null}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => addEx(si)} className="font-mono text-[10px] uppercase tracking-[0.15em] text-flame">+ Agregar ejercicio</button>
              </div>
            </Card>
          ))}
        </Section>

        {msg && <p className="mt-4 text-[13px] text-flame">{msg}</p>}
        <FlameButton onClick={save} className="mt-6 w-full">GUARDAR ALUMNO</FlameButton>
        {student && <button onClick={remove} className="mt-2 w-full py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-mute">Borrar alumno</button>}
      </div>
    </Screen>
  );
}
