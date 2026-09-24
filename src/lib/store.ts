import { useCallback, useEffect, useState } from "react";
import type { Profile } from "./training";
import { pushCloud } from "./cloud-sync";

const PROFILE_KEY = "pt.profile.v1";
const LOG_KEY = "pt.log.v1";

export type SetLog = {
  id: string;
  date: string;
  session: string;
  exercise: string;
  setIndex: number;
  kg: number;
  reps: number;
};

export type LogState = {
  week: number;
  completedSessions: string[];
  sets: SetLog[];
};

const emptyLog: LogState = { week: 1, completedSessions: [], sets: [] };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(PROFILE_KEY);
      setProfile(raw ? (JSON.parse(raw) as Profile) : null);
    } catch {
      setProfile(null);
    }
    setLoaded(true);
  }, []);

  const save = useCallback((next: Profile) => {
    setProfile(next);
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    pushCloud();
  }, []);

  const clear = useCallback(() => {
    setProfile(null);
    window.localStorage.removeItem(PROFILE_KEY);
    window.localStorage.removeItem(LOG_KEY);
  }, []);

  return { profile, loaded, save, clear };
}

export function useLog() {
  const [log, setLog] = useState<LogState>(emptyLog);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLog(read<LogState>(LOG_KEY, emptyLog));
    setLoaded(true);
  }, []);

  const persist = useCallback((next: LogState) => {
    setLog(next);
    window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
    pushCloud();
  }, []);

  const addSet = useCallback(
    (entry: Omit<SetLog, "id" | "date">) => {
      setLog((prev) => {
        const next: LogState = {
          ...prev,
          sets: [
            ...prev.sets,
            { ...entry, id: crypto.randomUUID(), date: new Date().toISOString() },
          ],
        };
        window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
    pushCloud();
        return next;
      });
    },
    [],
  );

  const completeSession = useCallback((title: string) => {
    setLog((prev) => {
      const key = `${new Date().toISOString().slice(0, 10)}|${title}`;
      if (prev.completedSessions.includes(key)) return prev;
      const next = { ...prev, completedSessions: [...prev.completedSessions, key] };
      window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
    pushCloud();
      return next;
    });
  }, []);

  const setWeek = useCallback((week: number) => {
    setLog((prev) => {
      const next = { ...prev, week: Math.max(1, week) };
      window.localStorage.setItem(LOG_KEY, JSON.stringify(next));
    pushCloud();
      return next;
    });
  }, []);

  return { log, loaded, persist, addSet, completeSession, setWeek };
}

export function bestSetFor(sets: SetLog[], exercise: string) {
  return sets
    .filter((s) => s.exercise === exercise)
    .reduce<SetLog | null>((best, s) => (!best || s.kg > best.kg ? s : best), null);
}

export function isSessionDoneToday(log: LogState, title: string) {
  return log.completedSessions.includes(`${new Date().toISOString().slice(0, 10)}|${title}`);
}
