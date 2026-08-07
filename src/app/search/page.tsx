import type { Metadata } from "next";
import { searchAnime, getAnimeByGenre } from "@/lib/api";
import { toAnimeCard, type JikanAnime, type JikanPagination } from "@/lib/types";
import AnimeCard from "@/components/anime/AnimeCard";
import SearchInput from "./SearchInput";
import { Search as SearchIcon } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string; genre?: string; genreName?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q, genreName } = await searchParams;
  if (genreName) {
    return {
      title: `Genre: ${genreName}`,
      description: `Daftar anime genre ${genreName} di AnimeHub.`,
    };
  }
  if (q) {
    return {
      title: `Hasil Pencarian: ${q}`,
      description: `Hasil pencarian anime "${q}" di AnimeHub.`,
    };
  }
  return {
    title: "Cari Anime",
    description: "Cari anime favorit kamu di AnimeHub.",
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, page: pageParam, genre, genreName } = await searchParams;
  const page = Number(pageParam) || 1;

  let animeList: JikanAnime[] = [];
  let pagination: JikanPagination | null | undefined = null;
  let searchTitle = "";

  try {
    if (genre) {
      // Genre-based search
      const res = await getAnimeByGenre(Number(genre), page, 24);
      animeList = res.data;
      pagination = res.pagination;
      searchTitle = `Genre: ${genreName || genre}`;
    } else if (q) {
      // Text search
      const res = await searchAnime(q, page, 24);
      animeList = res.data;
      pagination = res.pagination;
      searchTitle = `Hasil untuk "${q}"`;
    } else {
      animeList = [];
      pagination = null;
    }
  } catch {
    animeList = [];
    pagination = null;
  }

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    if (genreName) params.set("genreName", genreName);
    params.set("page", String(p));
    return `/search?${params.toString()}`;
  };

  return (
    <div className="container-main py-8">
      {/* Search Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
             style={{ background: 'var(--accent-soft)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <SearchIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {searchTitle || "Cari Anime"}
          </h1>
          {pagination && (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {pagination.items?.total || 0} anime ditemukan
            </p>
          )}
        </div>
      </div>

      {/* Search Input */}
      <SearchInput initialQuery={q || ""} />

      {/* Results Grid */}
      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-8">
          {animeList.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={toAnimeCard(anime)} />
          ))}
        </div>
      ) : q || genre ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Tidak ada hasil ditemukan
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Coba kata kunci lain atau periksa ejaan.
          </p>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Mulai cari anime favoritmu
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Ketik judul anime di kotak pencarian di atas.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_visible_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <a
              href={buildPageUrl(page - 1)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              ← Sebelumnya
            </a>
          )}

          <span className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ background: 'var(--accent)', color: 'white' }}>
            {page}
          </span>

          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            / {pagination.last_visible_page}
          </span>

          {pagination.has_next_page && (
            <a
              href={buildPageUrl(page + 1)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              Selanjutnya →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
