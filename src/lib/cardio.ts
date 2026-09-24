import type { Exercise, MethodId } from "./training";

export type CardioId =
  | "hiit_bici"
  | "hiit_escaladora"
  | "hiit_caminadora"
  | "intervalos_caminadora"
  | "eliptica"
  | "remo"
  | "boxeo"
  | "campo_abierto"
  | "trotar"
  | "caminar"
  | "cuerda"
  | "funcional"
  | "natacion"
  | "baile";

export type CardioOption = {
  id: CardioId;
  label: string;
  blurb: string;
  method: MethodId;
  minutes: number;
  exercises: Exercise[];
};

export const CARDIO_OPTIONS: CardioOption[] = [
  { id: "hiit_bici", label: "HIIT en bicicleta", blurb: "Sprints cortos y recuperación", method: "hiit", minutes: 24, exercises: [
    { name: "Sprint en bicicleta estática", sets: 8, reps: "25 s máx / 75 s suave", restSec: 75 },
    { name: "Bicicleta de aire", sets: 4, reps: "30 s", restSec: 60 } ] },
  { id: "hiit_escaladora", label: "HIIT en escaladora", blurb: "Glúteo y pulmones al máximo", method: "hiit", minutes: 25, exercises: [
    { name: "Escaladora rápida", sets: 8, reps: "40 s fuerte / 60 s suave", restSec: 60 } ] },
  { id: "hiit_caminadora", label: "HIIT en caminadora", blurb: "Sprints en cinta", method: "hiit", minutes: 24, exercises: [
    { name: "Sprint en caminadora", sets: 8, reps: "20 s / 60 s caminando", restSec: 60 } ] },
  { id: "intervalos_caminadora", label: "Intervalos en caminadora", blurb: "Inclinación y ritmo variable", method: "cardio_intervalos", minutes: 35, exercises: [
    { name: "Cinta en cuesta", sets: 6, reps: "3 min fuerte / 2 min suave", restSec: 120 } ] },
  { id: "eliptica", label: "Elíptica", blurb: "Bajo impacto, rodillas felices", method: "cardio_intervalos", minutes: 30, exercises: [
    { name: "Elíptica por intervalos", sets: 5, reps: "2 min", restSec: 90 } ] },
  { id: "remo", label: "Remo", blurb: "Cardio de cuerpo completo", method: "hiit", minutes: 25, exercises: [
    { name: "Remo ergómetro", sets: 6, reps: "30 s fuerte", restSec: 60 } ] },
  { id: "boxeo", label: "Boxeo", blurb: "Saco, sombra y combinaciones", method: "hiit", minutes: 30, exercises: [
    { name: "Boxeo en saco", sets: 6, reps: "2 min rounds", restSec: 60 },
    { name: "Boxeo de sombra", sets: 3, reps: "2 min", restSec: 45 } ] },
  { id: "campo_abierto", label: "HIIT en campo abierto", blurb: "Sprints, cuestas y escaleras", method: "hiit", minutes: 28, exercises: [
    { name: "Sprints en campo", sets: 8, reps: "60 m", restSec: 75 },
    { name: "Subida de escaleras", sets: 5, reps: "1 tramo", restSec: 60 } ] },
  { id: "trotar", label: "Salir a trotar", blurb: "Ritmo constante al aire libre", method: "liss", minutes: 35, exercises: [
    { name: "Trote continuo", sets: 1, reps: "30–40 min", restSec: 0 } ] },
  { id: "caminar", label: "Salir a caminar", blurb: "Caminata rápida, zona 2", method: "liss", minutes: 45, exercises: [
    { name: "Caminata rápida", sets: 1, reps: "40–50 min", restSec: 0 } ] },
  { id: "cuerda", label: "Saltar la cuerda", blurb: "Coordinación y quema", method: "hiit", minutes: 20, exercises: [
    { name: "Salto a la cuerda", sets: 8, reps: "45 s", restSec: 45 } ] },
  { id: "funcional", label: "Circuito funcional", blurb: "Burpees, kettlebell, battle rope", method: "hiit", minutes: 26, exercises: [
    { name: "Burpees", sets: 5, reps: "30 s", restSec: 45 },
    { name: "Swing con kettlebell", sets: 5, reps: "15", restSec: 45 },
    { name: "Battle rope", sets: 5, reps: "20 s", restSec: 45 } ] },
  { id: "natacion", label: "Natación", blurb: "Cero impacto articular", method: "cardio_intervalos", minutes: 35, exercises: [
    { name: "Nado por series", sets: 8, reps: "50 m", restSec: 45 } ] },
  { id: "baile", label: "Baile / aeróbicos", blurb: "Cardio divertido", method: "liss", minutes: 40, exercises: [
    { name: "Clase de baile o aeróbicos", sets: 1, reps: "40 min", restSec: 0 } ] },
];

export function cardioOption(id: string) {
  return CARDIO_OPTIONS.find((c) => c.id === id);
}
