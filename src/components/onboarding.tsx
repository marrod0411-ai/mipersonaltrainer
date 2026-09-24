import { CARDIO_OPTIONS } from "@/lib/cardio";
import { useMemo, useState } from "react";
import { Card, Chip, FlameButton, Label, Plate, Screen } from "@/components/ui-kit";
import { MeasureGuide } from "@/components/measure-guide";
import { GOALS, GYMS, LEVELS, SPORTS } from "@/lib/training";
import type { GoalId, GymId, LevelId, Profile, SportId } from "@/lib/training";
import { analyzeBody } from "@/lib/body";
import type { SexId } from "@/lib/body";
import { requestNotifications } from "@/lib/reminders";

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"];
const STEPS = 8;

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
          className="w-full bg-transparent font-display text-[22px] tracking-tight text-ink outline-none placeholder:text-mute/50"
        />
        {suffix && <span className="ml-1 font-mono text-[10px] text-mute">{suffix}</span>}
      </div>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: (p: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<GoalId>("masa_muscular");
  const [level, setLevel] = useState<LevelId>("intermedio");
  const [sport, setSport] = useState<SportId>("ninguno");
  const [cardioPrefs, setCardioPrefs] = useState<string[]>([]);
  const [gym, setGym] = useState<GymId>("completo");
  const [bodyWeight, setBodyWeight] = useState(75);
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [reminderTime, setReminderTime] = useState("18:30");
  const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 4, 5]);

  const [sex, setSex] = useState<SexId>("hombre");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [neck, setNeck] = useState<number | undefined>(undefined);
  const [waist, setWaist] = useState<number | undefined>(undefined);
  const [hip, setHip] = useState<number | undefined>(undefined);

  const [bodyFat, setBodyFat] = useState<number | undefined>(undefined);
  const [water, setWater] = useState<number | undefined>(undefined);
  const [muscleMass, setMuscleMass] = useState<number | undefined>(undefined);
  const [visceral, setVisceral] = useState<number | undefined>(undefined);

  const known = { bodyFat, water, muscleMass, visceral };

  const readout = useMemo(
    () =>
      analyzeBody(
        { sex, age, height, neck, waist, hip, bodyWeight },
        known,
        goal,
        level,
        daysPerWeek,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sex, age, height, neck, waist, hip, bodyWeight, bodyFat, water, muscleMass, visceral, goal, level, daysPerWeek],
  );

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
      cardioPrefs,
      gym,
      bodyWeight,
      daysPerWeek,
      reminderTime,
      reminderDays,
      sex,
      age,
      height,
      neck,
      waist,
      hip,
      known: { bodyFat, water, muscleMass, visceral },
    });
  };

  return (
    <Screen>
      <header className="flex items-center justify-between px-5 pb-6 pt-8 rise">
        <div>
          <div className="font-display text-[11px] tracking-[0.25em] text-flame">
            PASO {step + 1} DE {STEPS}
          </div>
          <h1 className="font-display text-[30px] leading-none tracking-tight text-balance">
            MI PERSONAL TRAINER
          </h1>
        </div>
        <div className="flex items-end gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Plate key={i} size={i === Math.round((step / (STEPS - 1)) * 3) ? 30 : 20} active={i <= (step / (STEPS - 1)) * 3} />
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
          <Card className="rise">
            <Label className="mb-2">Sexo</Label>
            <div className="flex gap-2">
              {(["hombre", "mujer"] as SexId[]).map((s) => (
                <Chip
                  key={s}
                  active={sex === s}
                  onClick={() => setSex(s)}
                  className="flex-1 text-center font-display text-[15px]"
                >
                  {s.toUpperCase()}
                </Chip>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <NumberField label="Estatura" value={height} onChange={setHeight} suffix="CM" placeholder="175" />
              <NumberField label="Edad" value={age} onChange={setAge} suffix="AÑOS" placeholder="30" />
            </div>
            <div className="mt-3 flex gap-2">
              <NumberField label="Cuello" value={neck} onChange={setNeck} suffix="CM" placeholder="38" />
              <NumberField label="Cintura" value={waist} onChange={setWaist} suffix="CM" placeholder="84" />
            </div>
            {sex === "mujer" && (
              <div className="mt-3 flex gap-2">
                <NumberField label="Cadera" value={hip} onChange={setHip} suffix="CM" placeholder="98" />
              </div>
            )}
            <MeasureGuide sex={sex} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-bg/60 px-3 py-2">
                <Label className="text-[9px]">Grasa estimada</Label>
                <div className="font-display text-[22px] tracking-tight text-flame">
                  {readout.bodyFat !== null ? `${readout.bodyFat}%` : "—"}
                </div>
              </div>
              <div className="rounded-2xl bg-bg/60 px-3 py-2">
                <Label className="text-[9px]">IMC</Label>
                <div className="font-display text-[22px] tracking-tight">
                  {readout.bmi ?? "—"}
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="rise">
            <Label>¿Ya tienes tus datos medidos?</Label>
            <p className="mt-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.13em] text-mute">
              Opcional. Si tienes báscula de bioimpedancia o un estudio, ponlos y los uso con
              prioridad.
            </p>
            <div className="mt-4 flex gap-2">
              <NumberField label="Grasa" value={bodyFat} onChange={setBodyFat} suffix="%" placeholder="18" />
              <NumberField label="Agua" value={water} onChange={setWater} suffix="%" placeholder="58" />
            </div>
            <div className="mt-3 flex gap-2">
              <NumberField label="Masa muscular" value={muscleMass} onChange={setMuscleMass} suffix="KG" placeholder="34" />
              <NumberField label="Grasa visceral" value={visceral} onChange={setVisceral} placeholder="6" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-bg/60 px-3 py-2">
                <Label className="text-[9px]">Calorías objetivo</Label>
                <div className="font-display text-[22px] tracking-tight text-flame">
                  {readout.calories ?? "—"}
                </div>
              </div>
              <div className="rounded-2xl bg-bg/60 px-3 py-2">
                <Label className="text-[9px]">Proteína</Label>
                <div className="font-display text-[22px] tracking-tight">
                  {readout.protein ? `${readout.protein} g` : "—"}
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
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

        {step === 4 && (
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

        {step === 5 && (
          <div className="rise">
            <Label className="mb-2">¿Dónde entrenas?</Label>
            <div className="flex flex-col gap-2">
              {GYMS.map((g) => (
                <Chip
                  key={g.id}
                  active={gym === g.id}
                  onClick={() => setGym(g.id)}
                  className="px-4 py-3"
                >
                  <div className="font-display text-[18px] tracking-tight">
                    {g.label.toUpperCase()}
                  </div>
                  <div className="font-mono text-[10px] opacity-70">{g.blurb}</div>
                </Chip>
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.13em] text-mute">
              Según esto elijo máquinas, poleas y agarres que sí tengas disponibles.
            </p>
          </div>
        )}

        {step === 6 && (
          <div className="rise">
            <Label className="mb-1">¿Con qué quieres empezar la semana?</Label>
            <p className="mb-3 text-[12px] text-mute">
              Tu primer día será esa parte del cuerpo y el resto de la semana se ordena a partir de ahí para que todo quede equilibrado.
            </p>
            <StartFocusPicker value={startFocus} onChange={setStartFocus} />
            <Label className="mb-1 mt-6">¿Qué cardio te gusta más?</Label>
            <p className="mb-3 text-[12px] text-mute">Elige todos los que quieras. Los iré rotando cada semana.</p>
            <div className="grid grid-cols-2 gap-2">
              {CARDIO_OPTIONS.map((c) => (
                <Chip
                  key={c.id}
                  active={cardioPrefs.includes(c.id)}
                  onClick={() =>
                    setCardioPrefs((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))
                  }
                  className="px-3 py-2.5"
                >
                  <div className="font-display text-[14px] leading-tight tracking-tight">{c.label.toUpperCase()}</div>
                  <div className="font-mono text-[9px] opacity-70">{c.blurb}</div>
                </Chip>
              ))}
            </div>
          </div>
        )}

        {step === 7 && (
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
        <FlameButton onClick={() => (step === STEPS - 1 ? finish() : setStep(step + 1))}>
          {step === STEPS - 1 ? "CREAR MI PLAN" : "SIGUIENTE"}
        </FlameButton>
      </div>
    </Screen>
  );
}
