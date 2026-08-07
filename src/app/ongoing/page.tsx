import type { Metadata } from "next";
import { getAnimeByStatus } from "@/lib/api";
import { toAnimeCard, type JikanAnime, type JikanPagination } from "@/lib/types";
import AnimeCard from "@/components/anime/AnimeCard";
import { TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Anime Ongoing",
  description: "Daftar anime yang sedang tayang musim ini di AnimeHub.",
};

interface OngoingPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OngoingPage({ searchParams }: OngoingPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  let animeList: JikanAnime[] = [];
  let pagination: JikanPagination | null | undefined = null;

  try {
    const res = await getAnimeByStatus("airing", page, 24);
    animeList = res.data;
    pagination = res.pagination;
  } catch {
    animeList = [];
    pagination = null;
  }

  return (
    <div className="container-main py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
             style={{ background: 'var(--accent-soft)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Anime Ongoing
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Anime yang sedang tayang saat ini
            {pagination && ` · ${pagination.items?.total || 0} anime`}
          </p>
        </div>
      </div>

      {/* Grid */}
      {animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={toAnimeCard(anime)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Tidak ada anime ongoing ditemukan.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_visible_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <a
              href={`/ongoing?page=${page - 1}`}
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
              href={`/ongoing?page=${page + 1}`}
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
