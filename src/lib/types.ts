// ============================================
// Jikan API (MyAnimeList) TypeScript Types
// ============================================

// --- Jikan API Response Types ---

export interface JikanImage {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface JikanImages {
  jpg: JikanImage;
  webp: JikanImage;
}

export interface JikanGenre {
  mal_id: number;
  type?: string;
  name: string;
  url?: string;
}

export interface JikanStudio {
  mal_id: number;
  type?: string;
  name: string;
  url?: string;
}

export interface JikanAired {
  from: string | null;
  to: string | null;
  prop: {
    from: { day: number | null; month: number | null; year: number | null };
    to: { day: number | null; month: number | null; year: number | null };
  };
  string: string;
}

export interface JikanTrailer {
  youtube_id: string | null;
  url: string | null;
  embed_url: string | null;
}

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: JikanImages;
  trailer: JikanTrailer;
  approved: boolean;
  titles: { type: string; title: string }[];
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  type: string | null;
  source: string | null;
  episodes: number | null;
  status: string | null;
  airing: boolean;
  aired: JikanAired;
  duration: string | null;
  rating: string | null;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  genres: JikanGenre[];
  themes: JikanGenre[];
  demographics: JikanGenre[];
  studios: JikanStudio[];
  producers?: JikanStudio[];
}

export interface JikanEpisode {
  mal_id: number;
  url?: string;
  title: string;
  title_japanese?: string | null;
  title_romanji?: string | null;
  aired?: string | null;
  score?: number | null;
  filler?: boolean;
  recap?: boolean;
  forum_url?: string | null;
}

export interface JikanPagination {
  last_visible_page: number;
  has_next_page: boolean;
  current_page: number;
  items: {
    count: number;
    total: number;
    per_page: number;
  };
}

export interface JikanResponse<T> {
  data: T;
  pagination?: JikanPagination;
}

// --- App-level Types ---

export interface AnimeCardData {
  id: number;
  title: string;
  titleEnglish: string | null;
  image: string;
  score: number | null;
  episodes: number | null;
  type: string | null;
  status: string | null;
  genres: { id: number; name: string }[];
}

export interface GenreData {
  mal_id: number;
  name: string;
  count: number;
}

// --- Helper: Transform Jikan to App ---

export function toAnimeCard(anime: JikanAnime): AnimeCardData {
  return {
    id: anime.mal_id,
    title: anime.title,
    titleEnglish: anime.title_english,
    image: anime.images.webp?.large_image_url || anime.images.jpg.large_image_url,
    score: anime.score,
    episodes: anime.episodes,
    type: anime.type,
    status: anime.status,
    genres: anime.genres.map((g) => ({ id: g.mal_id, name: g.name })),
  };
}

// --- Tahap 4 Streaming & User State Types ---

export interface WatchHistoryItem {
  animeId: number;
  animeTitle: string;
  animeImage: string;
  episodeNum: number;
  episodeTitle?: string;
  totalEpisodes?: number | null;
  currentTime: number;
  duration: number;
  progressPercent: number;
  updatedAt: number;
}

export type WatchlistStatus = "watching" | "plan_to_watch" | "completed" | "favorite";

export interface WatchlistItem {
  animeId: number;
  title: string;
  titleEnglish?: string | null;
  image: string;
  score?: number | null;
  totalEpisodes?: number | null;
  status: WatchlistStatus;
  addedAt: number;
}

export interface CommentItem {
  id: string;
  animeId: number;
  episodeNum: number;
  username: string;
  avatarUrl: string;
  content: string;
  isSpoiler: boolean;
  likes: number;
  createdAt: number;
}

export interface VideoServer {
  id: string;
  name: string;
  quality: string;
  type: "direct" | "embed" | "hls";
  url: string;
  tag: string;
}
