import { demoTuitions } from "@/lib/mock-data";
import { readClientStore, writeClientStore } from "@/lib/client-store";
import type { Tuition } from "@/types";

const customTuitionsKey = "mentorlagbe-demo-custom-tuitions";

// Local tuition helpers keep tutor CRUD and public discovery on one data source before API work.
export function getAllTuitions() {
  return [...demoTuitions, ...readClientStore<Tuition[]>(customTuitionsKey, [])];
}

export function createTuition(tuition: Tuition) {
  const current = readClientStore<Tuition[]>(customTuitionsKey, []);
  writeClientStore(customTuitionsKey, [tuition, ...current]);
}

export function updateTuition(id: string, updates: Partial<Tuition>) {
  const current = readClientStore<Tuition[]>(customTuitionsKey, []);
  writeClientStore(customTuitionsKey, current.map((item) => item._id === id ? { ...item, ...updates } : item));
}

export function deleteTuition(id: string) {
  const current = readClientStore<Tuition[]>(customTuitionsKey, []);
  writeClientStore(customTuitionsKey, current.filter((item) => item._id !== id));
}

export function customTuitionCountBy(email: string) {
  return readClientStore<Tuition[]>(customTuitionsKey, []).filter((item) => item.tutorEmail === email).length;
}
