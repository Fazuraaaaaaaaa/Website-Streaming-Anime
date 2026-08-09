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
    <div className="bg-[#23252b] rounded-md p-5 border border-white/5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-[#F47521]" />
          <h3 className="text-xs font-black tracking-wider uppercase text-white">
            DAFTAR EPISODE (SUB INDO)
          </h3>
        </div>

        {/* AutoNext Toggle */}
        <button
          onClick={onToggleAutoNext}
          className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            autoNext
              ? "bg-[#F47521] text-black"
              : "bg-white/5 text-zinc-400 border border-white/10"
          }`}
          title="Otomatis memutar episode berikutnya"
        >
          {autoNext ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          Auto Next
        </button>
      </div>

      {/* Quick Search */}
      {episodeList.length > 8 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari nomor episode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs rounded bg-[#141519] border border-white/10 text-white outline-none focus:border-[#F47521]"
          />
        </div>
      )}

      {/* Vertical Episode Stack List */}
      <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
        {filteredEpisodes.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
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
                className={`group flex items-center justify-between p-3 rounded transition-all duration-200 ${
                  isCurrent
                    ? "bg-[#F47521]/15 border border-[#F47521] text-[#F47521] font-bold shadow-md"
                    : "bg-[#141519] hover:bg-[#2a2c34] border border-white/5 text-zinc-300 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Play
                    className={`w-3.5 h-3.5 ${
                      isCurrent
                        ? "fill-[#F47521] text-[#F47521]"
                        : "text-zinc-500 group-hover:text-[#F47521]"
                    }`}
                  />
                  <span className="text-xs font-bold">
                    Episode {ep.mal_id}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-black/60 text-[#F47521]">
                    SUB INDO
                  </span>
                  {isWatched && !isCurrent && (
                    <span title="Sudah ditonton">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
