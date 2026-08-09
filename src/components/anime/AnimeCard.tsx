"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, Sparkles } from "lucide-react";
import { formatScore } from "@/lib/utils";
import type { AnimeCardData } from "@/lib/types";

interface AnimeCardProps {
  anime: AnimeCardData;
}

const DEFAULT_POSTER =
  "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg";

export default function AnimeCard({ anime }: AnimeCardProps) {
  const [imgSrc, setImgSrc] = useState(anime.image || DEFAULT_POSTER);

  return (
    <Link
      href={`/anime/${anime.id}`}
      id={`anime-card-${anime.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-md bg-[#23252b] border border-white/5 hover:border-[#F47521] transition-all duration-200 shadow-xl hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#F47521]/15"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#141519]">
        <Image
          src={imgSrc}
          alt={anime.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgSrc(DEFAULT_POSTER)}
        />

        {/* Hover Overlay Play Icon (Crunchyroll style) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F47521] shadow-xl shadow-[#F47521]/50">
              <Play className="w-6 h-6 text-black fill-black ml-0.5" />
            </div>
          </div>
        </div>

        {/* Score Badge (Top Left) */}
        {anime.score && (
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-black text-white bg-black/85 backdrop-blur-sm border border-white/10 shadow-md">
              <Star className="w-3 h-3 fill-[#FAB818] text-[#FAB818]" />
              <span>{formatScore(anime.score)}</span>
            </div>
          </div>
        )}

        {/* Sub Indo Tag (Top Right) */}
        <div className="absolute top-2 right-2 z-10">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-black bg-[#F47521] shadow-md">
            SUB INDO
          </span>
        </div>

        {/* Episode / Type Tag (Bottom Left) */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-black/80 backdrop-blur-sm border border-white/10 uppercase tracking-wide">
            {anime.episodes ? `${anime.episodes} EPISODE` : anime.type || "SERIAL TV"}
          </span>
        </div>
      </div>

      {/* Title & Metadata Info (Crunchyroll Style) */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <h3 className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug text-white group-hover:text-[#F47521] transition-colors">
          {anime.titleEnglish || anime.title}
        </h3>
        
        <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span className="truncate">Serial • Sub | Dub</span>
          <span className="flex items-center gap-0.5 text-[#F47521] font-bold shrink-0 text-[10px]">
            <Sparkles className="w-2.5 h-2.5" /> FHD
          </span>
        </div>
      </div>
    </Link>
  );
}
