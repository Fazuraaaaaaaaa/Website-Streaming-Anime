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
    <aside id="top-popular" className="bg-[#23252b] rounded-md p-5 border border-white/5 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
        <Trophy className="w-5 h-5 text-[#F47521]" />
        <h3 className="text-sm font-black tracking-wider uppercase text-white">
          Top 10 Populer (Sub Indo)
        </h3>
      </div>

      <div className="space-y-2">
        {animeList.slice(0, 10).map((anime, index) => {
          const rankFormatted = String(index + 1).padStart(2, "0");

          return (
            <Link
              key={anime.mal_id}
              href={`/anime/${anime.mal_id}`}
              className="flex items-center gap-3 p-2 rounded-md transition-all duration-200 hover:bg-black/30 group"
            >
              {/* Large Rank Number */}
              <span
                className={`text-lg font-black w-7 text-center shrink-0 tracking-tighter ${
                  index === 0
                    ? "text-[#FAB818]"
                    : index === 1
                    ? "text-zinc-200"
                    : index === 2
                    ? "text-[#F47521]"
                    : "text-zinc-500"
                }`}
              >
                {rankFormatted}
              </span>

              {/* Poster */}
              <div className="relative w-11 h-14 rounded overflow-hidden shrink-0 shadow-md ring-1 ring-white/10 group-hover:ring-[#F47521] transition-all bg-[#141519]">
                <Image
                  src={anime.images.webp?.small_image_url || anime.images.jpg.small_image_url}
                  alt={anime.title}
                  fill
                  sizes="44px"
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#F47521] transition-colors">
                  {anime.title_english || anime.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                  {anime.score && (
                    <span className="flex items-center gap-1 text-[#FAB818] font-bold">
                      <Star className="w-3 h-3 fill-[#FAB818]" />
                      {formatScore(anime.score)}
                    </span>
                  )}
                  <span>•</span>
                  <span className="uppercase">{anime.type || "TV"}</span>
                  <span>•</span>
                  <span className="text-[#F47521] font-bold">Sub Indo</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
