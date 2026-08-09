import type { Metadata } from "next";
import Link from "next/link";
import { getAnimeGenres } from "@/lib/api";
import type { GenreData } from "@/lib/types";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Daftar Genre Anime (Sub Indo) — RafQ Dev",
  description: "Jelajahi anime berdasarkan kategori dan genre favorit kamu di RafQ Dev.",
};

export default async function GenresPage() {
  let genres: GenreData[] = [];

  try {
    const res = await getAnimeGenres();
    genres = res.data;
  } catch {
    genres = [];
  }

  return (
    <div className="container-main py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded flex items-center justify-center bg-[#F47521]/15 border border-[#F47521]/30">
          <Layers className="w-5 h-5 text-[#F47521]" />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            Kategori Genre Anime
          </h1>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
            Jelajahi anime berdasarkan genre · {genres.length} genre tersedia
          </p>
        </div>
      </div>

      {/* Genre Grid */}
      {genres.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {genres.map((genre) => (
            <Link
              key={genre.mal_id}
              href={`/search?genre=${genre.mal_id}&genreName=${encodeURIComponent(genre.name)}`}
              className="group relative overflow-hidden rounded bg-[#23252b] hover:bg-[#2a2c34] p-5 transition-all duration-200 border border-white/5 hover:border-[#F47521] shadow-lg"
            >
              <div className="relative z-10">
                <h3 className="text-sm font-black uppercase tracking-wider text-white group-hover:text-[#F47521] transition-colors mb-1">
                  {genre.name}
                </h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  {genre.count?.toLocaleString() || "0"} anime
                </p>
              </div>

              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#F47521]/5 rounded-bl-full group-hover:bg-[#F47521]/15 transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-zinc-400">
            Gagal memuat daftar genre.
          </p>
        </div>
      )}
    </div>
  );
}
