const storageEvent = "mentorlagbe:storage";

// Small typed localStorage helpers support frontend demos before backend persistence is ready.
export function readClientStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeClientStore<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(storageEvent, { detail: { key } }));
  }
}

export function removeClientStore(key: string) {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent(storageEvent, { detail: { key } }));
  }
}

export function subscribeClientStore(key: string | "*", callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const handleCustom = (event: Event) => {
    const changedKey = (event as CustomEvent<{ key: string }>).detail?.key;
    if (key === "*" || changedKey === key) callback();
  };
  const handleStorage = (event: StorageEvent) => { if (key === "*" || event.key === key) callback(); };
  window.addEventListener(storageEvent, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => { window.removeEventListener(storageEvent, handleCustom); window.removeEventListener("storage", handleStorage); };
}

export function getClientStoreSnapshot<T>(key: string, fallback: T) {
  if (typeof window === "undefined") return JSON.stringify(fallback);
  return window.localStorage.getItem(key) ?? JSON.stringify(fallback);
}
