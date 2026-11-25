"use client";

import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";

// Loads backend-owned data while keeping request state and failures visible to each page.
export function useApiData<T>(path: string | null, initialValue: T) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<
    { key: string; data: T; error: null } | { key: string; error: string }
    | null
  >(null);
  const requestKey = path ? `${path}:${revision}` : "";

  useEffect(() => {
    let active = true;
    if (!path) return () => { active = false; };
    api<T>(path)
      .then((data) => { if (active) setResult({ key: requestKey, data, error: null }); })
      .catch((cause: unknown) => {
        if (active) setResult({ key: requestKey, error: getErrorMessage(cause) });
      });
    return () => { active = false; };
  }, [path, requestKey]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const isCurrent = result?.key === requestKey;
  // Keep the last successful payload visible while a new query is in flight,
  // so filter options and results do not flash empty on every keystroke.
  return {
    data: path && result && "data" in result ? result.data : initialValue,
    loading: Boolean(path) && !isCurrent,
    error: isCurrent ? result.error : null,
    reload,
  };
}
