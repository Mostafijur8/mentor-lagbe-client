import { demoTuitions } from "@/lib/mock-data";
import { readClientStore, subscribeClientStore, writeClientStore } from "@/lib/client-store";
import type { Tuition } from "@/types";

const customTuitionsKey = "mentorlagbe-demo-custom-tuitions";
const overridesKey = "mentorlagbe-demo-tuition-updates";
const deletedKey = "mentorlagbe-demo-deleted-tuitions";

// Local tuition helpers keep tutor CRUD and public discovery on one data source before API work.
export function getAllTuitions() {
  const updates = readClientStore<Record<string, Partial<Tuition>>>(overridesKey, {});
  const deleted = readClientStore<string[]>(deletedKey, []);
  return [...demoTuitions, ...readClientStore<Tuition[]>(customTuitionsKey, [])]
    .filter((item) => !deleted.includes(item._id))
    .map((item) => ({ ...item, ...updates[item._id] }));
}

export function subscribeTuitions(callback: () => void) {
  return subscribeClientStore("*", callback);
}

export function getAllTuitionsSnapshot() {
  return JSON.stringify(getAllTuitions());
}

export function createTuition(tuition: Tuition) {
  const current = readClientStore<Tuition[]>(customTuitionsKey, []);
  writeClientStore(customTuitionsKey, [tuition, ...current]);
}

export function updateTuition(id: string, updates: Partial<Tuition>) {
  const current = readClientStore<Record<string, Partial<Tuition>>>(overridesKey, {});
  writeClientStore(overridesKey, { ...current, [id]: { ...current[id], ...updates } });
}

export function deleteTuition(id: string) {
  const current = readClientStore<Tuition[]>(customTuitionsKey, []);
  writeClientStore(customTuitionsKey, current.filter((item) => item._id !== id));
  const deleted = readClientStore<string[]>(deletedKey, []);
  if (!deleted.includes(id)) writeClientStore(deletedKey, [...deleted, id]);
}

export function customTuitionCountBy(email: string) {
  return readClientStore<Tuition[]>(customTuitionsKey, []).filter((item) => item.tutorEmail === email).length;
}
