"use client";

import Image from "next/image";
import Link from "next/link";
import { History, Play, Trash2, Clock, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
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
            <History className="w-6 h-6" style={{ color: "var(--accent)" }} />
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Riwayat Tontonan
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Lanjutkan menonton anime dari menit terakhir yang kamu tinggalkan.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Apakah kamu yakin ingin menghapus semua riwayat tontonan?")) {
                clearHistory();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition-colors self-start cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Semua Riwayat
          </button>
        )}
      </div>

      {/* Content */}
      {!isLoaded ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div
          className="p-12 text-center rounded-3xl backdrop-blur-md max-w-lg mx-auto"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: "var(--accent-soft)", border: "2px solid var(--accent)" }}>
            <History className="w-8 h-8" style={{ color: "var(--accent)" }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Belum Ada Riwayat Tontonan
          </h3>
          <p className="text-xs sm:text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--text-muted)" }}>
            Anime yang kamu tonton akan otomatis tercatat di sini sehingga kamu bisa melanjutkan kapan saja.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-violet-500/20"
            style={{ background: "linear-gradient(135deg, var(--accent), #6d28d9)" }}
          >
            <Sparkles className="w-4 h-4" /> Mulai Nonton Anime
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item) => (
            <div
              key={item.animeId}
              className="group relative flex gap-4 p-3.5 sm:p-4 rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-violet-500/10"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              {/* Thumbnail with progress overlay */}
              <div className="relative w-28 sm:w-36 aspect-[16/10] rounded-xl overflow-hidden shrink-0">
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
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ background: "linear-gradient(135deg, var(--accent), #6d28d9)" }}
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </Link>
                </div>

                {/* Progress bar at bottom of thumbnail */}
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/60">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${item.progressPercent}%`,
                      background: "linear-gradient(90deg, var(--accent), #a855f7)",
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/anime/${item.animeId}`}>
                      <h3 className="text-xs sm:text-sm font-bold line-clamp-1 hover:text-violet-400 transition-colors"
                          style={{ color: "var(--text-primary)" }}>
                        {item.animeTitle}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeFromHistory(item.animeId)}
                      className="p-1 rounded-md text-white/40 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-semibold mt-1" style={{ color: "var(--accent)" }}>
                    Episode {item.episodeNum} {item.episodeTitle ? `· ${item.episodeTitle}` : ""}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                    <span className="font-mono text-white/80 font-medium">
                      {formatTime(item.currentTime)} / {formatTime(item.duration)}
                    </span>
                    <span>({item.progressPercent}%)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t mt-2" style={{ borderColor: "var(--border)" }}>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Ditonton {formatTimeAgo(item.updatedAt)}
                  </span>

                  <Link
                    href={`/anime/${item.animeId}/watch?ep=${item.episodeNum}`}
                    className="flex items-center gap-1 text-xs font-bold text-violet-400 hover:underline"
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
