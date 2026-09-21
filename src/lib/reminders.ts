import type { Profile } from "./training";

const KEY = "pt.reminder.last";

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotifications() {
  if (!notificationsSupported()) return "unsupported" as const;
  return Notification.requestPermission();
}

/**
 * Checks every minute whether the reminder time matches and fires a local
 * notification once per day.
 */
export function startReminderWatcher(profile: Profile, sessionTitle: string) {
  if (!notificationsSupported()) return () => {};

  const tick = () => {
    if (Notification.permission !== "granted") return;
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10);
    if (!profile.reminderDays.includes(now.getDay())) return;
    const [h, m] = profile.reminderTime.split(":").map(Number);
    if (now.getHours() !== h || now.getMinutes() !== m) return;
    if (window.localStorage.getItem(KEY) === stamp) return;
    window.localStorage.setItem(KEY, stamp);
    new Notification("Hora de entrenar", {
      body: `${sessionTitle} te espera. Toca la barra, no el reloj.`,
    });
  };

  const id = window.setInterval(tick, 30_000);
  tick();
  return () => window.clearInterval(id);
}

export function nextReminderLabel(profile: Profile) {
  const days = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
  const today = new Date().getDay();
  for (let i = 0; i < 7; i++) {
    const d = (today + i) % 7;
    if (profile.reminderDays.includes(d)) {
      return `${i === 0 ? "HOY" : days[d]} · ${profile.reminderTime}`;
    }
  }
  return "SIN RECORDATORIOS";
}
