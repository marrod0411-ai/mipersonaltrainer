import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, Chip, Label } from "@/components/ui-kit";
import type { LogState } from "@/lib/store";
import type { Profile } from "@/lib/training";
import { sportActivityOf } from "@/lib/sport-activity";

const PERIODS = [
  { id: 4, label: "4 SEM" },
  { id: 12, label: "12 SEM" },
  { id: 26, label: "6 MESES" },
  { id: 0, label: "TODO" },
] as const;

const CARDIO_RE = /CARDIO|INTERVALOS|METABÓLICO|HIIT|LISS/;
const CARDIO_MIN = 25;
const STEPS_PER_CARDIO_MIN = 110;

function weekStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
const key = (d: Date) => d.toISOString().slice(0, 10);

const tooltipStyle = {
  background: "var(--color-card)",
  border: "none",
  borderRadius: 12,
  fontSize: 11,
  color: "var(--color-ink)",
};

export function ProgressDashboard({ profile, log }: { profile: Profile; log: LogState }) {
  const [weeks, setWeeks] = useState<number>(12);
  const sport = sportActivityOf(profile);

  const data = useMemo(() => {
    const dates = [
      ...log.sets.map((s) => s.date.slice(0, 10)),
      ...log.completedSessions.map((c) => c.slice(0, 10)),
    ].sort();
    const first = dates[0] ? new Date(dates[0]) : new Date();
    const end = weekStart(new Date());
    let start = weeks ? new Date(end.getTime() - (weeks - 1) * 7 * 86400000) : weekStart(first);
    if (start > end) start = end;
    const rows: { w: string; volumen: number; sesiones: number; cardio: number; pasos: number; top: number; kcal: number }[] = [];
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 7 * 86400000)) {
      const a = key(d);
      const b = key(new Date(d.getTime() + 7 * 86400000));
      const sets = log.sets.filter((s) => s.date.slice(0, 10) >= a && s.date.slice(0, 10) < b);
      const sessions = log.completedSessions.filter((c) => c.slice(0, 10) >= a && c.slice(0, 10) < b);
      const cardioSessions = sessions.filter((c) => CARDIO_RE.test(c.split("|")[1] ?? "")).length;
      const cardio = cardioSessions * CARDIO_MIN;
      rows.push({
        w: d.toLocaleDateString("es", { day: "numeric", month: "short" }),
        volumen: Math.round(sets.reduce((n, s) => n + s.kg * s.reps, 0)),
        sesiones: sessions.length,
        cardio,
        pasos: cardio * STEPS_PER_CARDIO_MIN + (sport?.stepsWeekly ?? 0),
        top: sets.reduce((m, s) => Math.max(m, s.kg), 0),
        kcal: sessions.reduce((n, c) => n + (log.kcal?.[c] ?? 0), 0),
      });
    }
    return { rows, from: start };
  }, [log, weeks, sport?.stepsWeekly]);

  const photos = useQuery({
    queryKey: ["my-photos", key(data.from)],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: posts } = await supabase
        .from("posts")
        .select("id, photo_url, created_at")
        .eq("user_id", u.user.id)
        .not("photo_url", "is", null)
        .gte("created_at", data.from.toISOString())
        .order("created_at");
      const list = posts ?? [];
      if (!list.length) return null;
      const pair = list.length > 1 ? [list[0]!, list[list.length - 1]!] : [list[0]!];
      const { data: signed } = await supabase.storage.from("community").createSignedUrls(pair.map((p) => p.photo_url!), 3600);
      return pair.map((p, i) => ({ date: p.created_at, url: signed?.[i]?.signedUrl ?? "" }));
    },
  });

  const sum = (k: "volumen" | "sesiones" | "cardio" | "pasos" | "kcal") => data.rows.reduce((n, r) => n + r[k], 0);
  const half = Math.floor(data.rows.length / 2);
  const avg = (rows: typeof data.rows) => (rows.length ? rows.reduce((n, r) => n + r.volumen, 0) / rows.length : 0);
  const before = avg(data.rows.slice(0, half));
  const after = avg(data.rows.slice(half));
  const change = before > 0 ? Math.round(((after - before) / before) * 100) : null;

  const stats = [
    { l: "Sesiones", v: sum("sesiones").toString() },
    { l: "Volumen", v: `${(sum("volumen") / 1000).toFixed(1)}t` },
    { l: "Cardio", v: `${sum("cardio")} min` },
    { l: "Pasos aprox.", v: `${Math.round(sum("pasos") / 1000)}k` },
    { l: "Calorías quemadas", v: `${sum("kcal").toLocaleString("es")} kcal` },
    { l: "Promedio / sesión", v: `${sum("sesiones") ? Math.round(sum("kcal") / sum("sesiones")) : 0} kcal` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {PERIODS.map((p) => (
          <Chip key={p.id} active={weeks === p.id} onClick={() => setWeeks(p.id)} className="flex-1 px-2 text-center font-display text-[11px]">
            {p.label}
          </Chip>
        ))}
      </div>

      <Card>
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div key={s.l} className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px] tracking-[0.15em]">{s.l}</Label>
              <div className="mt-0.5 font-display text-[20px]">{s.v}</div>
            </div>
          ))}
        </div>
        {change !== null && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-flame">
            Volumen semanal {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% vs. la primera mitad del periodo
          </p>
        )}
      </Card>

      <ChartCard title="Volumen de entrenamiento (kg × reps)">
        <BarChart data={data.rows}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="w" tick={{ fontSize: 9, fill: "var(--color-mute)" }} />
          <YAxis tick={{ fontSize: 9, fill: "var(--color-mute)" }} width={38} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "transparent" }} />
          <Bar dataKey="volumen" fill="var(--color-flame)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Calorías quemadas por semana (kcal)">
        <BarChart data={data.rows}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="w" tick={{ fontSize: 9, fill: "var(--color-mute)" }} />
          <YAxis tick={{ fontSize: 9, fill: "var(--color-mute)" }} width={38} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "transparent" }} />
          <Bar dataKey="kcal" fill="var(--color-flame)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>

      <ChartCard title="Carga máxima por semana (kg)">
        <LineChart data={data.rows}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="w" tick={{ fontSize: 9, fill: "var(--color-mute)" }} />
          <YAxis tick={{ fontSize: 9, fill: "var(--color-mute)" }} width={30} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line dataKey="top" stroke="var(--color-flame)" strokeWidth={2} dot={false} />
        </LineChart>
      </ChartCard>

      <ChartCard title="Cardio (min) y pasos aprox.">
        <BarChart data={data.rows}>
          <CartesianGrid stroke="var(--color-line)" vertical={false} />
          <XAxis dataKey="w" tick={{ fontSize: 9, fill: "var(--color-mute)" }} />
          <YAxis yAxisId="a" tick={{ fontSize: 9, fill: "var(--color-mute)" }} width={30} />
          <YAxis yAxisId="b" orientation="right" tick={{ fontSize: 9, fill: "var(--color-mute)" }} width={38} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "transparent" }} />
          <Bar yAxisId="a" dataKey="cardio" fill="var(--color-flame)" radius={[6, 6, 0, 0]} />
          <Bar yAxisId="b" dataKey="pasos" fill="var(--color-clay)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ChartCard>
      <p className="-mt-2 px-1 text-[11px] text-mute">
        Cardio: {CARDIO_MIN} min por sesión de cardio completada. Pasos: estimados con tu cardio
        {sport ? " y tu deporte" : ""}.
      </p>

      <Card>
        <Label className="mb-2">Foto inicial vs. foto actual</Label>
        {!photos.data ? (
          <p className="text-[13px] text-mute">
            Publica una foto en Comunidad (puedes elegir "Solo yo") al empezar y otra más adelante para compararlas aquí.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {photos.data.map((p, i) => (
              <div key={p.date}>
                <img src={p.url} alt={i === 0 ? "Foto inicial" : "Foto actual"} className="aspect-[3/4] w-full rounded-2xl object-cover" />
                <div className="mt-1 font-mono text-[9px] uppercase text-mute">
                  {i === 0 ? "Inicio" : "Actual"} · {new Date(p.date).toLocaleDateString("es")}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card className="p-4">
      <Label className="mb-2">{title}</Label>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
