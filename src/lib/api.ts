// ============================================
// Multi-Provider Hybrid Anime API Engine
// Primary: AniList GraphQL (Fast, Global CDN, 90 req/min)
// Secondary: Jikan v4 (MyAnimeList)
// Tertiary: Resilient In-Memory & Fallback Dataset
// ============================================

import type { JikanAnime, JikanEpisode, JikanResponse, GenreData } from "./types";
import { FALLBACK_ANIME_LIST, FALLBACK_GENRES } from "./fallbackData";
import {
  fetchAniListTop,
  fetchAniListSeasonNow,
  fetchAniListSearch,
  fetchAniListByStatus,
  fetchAniListDetail,
  fetchAniListGraphQL,
  aniListToJikan,
} from "./anilist";

const JIKAN_BASE = "https://api.jikan.moe/v4";

// In-memory cache for fast repeated responses
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

/**
 * Generic Jikan fetcher with smart backoff and memory caching
 */
async function jikanFetch<T>(
  endpoint: string,
  options?: { revalidate?: number | false }
): Promise<T> {
  const url = `${JIKAN_BASE}${endpoint}`;

  // Check in-memory cache first
  const cached = memoryCache.get(endpoint);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const fetchOptions: RequestInit & { next?: { revalidate?: number | false } } = {
        headers: {
          Accept: "application/json",
        },
      };

      if (options?.revalidate === false) {
        fetchOptions.cache = "no-store";
      } else {
        fetchOptions.next = {
          revalidate: options?.revalidate ?? 600,
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.status === 429) {
        // Rate limited — backoff slightly and retry
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }

      if (!res.ok) {
        throw new Error(`Jikan API error: ${res.status}`);
      }

      const json = await res.json();
      memoryCache.set(endpoint, { data: json, timestamp: Date.now() });
      return json;
    } catch {
      if (attempt === 2) break;
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  throw new Error(`Failed to fetch ${endpoint}`);
}

/**
 * Client-side fetcher with graceful error recovery
 */
export async function clientFetch<T>(endpoint: string): Promise<T> {
  const url = `${JIKAN_BASE}${endpoint}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    throw new Error(`Network error on ${endpoint}`);
  }
}

// ============================================
// Hybrid Multi-Source Server Fetchers
// ============================================

/**
 * Get top anime (by score) - Tries AniList first, then Jikan, then Fallback
 */
export async function getTopAnime(limit = 10): Promise<JikanResponse<JikanAnime[]>> {
  // 1. Try AniList (Fastest & most reliable)
  try {
    const aniData = await fetchAniListTop(limit, "SCORE_DESC");
    if (aniData && aniData.data.length > 0) {
      return aniData;
    }
  } catch {}

  // 2. Try Jikan API
  try {
    return await jikanFetch<JikanResponse<JikanAnime[]>>(`/top/anime?limit=${limit}&filter=airing`);
  } catch {}

  // 3. Fallback Data
  return {
    data: FALLBACK_ANIME_LIST.slice(0, limit),
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: FALLBACK_ANIME_LIST.length, total: FALLBACK_ANIME_LIST.length, per_page: limit },
    },
  };
}

/**
 * Get current season anime - Tries AniList first, then Jikan, then Fallback
 */
export async function getSeasonNow(
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  // 1. Try AniList
  try {
    const aniData = await fetchAniListSeasonNow(page, limit);
    if (aniData && aniData.data.length > 0) {
      return aniData;
    }
  } catch {}

  // 2. Try Jikan API
  try {
    return await jikanFetch<JikanResponse<JikanAnime[]>>(`/seasons/now?page=${page}&limit=${limit}`);
  } catch {}

  // 3. Fallback Data
  const shifted = [...FALLBACK_ANIME_LIST].reverse().slice(0, limit);
  return {
    data: shifted,
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: shifted.length, total: shifted.length, per_page: limit },
    },
  };
}

/**
 * Get popular anime (by popularity / trending)
 */
export async function getPopularAnime(limit = 10): Promise<JikanResponse<JikanAnime[]>> {
  // 1. Try AniList
  try {
    const aniData = await fetchAniListTop(limit, "TRENDING_DESC");
    if (aniData && aniData.data.length > 0) {
      return aniData;
    }
  } catch {}

  // 2. Try Jikan API
  try {
    return await jikanFetch<JikanResponse<JikanAnime[]>>(`/top/anime?limit=${limit}&filter=bypopularity`);
  } catch {}

  // 3. Fallback Data
  return {
    data: FALLBACK_ANIME_LIST.slice(0, limit),
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: FALLBACK_ANIME_LIST.length, total: FALLBACK_ANIME_LIST.length, per_page: limit },
    },
  };
}

/**
 * Get anime by ID with multi-source fallback
 */
export async function getAnimeById(id: number): Promise<JikanResponse<JikanAnime>> {
  // 1. Try AniList
  try {
    const aniData = await fetchAniListDetail(id);
    if (aniData && aniData.data) {
      return aniData;
    }
  } catch {}

  // 2. Try Jikan
  try {
    return await jikanFetch<JikanResponse<JikanAnime>>(`/anime/${id}/full`, { revalidate: 1800 });
  } catch {}

  // 3. Check hardcoded fallback list
  const found = FALLBACK_ANIME_LIST.find((a) => a.mal_id === id);
  if (found) {
    return { data: found };
  }

  // 4. Return synthesized anime object
  const defaultAnime = FALLBACK_ANIME_LIST[0];
  return {
    data: {
      ...defaultAnime,
      mal_id: id,
      title: `Anime #${id}`,
      title_english: `Anime #${id} — Streaming`,
    },
  };
}

/**
 * Get anime episodes
 */
export async function getAnimeEpisodes(
  id: number,
  page = 1
): Promise<JikanResponse<JikanEpisode[]>> {
  try {
    return await jikanFetch<JikanResponse<JikanEpisode[]>>(
      `/anime/${id}/episodes?page=${page}`,
      { revalidate: 1800 }
    );
  } catch {
    const anime = FALLBACK_ANIME_LIST.find((a) => a.mal_id === id) || FALLBACK_ANIME_LIST[0];
    const totalEp = anime.episodes || 12;
    const episodes: JikanEpisode[] = Array.from({ length: Math.min(totalEp, 24) }, (_, i) => ({
      mal_id: i + 1,
      title: `Episode ${i + 1}`,
      filler: false,
    }));
    return { data: episodes };
  }
}

/**
 * Search anime across AniList and Jikan
 */
export async function searchAnime(
  query: string,
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  // 1. Try AniList
  try {
    const aniData = await fetchAniListSearch(query, page, limit);
    if (aniData && aniData.data.length > 0) {
      return aniData;
    }
  } catch {}

  // 2. Try Jikan API
  try {
    return await jikanFetch<JikanResponse<JikanAnime[]>>(
      `/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}&order_by=score&sort=desc`,
      { revalidate: 300 }
    );
  } catch {}

  // 3. Fallback filter
  const q = query.toLowerCase();
  const filtered = FALLBACK_ANIME_LIST.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      (a.title_english && a.title_english.toLowerCase().includes(q)) ||
      a.genres.some((g) => g.name.toLowerCase().includes(q))
  );
  return {
    data: filtered.length > 0 ? filtered : FALLBACK_ANIME_LIST.slice(0, limit),
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: filtered.length, total: filtered.length, per_page: limit },
    },
  };
}

/**
 * Get anime by status (airing, complete, upcoming)
 */
export async function getAnimeByStatus(
  status: "airing" | "complete" | "upcoming",
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  // 1. Try AniList
  try {
    const aniData = await fetchAniListByStatus(status, page, limit);
    if (aniData && aniData.data.length > 0) {
      return aniData;
    }
  } catch {}

  // 2. Try Jikan
  try {
    return await jikanFetch<JikanResponse<JikanAnime[]>>(
      `/anime?status=${status}&page=${page}&limit=${limit}&order_by=score&sort=desc`,
      { revalidate: 600 }
    );
  } catch {}

  // 3. Fallback Data
  return {
    data: FALLBACK_ANIME_LIST.slice(0, limit),
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: FALLBACK_ANIME_LIST.length, total: FALLBACK_ANIME_LIST.length, per_page: limit },
    },
  };
}

/**
 * Get all anime genres
 */
export async function getAnimeGenres(): Promise<JikanResponse<GenreData[]>> {
  try {
    return await jikanFetch<JikanResponse<GenreData[]>>(`/genres/anime`, { revalidate: 86400 });
  } catch {
    return { data: FALLBACK_GENRES };
  }
}

/**
 * Get anime by genre ID
 */
export async function getAnimeByGenre(
  genreId: number,
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]>> {
  const genreObj = FALLBACK_GENRES.find((g) => g.mal_id === genreId);
  const genreName = genreObj ? genreObj.name : null;

  // Try AniList by genre name if available
  if (genreName) {
    try {
      const aniData = await fetchAniListGraphQL<{
        Page: {
          pageInfo: { total: number; currentPage: number; lastPage: number; hasNextPage: boolean; perPage: number };
          media: any[];
        };
      }>(
        `
        query ($page: Int, $perPage: Int, $genre: String) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { total currentPage lastPage hasNextPage perPage }
            media(genre: $genre, sort: [SCORE_DESC, POPULARITY_DESC], type: ANIME, isAdult: false) {
              id idMal title { romaji english native }
              coverImage { extraLarge large medium color }
              bannerImage format status episodes duration averageScore popularity
              season seasonYear genres description trailer { id site }
              studios(isMain: true) { nodes { id name } }
            }
          }
        }
      `,
        { page, perPage: limit, genre: genreName }
      );

      if (aniData?.Page?.media && aniData.Page.media.length > 0) {
        return {
          data: aniData.Page.media.map(aniListToJikan),
          pagination: {
            current_page: aniData.Page.pageInfo.currentPage,
            last_visible_page: aniData.Page.pageInfo.lastPage,
            has_next_page: aniData.Page.pageInfo.hasNextPage,
            items: {
              count: aniData.Page.media.length,
              total: aniData.Page.pageInfo.total,
              per_page: aniData.Page.pageInfo.perPage,
            },
          },
        };
      }
    } catch {}
  }

  // Try Jikan
  try {
    return await jikanFetch<JikanResponse<JikanAnime[]>>(
      `/anime?genres=${genreId}&page=${page}&limit=${limit}&order_by=score&sort=desc`,
      { revalidate: 600 }
    );
  } catch {
    const filtered = FALLBACK_ANIME_LIST.filter((a) =>
      a.genres.some((g) => g.mal_id === genreId)
    );
    return {
      data: filtered.length > 0 ? filtered : FALLBACK_ANIME_LIST.slice(0, limit),
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: 1,
        items: { count: filtered.length, total: filtered.length, per_page: limit },
      },
    };
  }
}

/**
 * Get anime recommendations
 */
export async function getAnimeRecommendations(
  id: number
): Promise<JikanResponse<{ entry: JikanAnime }[]>> {
  try {
    return await jikanFetch<JikanResponse<{ entry: JikanAnime }[]>>(
      `/anime/${id}/recommendations`,
      { revalidate: 3600 }
    );
  } catch {
    const others = FALLBACK_ANIME_LIST.filter((a) => a.mal_id !== id).slice(0, 6);
    return {
      data: others.map((anime) => ({ entry: anime })),
    };
  }
}
