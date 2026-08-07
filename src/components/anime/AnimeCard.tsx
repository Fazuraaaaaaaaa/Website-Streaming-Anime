import Link from "next/link";
import Image from "next/image";
import { Play, Star, Tv } from "lucide-react";
import { formatScore } from "@/lib/utils";
import type { AnimeCardData } from "@/lib/types";

interface AnimeCardProps {
  anime: AnimeCardData;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <Link
      href={`/anime/${anime.id}`}
      id={`anime-card-${anime.id}`}
      className="group relative overflow-hidden rounded-2xl bg-[#0d1124] border border-white/5 hover:border-violet-500/50 transition-all duration-300 shadow-xl hover:-translate-y-1.5 block flex flex-col justify-between"
    >
      {/* Poster Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay Play Icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-violet-600 shadow-lg shadow-violet-600/50">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Score Badge */}
        {anime.score && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black text-white bg-black/70 backdrop-blur-md border border-white/10 shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{formatScore(anime.score)}</span>
            </div>
          </div>
        )}

        {/* Status / Episode Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white bg-violet-600/90 backdrop-blur-md shadow-md">
            {anime.episodes ? `Ep ${anime.episodes}` : anime.type || "Series"}
          </span>
        </div>
      </div>

      {/* Title & Info */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <h3 className="text-sm font-bold line-clamp-2 leading-snug text-white group-hover:text-violet-400 transition-colors">
          {anime.titleEnglish || anime.title}
        </h3>
        
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
          <Tv className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="truncate">{anime.type || "Anime"} • Sub Indo</span>
        </div>
      </div>
    </Link>
  );
}
