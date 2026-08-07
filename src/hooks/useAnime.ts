"use client";

import useSWR from "swr";
import { clientFetch } from "@/lib/api";
import type { JikanAnime, JikanResponse } from "@/lib/types";

const JIKAN_BASE = "https://api.jikan.moe/v4";

/**
 * SWR fetcher that uses the full URL
 */
async function swrFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1200));
    const retry = await fetch(url);
    if (!retry.ok) throw new Error(`API error: ${retry.status}`);
    return retry.json();
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Hook: Search anime with debounced query
 */
export function useAnimeSearch(query: string, page = 1) {
  const shouldFetch = query.length >= 2;

  const { data, error, isLoading } = useSWR<JikanResponse<JikanAnime[]>>(
    shouldFetch
      ? `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&page=${page}&limit=20&order_by=score&sort=desc`
      : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
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
 * Hook: Get anime detail by ID
 */
export function useAnimeDetail(id: number | null) {
  const { data, error, isLoading } = useSWR<JikanResponse<JikanAnime>>(
    id ? `${JIKAN_BASE}/anime/${id}/full` : null,
    swrFetcher,
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
 * Hook: Quick search for navbar (limited results)
 */
export function useQuickSearch(query: string) {
  const shouldFetch = query.length >= 2;

  const { data, error, isLoading } = useSWR<JikanResponse<JikanAnime[]>>(
    shouldFetch
      ? `${JIKAN_BASE}/anime?q=${encodeURIComponent(query)}&limit=5&order_by=score&sort=desc`
      : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
    }
  );

  return {
    results: data?.data ?? [],
    isLoading: shouldFetch && isLoading,
    error,
  };
}
