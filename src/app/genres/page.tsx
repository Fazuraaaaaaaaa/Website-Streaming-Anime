import type { Metadata } from "next";
import Link from "next/link";
import { getAnimeGenres } from "@/lib/api";
import type { GenreData } from "@/lib/types";
import { Layers } from "lucide-react";
import { getGenreColor } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Daftar Genre Anime",
  description: "Jelajahi anime berdasarkan genre favorit kamu di AnimeHub.",
};

// Curated gradient colors for genre cards
const genreGradients: Record<string, string> = {
  Action: "from-red-600/30 to-orange-600/30",
  Adventure: "from-amber-600/30 to-yellow-600/30",
  "Avant Garde": "from-fuchsia-600/30 to-pink-600/30",
  "Award Winning": "from-yellow-500/30 to-amber-500/30",
  "Boys Love": "from-sky-600/30 to-blue-600/30",
  Comedy: "from-yellow-600/30 to-lime-600/30",
  Drama: "from-purple-600/30 to-pink-600/30",
  Fantasy: "from-violet-600/30 to-indigo-600/30",
  "Girls Love": "from-pink-600/30 to-rose-600/30",
  Gourmet: "from-orange-600/30 to-red-600/30",
  Horror: "from-gray-700/30 to-red-900/30",
  Mystery: "from-indigo-600/30 to-blue-600/30",
  Romance: "from-pink-500/30 to-rose-500/30",
  "Sci-Fi": "from-cyan-600/30 to-teal-600/30",
  "Slice of Life": "from-emerald-600/30 to-green-600/30",
  Sports: "from-orange-500/30 to-amber-500/30",
  Supernatural: "from-fuchsia-500/30 to-purple-500/30",
  Suspense: "from-slate-600/30 to-gray-600/30",
  Ecchi: "from-rose-500/30 to-pink-500/30",
};

function getGradient(name: string): string {
  return genreGradients[name] || "from-slate-600/30 to-gray-600/30";
}

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
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
             style={{ background: 'var(--accent-soft)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
          <Layers className="w-5 h-5" style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Genre Anime
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Jelajahi anime berdasarkan genre · {genres.length} genre tersedia
          </p>
        </div>
      </div>

      {/* Genre Grid */}
      {genres.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {genres.map((genre) => (
            <Link
              key={genre.mal_id}
              href={`/search?genre=${genre.mal_id}&genreName=${encodeURIComponent(genre.name)}`}
              className="group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/10"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(genre.name)} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {genre.name}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {genre.count?.toLocaleString() || "0"} anime
                </p>
              </div>

              {/* Decorative circle */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                   style={{ background: 'var(--accent)' }} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Gagal memuat daftar genre.
          </p>
        </div>
      )}
    </div>
  );
}
