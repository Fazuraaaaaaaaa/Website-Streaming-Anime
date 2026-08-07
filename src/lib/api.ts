// ============================================
// Jikan API v4 — Fetcher Functions
// https://docs.api.jikan.moe/
// Rate Limit: 3 requests/second, 60 requests/minute
// ============================================

import type { JikanAnime, JikanEpisode, JikanResponse, GenreData } from "./types";

const JIKAN_BASE = "https://api.jikan.moe/v4";

/**
 * Generic fetcher with error handling and retry
 */
async function jikanFetch<T>(
  endpoint: string,
  options?: { revalidate?: number | false }
): Promise<T> {
  const url = `${JIKAN_BASE}${endpoint}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const fetchOptions: RequestInit & { next?: { revalidate?: number | false } } = {};

      if (options?.revalidate === false) {
        // No cache — always fresh
        fetchOptions.cache = "no-store";
      } else {
        fetchOptions.next = {
          revalidate: options?.revalidate ?? 300,
        };
      }

      const res = await fetch(url, fetchOptions);

      if (res.status === 429) {
        // Rate limited — exponential backoff
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        continue;
      }

      if (!res.ok) {
        if (attempt < 3 && res.status >= 500) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        throw new Error(`Jikan API error: ${res.status} ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      if (attempt === 3) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }

  throw new Error(`Failed after 3 attempts fetching ${endpoint}`);
}

/**
 * Client-side fetcher for SWR
 */
export async function clientFetch<T>(endpoint: string): Promise<T> {
  const url = `${JIKAN_BASE}${endpoint}`;
  const res = await fetch(url);

  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1500));
    const retryRes = await fetch(url);
    if (!retryRes.ok) throw new Error(`API error: ${retryRes.status}`);
    return retryRes.json();
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ============================================
// Server-Side Fetchers (for Server Components)
// ============================================

/**
 * Get top anime (by score)
 */
export async function getTopAnime(limit = 10): Promise<JikanResponse<JikanAnime[]>> {
  return jikanFetch(`/top/anime?limit=${limit}&filter=airing`, { revalidate: 300 });
}

/**
 * Get current season anime
 */
export async function getSeasonNow(
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  return jikanFetch(`/seasons/now?page=${page}&limit=${limit}`, { revalidate: 300 });
}

/**
 * Get popular anime (by popularity)
 */
export async function getPopularAnime(limit = 10): Promise<JikanResponse<JikanAnime[]>> {
  return jikanFetch(`/top/anime?limit=${limit}&filter=bypopularity`, { revalidate: 300 });
}

/**
 * Get anime by ID
 */
export async function getAnimeById(id: number): Promise<JikanResponse<JikanAnime>> {
  return jikanFetch(`/anime/${id}/full`, { revalidate: 600 });
}

/**
 * Get anime episodes
 */
export async function getAnimeEpisodes(
  id: number,
  page = 1
): Promise<JikanResponse<JikanEpisode[]>> {
  return jikanFetch(`/anime/${id}/episodes?page=${page}`, { revalidate: 600 });
}

/**
 * Search anime
 */
export async function searchAnime(
  query: string,
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  return jikanFetch(
    `/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&order_by=score&sort=desc`,
    { revalidate: 120 }
  );
}

/**
 * Get anime by status
 */
export async function getAnimeByStatus(
  status: "airing" | "complete" | "upcoming",
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  return jikanFetch(
    `/anime?status=${status}&page=${page}&limit=${limit}&order_by=score&sort=desc`,
    { revalidate: 300 }
  );
}

/**
 * Get all anime genres
 */
export async function getAnimeGenres(): Promise<JikanResponse<GenreData[]>> {
  return jikanFetch(`/genres/anime`, { revalidate: 86400 }); // Cache 24 hours
}

/**
 * Get anime by genre ID
 */
export async function getAnimeByGenre(
  genreId: number,
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  return jikanFetch(
    `/anime?genres=${genreId}&page=${page}&limit=${limit}&order_by=score&sort=desc`,
    { revalidate: 300 }
  );
}

/**
 * Get anime recommendations
 */
export async function getAnimeRecommendations(
  id: number
): Promise<JikanResponse<{ entry: JikanAnime }[]>> {
  return jikanFetch(`/anime/${id}/recommendations`, { revalidate: 3600 });
}
