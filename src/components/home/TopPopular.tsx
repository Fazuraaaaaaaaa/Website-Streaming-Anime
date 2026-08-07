import Image from "next/image";
import Link from "next/link";
import { Star, Trophy } from "lucide-react";
import { formatScore } from "@/lib/utils";
import type { JikanAnime } from "@/lib/types";

interface TopPopularProps {
  animeList: JikanAnime[];
}

export default function TopPopular({ animeList }: TopPopularProps) {
  if (!animeList.length) return null;

  return (
    <aside id="top-popular" className="bg-[#0d1124] rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <Trophy className="w-5 h-5 text-violet-400" />
        <h3 className="text-base font-black tracking-wider uppercase text-white">
          Top 10 Populer
        </h3>
      </div>

      <div className="space-y-3">
        {animeList.slice(0, 10).map((anime, index) => {
          const rankFormatted = String(index + 1).padStart(2, "0");

          return (
            <Link
              key={anime.mal_id}
              href={`/anime/${anime.mal_id}`}
              className="flex items-center gap-3.5 p-2 rounded-2xl transition-all duration-200 hover:bg-white/5 group"
            >
              {/* Large Rank Number */}
              <span
                className={`text-2xl font-black w-9 text-center shrink-0 tracking-tighter ${
                  index === 0
                    ? "text-amber-400"
                    : index === 1
                    ? "text-slate-300"
                    : index === 2
                    ? "text-amber-600"
                    : "text-slate-500/50"
                }`}
              >
                {rankFormatted}
              </span>

              {/* Poster */}
              <div className="relative w-12 h-16 rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-white/10 group-hover:ring-violet-500/50 transition-all">
                <Image
                  src={anime.images.webp?.small_image_url || anime.images.jpg.small_image_url}
                  alt={anime.title}
                  fill
                  sizes="48px"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white line-clamp-1 group-hover:text-violet-400 transition-colors">
                  {anime.title_english || anime.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  {anime.score && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {formatScore(anime.score)}
                    </span>
                  )}
                  <span>•</span>
                  <span>{anime.type || "Series"}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
