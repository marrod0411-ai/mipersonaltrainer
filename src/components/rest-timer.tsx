import { useEffect, useRef, useState } from "react";
import { Chip, Label } from "@/components/ui-kit";

function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
    setTimeout(() => void ctx.close(), 900);
  } catch {
    /* silencio si el navegador bloquea el audio */
  }
}

const fmt = (s: number) =>
  `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

/**
 * Rest countdown between sets. Mount with a key that changes per set so it restarts.
 */
export function RestTimer({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone?: () => void;
}) {
  const [total, setTotal] = useState(seconds);
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  const rang = useRef(false);

  useEffect(() => {
    if (!running || left <= 0) return;
    const id = setInterval(() => setLeft((v) => v - 1), 1000);
    return () => clearInterval(id);
  }, [running, left]);

  useEffect(() => {
    if (left > 0 || rang.current) return;
    rang.current = true;
    beep();
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    onDone?.();
  }, [left, onDone]);

  const pct = total > 0 ? (left / total) * 100 : 0;
  const finished = left <= 0;
  const R = 52;
  const C = 2 * Math.PI * R;

  const add = (s: number) => {
    rang.current = false;
    setTotal((t) => t + s);
    setLeft((v) => Math.max(0, v) + s);
    setRunning(true);
  };

  return (
    <div className="rounded-[28px] bg-card p-5 ring-1 ring-black/40">
      <div className="flex items-center justify-between">
        <Label className="tracking-[0.18em]">
          {finished ? "Descanso listo" : "Descanso entre series"}
        </Label>
        <Label className="text-[9px] tracking-[0.15em]">Meta {fmt(total)}</Label>
      </div>

      <div className="mt-3 flex items-center gap-5">
        <div className="relative grid h-[124px] w-[124px] shrink-0 place-items-center">
          <svg viewBox="0 0 120 120" className="absolute h-full w-full -rotate-90">
            <circle cx="60" cy="60" r={R} fill="none" stroke="currentColor" strokeWidth="8" className="text-bg" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (C * pct) / 100}
              className="text-flame transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="relative text-center">
            <div className="font-display text-[30px] leading-none tracking-tight">
              {fmt(Math.max(0, left))}
            </div>
            <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-mute">
              {finished ? "¡A la siguiente!" : running ? "en marcha" : "en pausa"}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <Chip
            onClick={() => (finished ? add(30) : setRunning((r) => !r))}
            className="w-full text-center font-display text-[14px]"
          >
            {finished ? "+ 30 SEG" : running ? "PAUSAR" : "SEGUIR"}
          </Chip>
          <div className="flex gap-2">
            <Chip onClick={() => add(15)} className="flex-1 text-center font-display text-[14px]">
              + 15
            </Chip>
            <Chip
              onClick={() => {
                setLeft(0);
                setRunning(false);
              }}
              className="flex-1 text-center font-display text-[14px]"
            >
              SALTAR
            </Chip>
          </div>
        </div>
      </div>
    </div>
  );
}
