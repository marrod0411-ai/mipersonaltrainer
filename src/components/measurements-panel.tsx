import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Chip, FlameButton, Label } from "@/components/ui-kit";
import { MeasureGuide } from "@/components/measure-guide";
import { navyBodyFat } from "@/lib/body";
import type { Measurement } from "@/lib/store";
import type { Profile } from "@/lib/training";

const DAY = 86400000;
const today = () => new Date().toISOString().slice(0, 10);

type Draft = Omit<Measurement, "id"> & { id?: string };

export function MeasurementsPanel({
  profile,
  measurements,
  onSave,
  onDelete,
  onProfile,
}: {
  profile: Profile;
  measurements: Measurement[];
  onSave: (m: Measurement) => void;
  onDelete: (id: string) => void;
  onProfile: (p: Profile) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [metric, setMetric] = useState<"weight" | "waist" | "fat">("weight");
  const last = measurements.at(-1);
  const daysSince = last ? Math.floor((Date.now() - new Date(last.date).getTime()) / DAY) : null;
  const due = daysSince === null || daysSince >= 28;

  const fatOf = (m: Measurement) =>
    m.bodyFat ??
    navyBodyFat({ sex: profile.sex, height: profile.height, neck: m.neck, waist: m.waist, hip: m.hip, bodyWeight: m.weight });

  const rows = useMemo(
    () =>
      measurements.map((m) => ({
        d: new Date(m.date + "T12:00").toLocaleDateString("es", { day: "numeric", month: "short" }),
        weight: m.weight,
        waist: m.waist ?? null,
        fat: fatOf(m),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [measurements, profile.sex, profile.height],
  );

  const first = measurements[0];
  const delta = (a?: number | null, b?: number | null) =>
    a != null && b != null ? `${b - a >= 0 ? "+" : ""}${(Math.round((b - a) * 10) / 10).toString()}` : "–";

  const startNew = () =>
    setDraft({
      date: today(),
      weight: last?.weight ?? profile.bodyWeight,
      waist: last?.waist ?? profile.waist,
      neck: last?.neck ?? profile.neck,
      hip: last?.hip ?? profile.hip,
      bodyFat: undefined,
      muscleMass: undefined,
    });

  const save = () => {
    if (!draft || !draft.weight) return;
    const m: Measurement = { ...draft, id: draft.id ?? crypto.randomUUID() };
    onSave(m);
    const newest = [...measurements.filter((x) => x.id !== m.id), m].sort((a, b) => a.date.localeCompare(b.date)).at(-1)!;
    if (newest.id === m.id) {
      onProfile({
        ...profile,
        bodyWeight: m.weight,
        waist: m.waist ?? profile.waist,
        neck: m.neck ?? profile.neck,
        hip: m.hip ?? profile.hip,
        known: { ...profile.known, bodyFat: m.bodyFat ?? profile.known?.bodyFat, muscleMass: m.muscleMass ?? profile.known?.muscleMass },
      });
    }
    setDraft(null);
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <Label>Mis medidas</Label>
        {daysSince !== null && (
          <span className="font-mono text-[9px] uppercase text-mute">Hace {daysSince} días</span>
        )}
      </div>
      {due && !draft && (
        <p className="mt-2 text-[13px] text-flame">
          {last ? "Ya pasaron 4 semanas: es momento de volver a medirte." : "Registra tus medidas de hoy para ver tu progreso real."}
        </p>
      )}

      {measurements.length >= 1 && first && last && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { l: "Peso", v: `${last.weight} kg`, d: delta(first.weight, last.weight) },
            { l: "Cintura", v: last.waist ? `${last.waist} cm` : "–", d: delta(first.waist, last.waist) },
            { l: "Grasa", v: fatOf(last) != null ? `${fatOf(last)}%` : "–", d: delta(fatOf(first), fatOf(last)) },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px]">{s.l}</Label>
              <div className="mt-0.5 font-display text-[16px]">{s.v}</div>
              <div className="font-mono text-[9px] text-flame">{s.d} desde el inicio</div>
            </div>
          ))}
        </div>
      )}

      {rows.length >= 2 && (
        <>
          <div className="mt-3 flex gap-1.5">
            {([["weight", "PESO"], ["waist", "CINTURA"], ["fat", "% GRASA"]] as const).map(([id, l]) => (
              <Chip key={id} active={metric === id} onClick={() => setMetric(id)} className="flex-1 px-2 text-center font-display text-[11px]">
                {l}
              </Chip>
            ))}
          </div>
          <div className="mt-2 h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows}>
                <CartesianGrid stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 9, fill: "var(--color-mute)" }} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "var(--color-mute)" }} width={32} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "none", borderRadius: 12, fontSize: 11, color: "var(--color-ink)" }} />
                <Line dataKey={metric} stroke="var(--color-flame)" strokeWidth={2} connectNulls dot={{ r: 3, fill: "var(--color-flame)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {draft ? (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Field label="Fecha" type="date" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v || today() })} />
            <Num label="Peso" suffix="KG" value={draft.weight} onChange={(v) => setDraft({ ...draft, weight: v ?? 0 })} />
          </div>
          <div className="flex gap-2">
            <Num label="Cintura" suffix="CM" value={draft.waist} onChange={(v) => setDraft({ ...draft, waist: v })} />
            <Num label="Cuello" suffix="CM" value={draft.neck} onChange={(v) => setDraft({ ...draft, neck: v })} />
          </div>
          <div className="flex gap-2">
            {profile.sex === "mujer" && (
              <Num label="Cadera" suffix="CM" value={draft.hip} onChange={(v) => setDraft({ ...draft, hip: v })} />
            )}
            <Num label="Grasa medida" suffix="%" value={draft.bodyFat} onChange={(v) => setDraft({ ...draft, bodyFat: v })} />
            <Num label="Masa muscular" suffix="KG" value={draft.muscleMass} onChange={(v) => setDraft({ ...draft, muscleMass: v })} />
          </div>
          <MeasureGuide sex={profile.sex} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setDraft(null)} className="flex-1 rounded-full chip py-3 font-display text-[13px]">
              CANCELAR
            </button>
            <div className="flex-1">
              <FlameButton onClick={save}>GUARDAR</FlameButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <FlameButton onClick={startNew}>+ REGISTRAR MEDIDAS</FlameButton>
        </div>
      )}

      {measurements.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {[...measurements].reverse().map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-2xl bg-bg/60 px-3 py-2 text-[12px]">
              <span>
                <span className="font-mono text-[10px] text-mute">{m.date}</span> · {m.weight} kg
                {m.waist ? ` · cintura ${m.waist}` : ""}
              </span>
              <span className="flex gap-3 font-mono text-[10px] uppercase">
                <button type="button" className="text-flame" onClick={() => setDraft({ ...m })}>Editar</button>
                <button type="button" className="text-mute" onClick={() => confirm("¿Borrar esta medición?") && onDelete(m.id)}>Borrar</button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function Num({ label, value, onChange, suffix }: { label: string; value: number | undefined; onChange: (n: number | undefined) => void; suffix: string }) {
  return (
    <div className="flex-1">
      <Label className="text-[9px]">{label}</Label>
      <div className="mt-1 flex items-center rounded-2xl bg-bg/60 px-3 py-2">
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className="w-full min-w-0 bg-transparent font-display text-[18px] text-ink outline-none"
        />
        <span className="ml-1 font-mono text-[10px] text-mute">{suffix}</span>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type: string }) {
  return (
    <div className="flex-1">
      <Label className="text-[9px]">{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl bg-bg/60 px-3 py-2.5 font-display text-[14px] text-ink outline-none"
      />
    </div>
  );
}
