import { Chip } from "@/components/ui-kit";
import { START_FOCUS } from "@/lib/training";
import type { StartFocusId } from "@/lib/training";

export function StartFocusPicker({
  value,
  onChange,
  daysPerWeek,
}: {
  value: StartFocusId;
  onChange: (v: StartFocusId) => void;
  daysPerWeek?: number;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {START_FOCUS.map((f) => (
          <Chip key={f.id} active={value === f.id} onClick={() => onChange(f.id)} className="px-3 py-2.5">
            <div className="font-display text-[14px] leading-tight tracking-tight">{f.label.toUpperCase()}</div>
            <div className="font-mono text-[9px] opacity-70">{f.blurb}</div>
          </Chip>
        ))}
      </div>
      {daysPerWeek !== undefined && daysPerWeek <= 3 && value !== "auto" && (
        <p className="mt-2 text-[11px] text-mute">
          Con {daysPerWeek} días cada sesión es de cuerpo completo, así que trabajas todo desde el primer día.
        </p>
      )}
    </div>
  );
}
