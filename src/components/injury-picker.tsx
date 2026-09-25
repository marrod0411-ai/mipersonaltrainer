import { Chip, Label } from "@/components/ui-kit";
import { INJURY_AREAS } from "@/lib/injuries";
import type { InjuryArea, Injuries, InjuryStatus } from "@/lib/injuries";

export function InjuryPicker({
  value,
  onChange,
}: {
  value: Injuries;
  onChange: (v: Injuries) => void;
}) {
  const statusOf = (a: InjuryArea) => value.items.find((i) => i.area === a)?.status;
  const set = (a: InjuryArea, s: InjuryStatus | undefined) =>
    onChange({
      ...value,
      items: s
        ? [...value.items.filter((i) => i.area !== a), { area: a, status: s }]
        : value.items.filter((i) => i.area !== a),
    });

  return (
    <div>
      <div className="flex flex-col gap-2">
        {INJURY_AREAS.map((a) => {
          const st = statusOf(a.id);
          return (
            <div key={a.id} className="rounded-2xl bg-bg/60 p-3">
              <div className="font-display text-[14px] tracking-tight">{a.label.toUpperCase()}</div>
              <div className="font-mono text-[9px] text-mute">{a.examples}</div>
              <div className="mt-2 flex gap-1.5">
                {(
                  [
                    [undefined, "Sin lesión"],
                    ["pasada", "La tuve"],
                    ["actual", "Me molesta hoy"],
                  ] as const
                ).map(([s, l]) => (
                  <Chip
                    key={l}
                    active={st === s}
                    onClick={() => set(a.id, s)}
                    className="flex-1 px-2 py-1.5 text-center font-display text-[11px]"
                  >
                    {l.toUpperCase()}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Label className="mb-1 mt-4 text-[9px]">Cuéntame más (opcional)</Label>
      <textarea
        value={value.notes}
        maxLength={400}
        onChange={(e) => onChange({ ...value, notes: e.target.value })}
        placeholder="Ej: operación de LCA rodilla derecha en 2023, hernia L5-S1…"
        className="h-20 w-full rounded-2xl bg-bg/60 p-3 text-[13px] text-ink outline-none placeholder:text-mute/50"
      />
      <p className="mt-2 text-[12px] leading-relaxed text-mute">
        Cambio los ejercicios que cargan esas zonas por otros más seguros y agrego ejercicios para
        fortalecerlas. Si te duele hoy, consulta con un médico o fisioterapeuta antes de entrenar.
      </p>
    </div>
  );
}
