"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Play, Search, CheckCircle2, Tv, ToggleLeft, ToggleRight } from "lucide-react";
import { JikanEpisode } from "@/lib/types";

interface EpisodeSelectorProps {
  animeId: number;
  currentEpisode: number;
  episodes: JikanEpisode[];
  totalEpisodes?: number | null;
  autoNext: boolean;
  onToggleAutoNext: () => void;
  watchedEpisodes?: number[];
}

export default function EpisodeSelector({
  animeId,
  currentEpisode,
  episodes,
  totalEpisodes,
  autoNext,
  onToggleAutoNext,
  watchedEpisodes = [],
}: EpisodeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const episodeList: { mal_id: number; title: string; filler?: boolean }[] = useMemo(() => {
    if (episodes && episodes.length > 0) {
      return episodes;
    }
    const count = totalEpisodes || 12;
    // Order descending if count is small or ascending, let's reverse to show latest at top like Mayonime or ascending
    return Array.from({ length: count }, (_, i) => ({
      mal_id: count - i,
      title: `Episode ${count - i}`,
      filler: false,
    }));
  }, [episodes, totalEpisodes]);

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery.trim()) return episodeList;
    const q = searchQuery.toLowerCase();
    return episodeList.filter(
      (ep) =>
        ep.mal_id.toString().includes(q) ||
        ep.title?.toLowerCase().includes(q)
    );
  }, [episodeList, searchQuery]);

  return (
    <div className="bg-[#0d1124] rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-black tracking-wider uppercase text-white">
            PLAYLIST EPISODE
          </h3>
        </div>

        {/* AutoNext Toggle */}
        <button
          onClick={onToggleAutoNext}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            autoNext
              ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
              : "bg-white/5 text-slate-400 border border-white/10"
          }`}
          title="Otomatis memutar episode berikutnya"
        >
          {autoNext ? <ToggleRight className="w-4 h-4 text-violet-400" /> : <ToggleLeft className="w-4 h-4" />}
          Auto Next
        </button>
      </div>

      {/* Quick Search */}
      {episodeList.length > 8 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari episode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#121735] border border-white/5 text-white outline-none focus:border-violet-500/50"
          />
        </div>
      )}

      {/* Vertical Episode Stack List */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filteredEpisodes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Episode tidak ditemukan
          </div>
        ) : (
          filteredEpisodes.map((ep) => {
            const isCurrent = ep.mal_id === currentEpisode;
            const isWatched = watchedEpisodes.includes(ep.mal_id);

            return (
              <Link
                key={ep.mal_id}
                href={`/anime/${animeId}/watch?ep=${ep.mal_id}`}
                className={`group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 ${
                  isCurrent
                    ? "bg-violet-600/30 border border-violet-500 text-white font-bold shadow-lg shadow-violet-600/20"
                    : "bg-[#121735] hover:bg-[#1a2046] border border-white/5 text-slate-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Play
                    className={`w-3.5 h-3.5 ${
                      isCurrent
                        ? "fill-violet-400 text-violet-400"
                        : "text-slate-500 group-hover:text-violet-400"
                    }`}
                  />
                  <span className="text-sm font-semibold">
                    Episode {ep.mal_id}
                  </span>
                </div>

                {isWatched && !isCurrent && (
                  <span title="Sudah ditonton">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
