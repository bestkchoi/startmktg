import { useCallback, useEffect, useState } from "react";

export type HistoryItem = {
  id: string;
  baseUrl: string;
  finalUrl: string;
  createdAt: string;
};

const STORAGE_KEY = "utm_history";

const readFromStorage = (): HistoryItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as HistoryItem[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
};

export const useLocalHistory = () => {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(readFromStorage());
  }, []);

  const add = useCallback((item: HistoryItem) => {
    setItems((prev) => {
      const next = [item, ...prev].slice(0, 5);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setItems([]);
  }, []);

  return { items, add, clear };
};


