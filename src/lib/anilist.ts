// ============================================
// AniList GraphQL Client — Fast, Resilient, & Free
// https://graphql.anilist.co
// ============================================

import type { JikanAnime, JikanResponse, JikanPagination, JikanEpisode } from "./types";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

// Simple in-memory cache for AniList requests
const aniListMemoryCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

interface AniListMedia {
  id: number;
  idMal?: number | null;
  title?: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
  };
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
    medium?: string | null;
    color?: string | null;
  };
  bannerImage?: string | null;
  format?: string | null;
  status?: string | null;
  episodes?: number | null;
  duration?: number | null;
  averageScore?: number | null;
  popularity?: number | null;
  favourites?: number | null;
  season?: string | null;
  seasonYear?: number | null;
  genres?: string[];
  description?: string | null;
  trailer?: {
    id?: string | null;
    site?: string | null;
    thumbnail?: string | null;
  } | null;
  studios?: {
    nodes?: Array<{ id: number; name: string }>;
  };
  recommendations?: {
    nodes?: Array<{
      mediaRecommendation?: AniListMedia;
    }>;
  };
}

interface AniListGraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

/**
 * Remove HTML tags from AniList description
 */
function stripHtml(html?: string | null): string {
  if (!html) return "";
  return html
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

/**
 * Convert AniList status to MAL/Jikan format
 */
function mapStatus(status?: string | null): string {
  switch (status) {
    case "RELEASING":
      return "Currently Airing";
    case "FINISHED":
      return "Finished Airing";
    case "NOT_YET_RELEASED":
      return "Not yet aired";
    case "CANCELLED":
      return "Cancelled";
    case "HIATUS":
      return "On Hiatus";
    default:
      return status || "Unknown";
  }
}

/**
 * Convert AniList Media object to JikanAnime structure
 */
export function aniListToJikan(media: AniListMedia): JikanAnime {
  const malId = media.idMal || media.id;
  const primaryTitle = media.title?.english || media.title?.romaji || media.title?.native || `Anime #${malId}`;
  const posterLarge = media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage?.medium || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80";
  const posterMed = media.coverImage?.large || media.coverImage?.medium || posterLarge;
  const posterSmall = media.coverImage?.medium || posterMed;

  const ytId = media.trailer?.site?.toLowerCase() === "youtube" ? media.trailer?.id : null;

  return {
    mal_id: malId,
    url: `https://myanimelist.net/anime/${malId}`,
    images: {
      jpg: {
        image_url: posterMed,
        small_image_url: posterSmall,
        large_image_url: posterLarge,
      },
      webp: {
        image_url: posterMed,
        small_image_url: posterSmall,
        large_image_url: posterLarge,
      },
    },
    trailer: {
      youtube_id: ytId || null,
      url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : null,
      embed_url: ytId
        ? `https://www.youtube.com/embed/${ytId}?enablejsapi=1&wmode=opaque&autoplay=1`
        : null,
    },
    approved: true,
    titles: [
      { type: "Default", title: primaryTitle },
      ...(media.title?.english ? [{ type: "English", title: media.title.english }] : []),
      ...(media.title?.native ? [{ type: "Japanese", title: media.title.native }] : []),
    ],
    title: primaryTitle,
    title_english: media.title?.english || media.title?.romaji || null,
    title_japanese: media.title?.native || null,
    type: media.format || "TV",
    source: "Original",
    episodes: media.episodes || null,
    status: mapStatus(media.status),
    airing: media.status === "RELEASING",
    aired: {
      from: media.seasonYear ? `${media.seasonYear}-01-01` : null,
      to: null,
      prop: {
        from: { day: 1, month: 1, year: media.seasonYear || 2024 },
        to: { day: null, month: null, year: null },
      },
      string: media.seasonYear ? `${media.season || ""} ${media.seasonYear}`.trim() : "Unknown",
    },
    duration: media.duration ? `${media.duration} min per ep` : null,
    rating: "PG-13",
    score: media.averageScore ? Number((media.averageScore / 10).toFixed(2)) : null,
    scored_by: media.popularity ? Math.floor(media.popularity * 0.8) : null,
    rank: null,
    popularity: media.popularity || null,
    members: media.popularity ? media.popularity * 2 : null,
    favorites: media.favourites || null,
    synopsis: stripHtml(media.description),
    background: null,
    season: media.season?.toLowerCase() || null,
    year: media.seasonYear || null,
    genres: (media.genres || []).map((g, i) => ({
      mal_id: i + 1,
      name: g,
    })),
    themes: [],
    demographics: [],
    studios: (media.studios?.nodes || []).map((s) => ({
      mal_id: s.id,
      name: s.name,
    })),
    producers: [],
  };
}

/**
 * Execute GraphQL Query to AniList
 */
export async function fetchAniListGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T | null> {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = aniListMemoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(ANILIST_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
        next: { revalidate: 3600 },
      });

      clearTimeout(timeoutId);

      if (res.status === 429) {
        // Rate limited — backoff
        await new Promise((r) => setTimeout(r, 1200 * attempt));
        continue;
      }

      if (!res.ok) {
        throw new Error(`AniList HTTP error: ${res.status}`);
      }

      const json: AniListGraphQLResponse<T> = await res.json();
      if (json.errors && json.errors.length > 0) {
        throw new Error(`AniList GraphQL error: ${json.errors[0].message}`);
      }

      if (json.data) {
        aniListMemoryCache.set(cacheKey, { data: json.data, timestamp: Date.now() });
        return json.data;
      }
    } catch {
      if (attempt === 2) break;
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return null;
}

// ============================================
// AniList Queries
// ============================================

const ANILIST_PAGE_QUERY = `
  query ($page: Int, $perPage: Int, $search: String, $sort: [MediaSort], $status: MediaStatus, $genre: String, $season: MediaSeason, $seasonYear: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      media(search: $search, sort: $sort, status: $status, genre: $genre, season: $season, seasonYear: $seasonYear, type: ANIME, isAdult: false) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        format
        status
        episodes
        duration
        averageScore
        popularity
        favourites
        season
        seasonYear
        genres
        description
        trailer {
          id
          site
        }
        studios(isMain: true) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`;

const ANILIST_DETAIL_QUERY = `
  query ($id: Int, $idMal: Int) {
    Media(id: $id, idMal: $idMal, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      format
      status
      episodes
      duration
      averageScore
      popularity
      favourites
      season
      seasonYear
      genres
      description
      trailer {
        id
        site
      }
      studios(isMain: true) {
        nodes {
          id
          name
        }
      }
      recommendations(perPage: 8, sort: RATING_DESC) {
        nodes {
          mediaRecommendation {
            id
            idMal
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
              medium
            }
            format
            episodes
            averageScore
            status
          }
        }
      }
    }
  }
`;

interface AniListPageData {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
      perPage: number;
    };
    media: AniListMedia[];
  };
}

interface AniListDetailData {
  Media: AniListMedia;
}

/**
 * Fetch Top / Popular / Trending anime from AniList
 */
export async function fetchAniListTop(
  limit = 10,
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "SCORE_DESC"
): Promise<JikanResponse<JikanAnime[]> | null> {
  const data = await fetchAniListGraphQL<AniListPageData>(ANILIST_PAGE_QUERY, {
    page: 1,
    perPage: limit,
    sort: [sort],
  });

  if (!data?.Page?.media) return null;

  return {
    data: data.Page.media.map(aniListToJikan),
    pagination: {
      current_page: data.Page.pageInfo.currentPage,
      last_visible_page: data.Page.pageInfo.lastPage,
      has_next_page: data.Page.pageInfo.hasNextPage,
      items: {
        count: data.Page.media.length,
        total: data.Page.pageInfo.total,
        per_page: data.Page.pageInfo.perPage,
      },
    },
  };
}

/**
 * Fetch Current Season anime from AniList
 */
export async function fetchAniListSeasonNow(
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]> | null> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  let season: "WINTER" | "SPRING" | "SUMMER" | "FALL" = "SUMMER";
  if (month >= 1 && month <= 3) season = "WINTER";
  else if (month >= 4 && month <= 6) season = "SPRING";
  else if (month >= 7 && month <= 9) season = "SUMMER";
  else season = "FALL";

  const data = await fetchAniListGraphQL<AniListPageData>(ANILIST_PAGE_QUERY, {
    page,
    perPage: limit,
    season,
    seasonYear: year,
    sort: ["POPULARITY_DESC"],
  });

  if (!data?.Page?.media || data.Page.media.length === 0) {
    // If exact season query returns empty, fallback to currently releasing anime
    const fallbackData = await fetchAniListGraphQL<AniListPageData>(ANILIST_PAGE_QUERY, {
      page,
      perPage: limit,
      status: "RELEASING",
      sort: ["POPULARITY_DESC"],
    });
    if (!fallbackData?.Page?.media) return null;
    return {
      data: fallbackData.Page.media.map(aniListToJikan),
      pagination: {
        current_page: fallbackData.Page.pageInfo.currentPage,
        last_visible_page: fallbackData.Page.pageInfo.lastPage,
        has_next_page: fallbackData.Page.pageInfo.hasNextPage,
        items: {
          count: fallbackData.Page.media.length,
          total: fallbackData.Page.pageInfo.total,
          per_page: fallbackData.Page.pageInfo.perPage,
        },
      },
    };
  }

  return {
    data: data.Page.media.map(aniListToJikan),
    pagination: {
      current_page: data.Page.pageInfo.currentPage,
      last_visible_page: data.Page.pageInfo.lastPage,
      has_next_page: data.Page.pageInfo.hasNextPage,
      items: {
        count: data.Page.media.length,
        total: data.Page.pageInfo.total,
        per_page: data.Page.pageInfo.perPage,
      },
    },
  };
}

/**
 * Search anime on AniList
 */
export async function fetchAniListSearch(
  query: string,
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]> | null> {
  const data = await fetchAniListGraphQL<AniListPageData>(ANILIST_PAGE_QUERY, {
    page,
    perPage: limit,
    search: query,
    sort: ["SEARCH_MATCH", "POPULARITY_DESC"],
  });

  if (!data?.Page?.media) return null;

  return {
    data: data.Page.media.map(aniListToJikan),
    pagination: {
      current_page: data.Page.pageInfo.currentPage,
      last_visible_page: data.Page.pageInfo.lastPage,
      has_next_page: data.Page.pageInfo.hasNextPage,
      items: {
        count: data.Page.media.length,
        total: data.Page.pageInfo.total,
        per_page: data.Page.pageInfo.perPage,
      },
    },
  };
}

/**
 * Fetch Anime by Status on AniList
 */
export async function fetchAniListByStatus(
  status: "airing" | "complete" | "upcoming",
  page = 1,
  limit = 20
): Promise<JikanResponse<JikanAnime[]> | null> {
  let aniStatus = "RELEASING";
  if (status === "complete") aniStatus = "FINISHED";
  if (status === "upcoming") aniStatus = "NOT_YET_RELEASED";

  const data = await fetchAniListGraphQL<AniListPageData>(ANILIST_PAGE_QUERY, {
    page,
    perPage: limit,
    status: aniStatus,
    sort: ["POPULARITY_DESC"],
  });

  if (!data?.Page?.media) return null;

  return {
    data: data.Page.media.map(aniListToJikan),
    pagination: {
      current_page: data.Page.pageInfo.currentPage,
      last_visible_page: data.Page.pageInfo.lastPage,
      has_next_page: data.Page.pageInfo.hasNextPage,
      items: {
        count: data.Page.media.length,
        total: data.Page.pageInfo.total,
        per_page: data.Page.pageInfo.perPage,
      },
    },
  };
}

/**
 * Fetch Anime Detail by ID from AniList
 */
export async function fetchAniListDetail(
  idOrMalId: number
): Promise<JikanResponse<JikanAnime> | null> {
  // First try querying by MAL ID
  let data = await fetchAniListGraphQL<AniListDetailData>(ANILIST_DETAIL_QUERY, {
    idMal: idOrMalId,
  });

  if (!data?.Media) {
    // If not found by MAL ID, try AniList ID
    data = await fetchAniListGraphQL<AniListDetailData>(ANILIST_DETAIL_QUERY, {
      id: idOrMalId,
    });
  }

  if (!data?.Media) return null;

  return {
    data: aniListToJikan(data.Media),
  };
}
