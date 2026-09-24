import { Card, Chip, Label, ProgressBar } from "@/components/ui-kit";
import { INTENSITIES, sportActivityOf } from "@/lib/sport-activity";
import type { Intensity } from "@/lib/sport-activity";
import { sportLabel } from "@/lib/training";
import type { Profile } from "@/lib/training";

function Stepper({
  label,
  value,
  step,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex-1 rounded-2xl bg-bg/60 px-3 py-2">
      <Label className="text-[9px]">{label}</Label>
      <div className="mt-1 flex items-center justify-between">
        <button
          type="button"
          aria-label={`Menos ${label}`}
          onClick={() => onChange(Math.max(min, value - step))}
          className="chip grid h-8 w-8 place-items-center rounded-full font-display text-[16px]"
        >
          −
        </button>
        <div className="text-center">
          <span className="font-display text-[22px] tracking-tight">{value}</span>
          <span className="ml-1 font-mono text-[9px] text-mute">{suffix}</span>
        </div>
        <button
          type="button"
          aria-label={`Más ${label}`}
          onClick={() => onChange(Math.min(max, value + step))}
          className="chip grid h-8 w-8 place-items-center rounded-full font-display text-[16px]"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function SportActivityPanel({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange?: (p: Profile) => void;
}) {
  if (profile.sport === "ninguno") return null;
  const a = profile.sportActivity ?? { minutes: 60, timesPerWeek: 2, intensity: "media" as Intensity };
  const set = (patch: Partial<typeof a>) =>
    onChange?.({ ...profile, sportActivity: { ...a, ...patch } });
  const r = sportActivityOf({ ...profile, sportActivity: a });

  return (
    <Card>
      <Label className="tracking-[0.18em]">Tu actividad deportiva</Label>
      <div className="mt-1 font-display text-[20px] leading-none tracking-tight">
        {sportLabel(profile.sport).toUpperCase()}
      </div>

      {onChange && (
        <>
          <div className="mt-3 flex gap-2">
            <Stepper label="Tiempo" value={a.minutes} step={15} min={15} max={240} suffix="MIN" onChange={(minutes) => set({ minutes })} />
            <Stepper label="Veces" value={a.timesPerWeek} step={1} min={1} max={7} suffix="/SEM" onChange={(timesPerWeek) => set({ timesPerWeek })} />
          </div>
          <Label className="mb-1.5 mt-3 text-[9px]">Intensidad</Label>
          <div className="flex gap-2">
            {INTENSITIES.map((i) => (
              <Chip
                key={i.id}
                active={a.intensity === i.id}
                onClick={() => set({ intensity: i.id })}
                className="flex-1 text-center font-display text-[13px] tracking-[0.08em]"
              >
                {i.label.toUpperCase()}
              </Chip>
            ))}
          </div>
        </>
      )}

      {r && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="Por sesión" value={`${r.perSession}`} unit="kcal" />
            <Stat label="Por semana" value={`${r.weekly}`} unit="kcal" />
            <Stat label="Diario" value={`+${r.daily}`} unit="kcal" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Stat label="Pasos / semana" value={r.stepsWeekly ? r.stepsWeekly.toLocaleString("es") : "—"} unit="" />
            <Stat label="Meta pasos diaria" value={r.stepGoal.toLocaleString("es")} unit="" />
          </div>
          <div className="mt-3">
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
              <span>Cardio semanal cubierto</span>
              <span>{r.cardioPct}%</span>
            </div>
            <ProgressBar value={r.cardioPct} />
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-mute">
            {r.cardioPct >= 100
              ? "Tu deporte ya cubre tu cardio semanal: el plan se enfoca en fuerza y recuperación."
              : `Te faltan ${Math.max(0, 150 - r.cardioEquivalent)} min de cardio moderado a la semana para cubrir la recomendación.`}{" "}
            Estas calorías ya se suman a tu gasto diario.
          </p>
        </>
      )}
    </Card>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl bg-bg/60 px-3 py-2">
      <Label className="text-[9px] tracking-[0.15em]">{label}</Label>
      <div className="mt-0.5 font-display text-[18px] tracking-tight text-flame">
        {value}
        {unit && <span className="ml-1 font-mono text-[9px] text-mute">{unit}</span>}
      </div>
    </div>
  );
}
