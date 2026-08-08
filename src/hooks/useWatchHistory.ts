"use client";

import { useState, useEffect, useCallback } from "react";
import { WatchHistoryItem } from "@/lib/types";

const STORAGE_KEY = "animehub_watch_history";
const EVENT_NAME = "animehub:history-change";

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  const loadHistory = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error("Failed to read watch history from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const handleStorage = () => loadHistory();
    window.addEventListener(EVENT_NAME, handleStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadHistory]);

  // Save or update an item in history
  const updateProgress = useCallback(
    (item: Omit<WatchHistoryItem, "updatedAt" | "progressPercent">) => {
      if (typeof window === "undefined") return;
      try {
        const progressPercent = item.duration > 0 ? Math.min(100, Math.round((item.currentTime / item.duration) * 100)) : 0;
        const newItem: WatchHistoryItem = {
          ...item,
          progressPercent,
          updatedAt: Date.now(),
        };

        const existingRaw = localStorage.getItem(STORAGE_KEY);
        let list: WatchHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
        if (!Array.isArray(list)) list = [];

        // Remove old entry for this anime and prepend updated one
        list = [newItem, ...list.filter((h) => h.animeId !== item.animeId)];

        // Limit to max 50 recent items
        if (list.length > 50) {
          list = list.slice(0, 50);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        setTimeout(() => {
          setHistory(list);
          window.dispatchEvent(new Event(EVENT_NAME));
        }, 0);
      } catch (e) {
        console.error("Failed to save watch history", e);
      }
    },
    []
  );

  // Get progress for a specific anime
  const getAnimeProgress = useCallback(
    (animeId: number): WatchHistoryItem | undefined => {
      return history.find((h) => h.animeId === animeId);
    },
    [history]
  );

  // Remove a single anime from history
  const removeFromHistory = useCallback((animeId: number) => {
    if (typeof window === "undefined") return;
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      let list: WatchHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      list = list.filter((h) => h.animeId !== animeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setHistory(list);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error("Failed to remove item from watch history", e);
    }
  }, []);

  // Clear all history
  const clearHistory = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error("Failed to clear watch history", e);
    }
  }, []);

  return {
    history,
    isLoaded,
    updateProgress,
    getAnimeProgress,
    removeFromHistory,
    clearHistory,
  };
}
