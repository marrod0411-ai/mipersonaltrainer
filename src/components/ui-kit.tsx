import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Screen({ children }: { children?: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-bg pb-24 text-ink">{children}</div>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.2em] text-mute",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[28px] bg-card p-5 ring-1 ring-black/40", className)}>
      {children}
    </div>
  );
}

export function Plate({
  size = 28,
  active = false,
  className,
  children,
}: {
  size?: number;
  active?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "grid place-items-center rounded-full",
        active ? "plate-active" : "plate",
        className,
      )}
    >
      <div
        style={{ width: Math.max(6, size * 0.3), height: Math.max(6, size * 0.3) }}
        className="plate-hole absolute rounded-full"
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function Chip({
  active,
  onClick,
  className,
  children,
  as = "button",
}: {
  active?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  as?: "button" | "div";
}) {
  const classes = cn(
    "rounded-2xl px-3 py-2 text-left transition-transform active:translate-y-px",
    active ? "chip-active text-white" : "chip text-ink",
    className,
  );
  if (as === "div") return <div className={classes}>{children}</div>;
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function FlameButton({
  onClick,
  children,
  className,
  type = "button",
}: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl chip-active py-3 font-display text-[15px] tracking-[0.1em] text-white transition-transform active:translate-y-px",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="bar mt-4 h-3 overflow-hidden rounded-full">
      <div
        className="fill h-full rounded-full sweep"
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </div>
  );
}

const TABS = [
  { to: "/", label: "HOY" },
  { to: "/plan", label: "PLAN" },
  { to: "/progreso", label: "PROGRESO" },
  { to: "/perfil", label: "PERFIL" },
] as const;

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line/60 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[430px] items-center justify-between px-6 py-3">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="font-display text-[12px] tracking-[0.14em] text-mute"
            activeProps={{ className: "text-flame" }}
            activeOptions={{ exact: t.to === "/" }}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
