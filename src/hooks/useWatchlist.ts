"use client";

import { useState, useEffect, useCallback } from "react";
import { WatchlistItem, WatchlistStatus } from "@/lib/types";

const STORAGE_KEY = "animehub_watchlist";
const EVENT_NAME = "animehub:watchlist-change";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  const loadWatchlist = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setWatchlist(parsed);
        }
      } else {
        setWatchlist([]);
      }
    } catch (e) {
      console.error("Failed to read watchlist from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();

    const handleStorage = () => loadWatchlist();
    window.addEventListener(EVENT_NAME, handleStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(EVENT_NAME, handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadWatchlist]);

  // Add or update an anime in watchlist
  const addToWatchlist = useCallback(
    (item: Omit<WatchlistItem, "addedAt">) => {
      if (typeof window === "undefined") return;
      try {
        const newItem: WatchlistItem = {
          ...item,
          addedAt: Date.now(),
        };

        const existingRaw = localStorage.getItem(STORAGE_KEY);
        let list: WatchlistItem[] = existingRaw ? JSON.parse(existingRaw) : [];
        if (!Array.isArray(list)) list = [];

        // Replace if already exists or add new
        list = [newItem, ...list.filter((w) => w.animeId !== item.animeId)];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        setWatchlist(list);
        window.dispatchEvent(new Event(EVENT_NAME));
      } catch (e) {
        console.error("Failed to add to watchlist", e);
      }
    },
    []
  );

  // Remove anime from watchlist
  const removeFromWatchlist = useCallback((animeId: number) => {
    if (typeof window === "undefined") return;
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      let list: WatchlistItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      list = list.filter((w) => w.animeId !== animeId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setWatchlist(list);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error("Failed to remove from watchlist", e);
    }
  }, []);

  // Update status (e.g. from 'plan_to_watch' to 'watching')
  const updateStatus = useCallback((animeId: number, status: WatchlistStatus) => {
    if (typeof window === "undefined") return;
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      let list: WatchlistItem[] = existingRaw ? JSON.parse(existingRaw) : [];
      list = list.map((w) => (w.animeId === animeId ? { ...w, status, addedAt: Date.now() } : w));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setWatchlist(list);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error("Failed to update watchlist status", e);
    }
  }, []);

  // Check if anime is in watchlist
  const getItemStatus = useCallback(
    (animeId: number): WatchlistStatus | null => {
      const found = watchlist.find((w) => w.animeId === animeId);
      return found ? found.status : null;
    },
    [watchlist]
  );

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    updateStatus,
    getItemStatus,
  };
}
