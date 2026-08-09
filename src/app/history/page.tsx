"use client";

import Image from "next/image";
import Link from "next/link";
import { History, Play, Trash2, Sparkles, ArrowRight } from "lucide-react";
import { useWatchHistory } from "@/hooks/useWatchHistory";

export default function HistoryPage() {
  const { history, isLoaded, removeFromHistory, clearHistory } = useWatchHistory();

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "00:00";
    const hrs = Math.floor(time / 3600);
    const mins = Math.floor((time % 3600) / 60);
    const secs = Math.floor(time % 60);

    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  };

  return (
    <div className="container-main py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="w-6 h-6 text-[#F47521]" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              Riwayat Tontonan
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
            Lanjutkan menonton anime dari menit terakhir yang kamu tinggalkan di RafQ Dev.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Apakah kamu yakin ingin menghapus semua riwayat tontonan?")) {
                clearHistory();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs font-black uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors self-start cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
          </button>
        )}
      </div>

      {/* Content */}
      {!isLoaded ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded animate-pulse bg-white/5" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center rounded bg-[#23252b] border border-white/5 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#F47521]/15 border border-[#F47521]">
            <History className="w-8 h-8 text-[#F47521]" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-wider mb-2 text-white">
            Belum Ada Riwayat Tontonan
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-6">
            Anime yang kamu tonton akan otomatis tercatat di sini sehingga kamu bisa melanjutkan kapan saja.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-xs sm:text-sm font-black uppercase tracking-wider text-black bg-[#F47521] hover:bg-[#FF640A] transition-all shadow-lg shadow-[#F47521]/30"
          >
            <Sparkles className="w-4 h-4" /> Mulai Nonton Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => (
            <div
              key={item.animeId}
              className="group relative flex gap-4 p-3.5 sm:p-4 rounded transition-all duration-200 bg-[#23252b] border border-white/5 hover:border-[#F47521] shadow-xl"
            >
              {/* Thumbnail with progress overlay */}
              <div className="relative w-28 sm:w-36 aspect-[16/10] rounded overflow-hidden shrink-0">
                <Image
                  src={item.animeImage}
                  alt={item.animeTitle}
                  fill
                  sizes="(max-width: 640px) 120px, 160px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/anime/${item.animeId}/watch?ep=${item.episodeNum}`}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-black bg-[#F47521] shadow-lg"
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </Link>
                </div>

                {/* Progress bar at bottom of thumbnail */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/60">
                  <div
                    className="h-full transition-all bg-[#F47521]"
                    style={{
                      width: `${item.progressPercent}%`,
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/anime/${item.animeId}`}>
                      <h3 className="text-xs sm:text-sm font-black text-white line-clamp-1 hover:text-[#F47521] transition-colors">
                        {item.animeTitle}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeFromHistory(item.animeId)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-black uppercase text-[#F47521] mt-1">
                    Episode {item.episodeNum} {item.episodeTitle ? `· ${item.episodeTitle}` : ""}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400">
                    <span className="font-mono text-zinc-200 font-bold">
                      {formatTime(item.currentTime)} / {formatTime(item.duration)}
                    </span>
                    <span>({item.progressPercent}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 mt-2">
                  <span className="text-[10px] text-zinc-500">
                    Ditonton {formatTimeAgo(item.updatedAt)}
                  </span>

                  <Link
                    href={`/anime/${item.animeId}/watch?ep=${item.episodeNum}`}
                    className="flex items-center gap-1 text-xs font-black uppercase text-[#F47521] hover:underline"
                  >
                    Lanjutkan <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
