import { useState } from "react";
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try { return JSON.parse(localStorage.getItem(key) ?? "") as T; } catch { return initial; }
  });
  function set(v: T) {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  }
  return [value, set] as const;
}
