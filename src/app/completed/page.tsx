import type { Metadata } from "next";
import { getAnimeByStatus } from "@/lib/api";
import { toAnimeCard, type JikanAnime, type JikanPagination } from "@/lib/types";
import AnimeCard from "@/components/anime/AnimeCard";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Anime Tamat (Completed) Sub Indo — RafQ Dev",
  description: "Daftar anime yang sudah selesai tayang Sub Indo lengkap di RafQ Dev.",
};

interface CompletedPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CompletedPage({ searchParams }: CompletedPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;

  let animeList: JikanAnime[] = [];
  let pagination: JikanPagination | null | undefined = null;

  try {
    const res = await getAnimeByStatus("complete", page, 24);
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
        <div className="w-10 h-10 rounded flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Anime Tamat / Completed (Sub Indo)
          </h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
            Anime yang sudah selesai tayang lengkap
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
          <p className="text-lg text-zinc-400">
            Tidak ada anime completed ditemukan.
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_visible_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <a
              href={`/completed?page=${page - 1}`}
              className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/5 text-white border border-white/10"
            >
              ← Sebelumnya
            </a>
          )}

          <span className="px-4 py-2 rounded text-xs font-black uppercase tracking-wider bg-[#F47521] text-black">
            {page}
          </span>

          <span className="text-xs font-bold text-zinc-400">
            / {pagination.last_visible_page}
          </span>

          {pagination.has_next_page && (
            <a
              href={`/completed?page=${page + 1}`}
              className="px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/5 text-white border border-white/10"
            >
              Selanjutnya →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
