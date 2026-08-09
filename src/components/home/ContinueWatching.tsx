"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Play, Trash2 } from "lucide-react";
import { useWatchHistory } from "@/hooks/useWatchHistory";

export default function ContinueWatching() {
  const [mounted, setMounted] = useState(false);
  const { history, isLoaded, removeFromHistory } = useWatchHistory();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded || history.length === 0) return null;

  return (
    <section className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-[#F47521]" />
          <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
            Lanjutkan Menonton (Sub Indo)
          </h2>
        </div>
        <Link
          href="/history"
          className="text-xs font-bold text-[#F47521] hover:underline transition-colors uppercase tracking-wider"
        >
          Lihat Semua ({history.length}) →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {history.slice(0, 6).map((item) => {
          const progressPercent = item.progressPercent || 0;

          return (
            <div
              key={`${item.animeId}-${item.episodeNum}`}
              className="group relative bg-[#23252b] rounded-md overflow-hidden border border-white/5 hover:border-[#F47521] transition-all duration-200 shadow-xl hover:-translate-y-1"
            >
              <Link
                href={`/anime/${item.animeId}/watch?ep=${item.episodeNum}`}
                className="block relative aspect-[16/10] overflow-hidden bg-[#141519]"
              >
                <Image
                  src={item.animeImage}
                  alt={item.animeTitle}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#F47521] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </div>
                {/* Crunchyroll Orange Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/80">
                  <div
                    className="h-full bg-[#F47521]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </Link>

              <div className="p-2.5">
                <Link
                  href={`/anime/${item.animeId}/watch?ep=${item.episodeNum}`}
                  className="font-bold text-xs text-white line-clamp-1 hover:text-[#F47521] transition-colors"
                >
                  {item.animeTitle}
                </Link>
                <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                  <span className="font-bold text-[#F47521]">Ep {item.episodeNum}</span>
                  <span>{progressPercent}%</span>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFromHistory(item.animeId);
                }}
                className="absolute top-2 right-2 p-1 rounded bg-black/70 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                title="Hapus dari riwayat"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
