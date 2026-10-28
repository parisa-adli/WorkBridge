import { useEffect, useState } from "react";

export default function useLocalStorageState<T>(key: string, initialState: T) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key) || null;
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;
}
