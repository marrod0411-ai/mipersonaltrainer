import { useState } from "react";
import { Card, Chip, FlameButton, Label, Plate, Screen } from "@/components/ui-kit";
import { GOALS, LEVELS, SPORTS } from "@/lib/training";
import type { GoalId, LevelId, Profile, SportId } from "@/lib/training";
import { requestNotifications } from "@/lib/reminders";

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<GoalId>("masa_muscular");
  const [level, setLevel] = useState<LevelId>("intermedio");
  const [sport, setSport] = useState<SportId>("ninguno");
  const [bodyWeight, setBodyWeight] = useState(75);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [reminderTime, setReminderTime] = useState("18:30");
  const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 4, 5]);

  const toggleDay = (d: number) =>
    setReminderDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort(),
    );

  const finish = async () => {
    await requestNotifications();
    onDone({
      name: name.trim() || "Atleta",
      goal,
      level,
      sport,
      bodyWeight,
      daysPerWeek,
      reminderTime,
      reminderDays,
    });
  };

  return (
    <Screen>
      <header className="flex items-center justify-between px-5 pb-6 pt-8 rise">
        <div>
          <div className="font-display text-[11px] tracking-[0.25em] text-flame">
            PASO {step + 1} DE 4
          </div>
          <h1 className="font-display text-[30px] leading-none tracking-tight text-balance">
            COACH DE HIERRO
          </h1>
        </div>
        <div className="flex items-end gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Plate key={i} size={i === step ? 30 : 20} active={i <= step} />
          ))}
        </div>
      </header>

      <div className="px-5">
        {step === 0 && (
          <Card className="rise">
            <Label>¿Cómo te llamas?</Label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="mt-2 w-full rounded-2xl bg-bg/60 px-4 py-3 font-display text-[20px] tracking-tight text-ink outline-none placeholder:text-mute/60"
            />
            <Label className="mt-5">Tu peso corporal</Label>
            <div className="mt-2 flex items-end gap-3">
              <div className="font-display text-[56px] leading-none tracking-tight">
                {bodyWeight}
              </div>
              <div className="pb-2 font-display text-[18px] text-mute">KG</div>
            </div>
            <input
              type="range"
              min={40}
              max={160}
              value={bodyWeight}
              onChange={(e) => setBodyWeight(Number(e.target.value))}
              className="mt-3 w-full accent-flame"
            />
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
              Con esto calculo tus cargas de arranque
            </p>
          </Card>
        )}

        {step === 1 && (
          <div className="rise">
            <Label className="mb-2">Tu objetivo principal</Label>
            <div className="grid grid-cols-2 gap-2">
              {GOALS.map((g) => (
                <Chip key={g.id} active={goal === g.id} onClick={() => setGoal(g.id)}>
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
        )}

        {step === 2 && (
          <div className="rise">
            <Label className="mb-2">Tu nivel de entrenamiento</Label>
            <div className="flex flex-col gap-2">
              {LEVELS.map((l) => (
                <Chip
                  key={l.id}
                  active={level === l.id}
                  onClick={() => {
                    setLevel(l.id);
                    setDaysPerWeek(l.sessions);
                  }}
                  className="px-4 py-3"
                >
                  <div className="font-display text-[18px] tracking-tight">
                    {l.label.toUpperCase()}
                  </div>
                  <div className="font-mono text-[10px] opacity-70">{l.blurb}</div>
                </Chip>
              ))}
            </div>
            <Label className="mb-2 mt-5">Días por semana</Label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((d) => (
                <Chip
                  key={d}
                  active={daysPerWeek === d}
                  onClick={() => setDaysPerWeek(d)}
                  className="flex-1 text-center font-display text-[18px]"
                >
                  {d}
                </Chip>
              ))}
            </div>
            <Label className="mb-2 mt-5">¿Practicas algún deporte?</Label>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((s) => (
                <Chip
                  key={s.id}
                  active={sport === s.id}
                  onClick={() => setSport(s.id)}
                  className="rounded-full px-3 py-1.5 font-display text-[12px] tracking-[0.08em]"
                >
                  {s.label.toUpperCase()}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <Card className="rise">
            <Label>Recordatorio de entrenamiento</Label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-bg/60 px-4 py-3 font-display text-[28px] tracking-tight text-ink outline-none"
            />
            <Label className="mb-2 mt-5">Días con aviso</Label>
            <div className="flex gap-2">
              {DAY_LABELS.map((d, i) => (
                <Chip
                  key={i}
                  active={reminderDays.includes(i)}
                  onClick={() => toggleDay(i)}
                  className="flex-1 text-center font-display text-[15px]"
                >
                  {d}
                </Chip>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.13em] text-mute">
              Te avisaré en este celular a la hora elegida. Mantén la app abierta o agrégala a tu
              pantalla de inicio.
            </p>
          </Card>
        )}
      </div>

      <div className="mt-6 flex gap-2 px-5">
        {step > 0 && (
          <Chip onClick={() => setStep(step - 1)} className="px-5 font-display text-[14px]">
            ATRÁS
          </Chip>
        )}
        <FlameButton onClick={() => (step === 3 ? finish() : setStep(step + 1))}>
          {step === 3 ? "CREAR MI PLAN" : "SIGUIENTE"}
        </FlameButton>
      </div>
    </Screen>
  );
}
