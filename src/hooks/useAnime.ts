"use client";

import useSWR from "swr";
import type { JikanAnime, JikanResponse } from "@/lib/types";

/**
 * SWR fetcher that queries our internal cached API routes
 */
async function internalSwrFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Hook: Search anime with debounced query via internal API
 */
export function useAnimeSearch(query: string, page = 1) {
  const shouldFetch = query.trim().length >= 2;

  const { data, error, isLoading } = useSWR<JikanResponse<JikanAnime[]>>(
    shouldFetch
      ? `/api/search?q=${encodeURIComponent(query.trim())}&page=${page}&limit=20`
      : null,
    internalSwrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    results: data?.data ?? [],
    pagination: data?.pagination ?? null,
    isLoading: shouldFetch && isLoading,
    error,
  };
}

/**
 * Hook: Get anime detail by ID via internal API
 */
export function useAnimeDetail(id: number | null) {
  const { data, error, isLoading } = useSWR<{ data: JikanAnime; episodes: unknown[] }>(
    id ? `/api/anime/${id}` : null,
    internalSwrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    anime: data?.data ?? null,
    isLoading,
    error,
  };
}

/**
 * Hook: Quick search for navbar (instant dropdown)
 */
export function useQuickSearch(query: string) {
  const shouldFetch = query.trim().length >= 2;

  const { data, error, isLoading } = useSWR<JikanResponse<JikanAnime[]>>(
    shouldFetch
      ? `/api/search?q=${encodeURIComponent(query.trim())}&limit=6`
      : null,
    internalSwrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 4000,
    }
  );

  return {
    results: data?.data ?? [],
    isLoading: shouldFetch && isLoading,
    error,
  };
}
