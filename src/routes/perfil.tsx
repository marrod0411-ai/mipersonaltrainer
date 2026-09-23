import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, Chip, FlameButton, Label, Screen, TabBar } from "@/components/ui-kit";
import { useProfile } from "@/lib/store";
import { GOALS, GYMS, LEVELS, SPORTS } from "@/lib/training";
import type { GoalId, GymId, LevelId, SportId } from "@/lib/training";
import { readoutFor } from "@/lib/body";
import type { SexId } from "@/lib/body";
import {
  notificationPermission,
  nextReminderLabel,
  requestNotifications,
} from "@/lib/reminders";

function NumberField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: {
  label: string;
  value: number | undefined;
  onChange: (n: number | undefined) => void;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex-1">
      <Label className="text-[9px]">{label}</Label>
      <div className="mt-1 flex items-center rounded-2xl bg-bg/60 px-3 py-2">
        <input
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className="w-full bg-transparent font-display text-[20px] tracking-tight text-ink outline-none placeholder:text-mute/50"
        />
        {suffix && <span className="ml-1 font-mono text-[10px] text-mute">{suffix}</span>}
      </div>
    </div>
  );
}


export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil y objetivo — Coach de Hierro" },
      {
        name: "description",
        content:
          "Cambia tu objetivo, nivel, deporte, peso corporal y la hora de tus recordatorios de entrenamiento.",
      },
      { property: "og:title", content: "Mi perfil y objetivo — Coach de Hierro" },
      {
        property: "og:description",
        content: "Ajusta objetivo, nivel, deporte y recordatorios cuando quieras.",
      },
    ],
  }),
  component: ProfileScreen,
});

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

function ProfileScreen() {
  const { profile, loaded, save, clear } = useProfile();
  const [perm, setPerm] = useState<string>("");

  if (!loaded) return <Screen />;
  if (!profile)
    return (
      <Screen>
        <div className="px-5 pt-16 text-center font-display text-[22px]">
          CREA TU PLAN PRIMERO
        </div>
        <TabBar />
      </Screen>
    );

  const patch = (p: Partial<typeof profile>) => save({ ...profile, ...p });
  const readout = readoutFor(profile);


  return (
    <Screen>
      <header className="px-5 pb-4 pt-7 rise">
        <div className="font-display text-[11px] tracking-[0.25em] text-flame">
          {nextReminderLabel(profile)}
        </div>
        <h1 className="font-display text-[26px] leading-none tracking-tight">
          {profile.name.toUpperCase()}
        </h1>
      </header>

      <div className="space-y-6 px-5 pb-10">
        <div>
          <Label className="mb-2">Objetivo principal</Label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <Chip
                key={g.id}
                active={profile.goal === g.id}
                onClick={() => patch({ goal: g.id as GoalId })}
              >
                <div className="font-display text-[14px] leading-tight tracking-tight">
                  {g.label.toUpperCase()}
                </div>
                <div className="mt-0.5 font-mono text-[9px] leading-tight opacity-70">
                  {g.blurb}
                </div>
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2">Nivel</Label>
          <div className="flex gap-2">
            {LEVELS.map((l) => (
              <Chip
                key={l.id}
                active={profile.level === l.id}
                onClick={() => patch({ level: l.id as LevelId })}
                className="flex-1 text-center font-display text-[14px]"
              >
                {l.label.toUpperCase()}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2">Deporte</Label>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <Chip
                key={s.id}
                active={profile.sport === s.id}
                onClick={() => patch({ sport: s.id as SportId })}
                className="rounded-full px-3 py-1.5 font-display text-[12px] tracking-[0.08em]"
              >
                {s.label.toUpperCase()}
              </Chip>
            ))}
          </div>
        </div>


        <div>
          <Label className="mb-2">Dónde entrenas</Label>
          <div className="flex flex-wrap gap-2">
            {GYMS.map((g) => (
              <Chip
                key={g.id}
                active={(profile.gym ?? "completo") === g.id}
                onClick={() => patch({ gym: g.id as GymId })}
                className="rounded-full px-3 py-1.5 font-display text-[12px] tracking-[0.08em]"
              >
                {g.label.toUpperCase()}
              </Chip>
            ))}
          </div>
        </div>

        <Card>
          <Label>Mis medidas</Label>
          <div className="mt-2 flex gap-2">
            {(["hombre", "mujer"] as SexId[]).map((s) => (
              <Chip
                key={s}
                active={(profile.sex ?? "hombre") === s}
                onClick={() => patch({ sex: s })}
                className="flex-1 text-center font-display text-[14px]"
              >
                {s.toUpperCase()}
              </Chip>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <NumberField
              label="Estatura"
              value={profile.height}
              onChange={(v) => patch({ height: v })}
              suffix="CM"
              placeholder="175"
            />
            <NumberField
              label="Edad"
              value={profile.age}
              onChange={(v) => patch({ age: v })}
              suffix="AÑOS"
              placeholder="30"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <NumberField
              label="Cuello"
              value={profile.neck}
              onChange={(v) => patch({ neck: v })}
              suffix="CM"
              placeholder="38"
            />
            <NumberField
              label="Cintura"
              value={profile.waist}
              onChange={(v) => patch({ waist: v })}
              suffix="CM"
              placeholder="84"
            />
          </div>
          {profile.sex === "mujer" && (
            <div className="mt-3 flex gap-2">
              <NumberField
                label="Cadera"
                value={profile.hip}
                onChange={(v) => patch({ hip: v })}
                suffix="CM"
                placeholder="98"
              />
            </div>
          )}
          <Label className="mt-5">Datos que ya tengas medidos</Label>
          <div className="mt-2 flex gap-2">
            <NumberField
              label="Grasa"
              value={profile.known?.bodyFat}
              onChange={(v) => patch({ known: { ...profile.known, bodyFat: v } })}
              suffix="%"
              placeholder="18"
            />
            <NumberField
              label="Agua"
              value={profile.known?.water}
              onChange={(v) => patch({ known: { ...profile.known, water: v } })}
              suffix="%"
              placeholder="58"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <NumberField
              label="Masa muscular"
              value={profile.known?.muscleMass}
              onChange={(v) => patch({ known: { ...profile.known, muscleMass: v } })}
              suffix="KG"
              placeholder="34"
            />
            <NumberField
              label="Grasa visceral"
              value={profile.known?.visceral}
              onChange={(v) => patch({ known: { ...profile.known, visceral: v } })}
              placeholder="6"
            />
          </div>
        </Card>

        <Card>
          <Label>Mi análisis</Label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px]">Grasa</Label>
              <div className="font-display text-[22px] tracking-tight text-flame">
                {readout.bodyFat !== null ? `${readout.bodyFat}%` : "—"}
              </div>
              <div className="font-mono text-[9px] uppercase text-mute">
                {readout.bodyFatLabel}
              </div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px]">IMC</Label>
              <div className="font-display text-[22px] tracking-tight">{readout.bmi ?? "—"}</div>
              <div className="font-mono text-[9px] uppercase text-mute">{readout.bmiLabel}</div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px]">Calorías</Label>
              <div className="font-display text-[22px] tracking-tight">
                {readout.calories ?? "—"}
              </div>
              <div className="font-mono text-[9px] uppercase text-mute">
                {readout.tdee ? `Gasto ${readout.tdee}` : "Faltan datos"}
              </div>
            </div>
            <div className="rounded-2xl bg-bg/60 px-3 py-2">
              <Label className="text-[9px]">Masa magra</Label>
              <div className="font-display text-[22px] tracking-tight">
                {readout.leanMass ? `${readout.leanMass} kg` : "—"}
              </div>
              <div className="font-mono text-[9px] uppercase text-mute">
                Agua {Math.round(readout.waterTargetMl / 100) / 10} L
              </div>
            </div>
          </div>
          {readout.protein && (
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.13em] text-mute">
              Proteína {readout.protein} g · grasa {readout.fat} g · carbos {readout.carbs} g
            </div>
          )}
          <ul className="mt-3 space-y-1.5">
            {readout.notes.map((n) => (
              <li key={n} className="text-[12px] leading-relaxed text-mute">
                · {n}
              </li>
            ))}
          </ul>
        </Card>


        <Card>
          <Label>Peso corporal</Label>
          <div className="mt-2 flex items-end gap-3">
            <div className="font-display text-[48px] leading-none tracking-tight">
              {profile.bodyWeight}
            </div>
            <div className="pb-2 font-display text-[18px] text-mute">KG</div>
          </div>
          <input
            type="range"
            min={40}
            max={160}
            value={profile.bodyWeight}
            onChange={(e) => patch({ bodyWeight: Number(e.target.value) })}
            className="mt-3 w-full accent-flame"
          />
          <Label className="mb-2 mt-5">Días por semana</Label>
          <div className="flex gap-2">
            {[3, 4, 5, 6].map((d) => (
              <Chip
                key={d}
                active={profile.daysPerWeek === d}
                onClick={() => patch({ daysPerWeek: d })}
                className="flex-1 text-center font-display text-[16px]"
              >
                {d}
              </Chip>
            ))}
          </div>
        </Card>

        <Card>
          <Label>Recordatorios</Label>
          <input
            type="time"
            value={profile.reminderTime}
            onChange={(e) => patch({ reminderTime: e.target.value })}
            className="mt-2 w-full rounded-2xl bg-bg/60 px-4 py-3 font-display text-[26px] tracking-tight text-ink outline-none"
          />
          <div className="mt-3 flex gap-2">
            {DAY_LABELS.map((d, i) => (
              <Chip
                key={i}
                active={profile.reminderDays.includes(i)}
                onClick={() =>
                  patch({
                    reminderDays: profile.reminderDays.includes(i)
                      ? profile.reminderDays.filter((x) => x !== i)
                      : [...profile.reminderDays, i].sort(),
                  })
                }
                className="flex-1 text-center font-display text-[15px]"
              >
                {d}
              </Chip>
            ))}
          </div>
          <FlameButton
            className="mt-4"
            onClick={async () => setPerm(String(await requestNotifications()))}
          >
            ACTIVAR AVISOS EN ESTE CELULAR
          </FlameButton>
          <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
            Estado: {perm || notificationPermission()}
          </div>
        </Card>

        <Chip
          onClick={() => clear()}
          className="w-full text-center font-display text-[14px] tracking-[0.1em]"
        >
          BORRAR MI PLAN Y EMPEZAR DE CERO
        </Chip>
      </div>

      <TabBar />
    </Screen>
  );
}
