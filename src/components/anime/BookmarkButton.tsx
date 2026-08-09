"use client";

import { useState, useRef, useEffect } from "react";
import { Bookmark, BookmarkCheck, ChevronDown, Heart, Check, PlayCircle, Clock } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchlistStatus } from "@/lib/types";

interface BookmarkButtonProps {
  anime: {
    mal_id: number;
    title: string;
    title_english?: string | null;
    images: {
      webp?: { large_image_url: string };
      jpg: { large_image_url: string };
    };
    score?: number | null;
    episodes?: number | null;
  };
  size?: "sm" | "md" | "lg";
}

export default function BookmarkButton({ anime, size = "md" }: BookmarkButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { isLoaded, addToWatchlist, removeFromWatchlist, getItemStatus } = useWatchlist();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentStatus = mounted && isLoaded ? getItemStatus(anime.mal_id) : null;
  const isBookmarked = !!currentStatus;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleQuick = () => {
    if (isBookmarked) {
      removeFromWatchlist(anime.mal_id);
    } else {
      addToWatchlist({
        animeId: anime.mal_id,
        title: anime.title,
        titleEnglish: anime.title_english,
        image: anime.images.webp?.large_image_url || anime.images.jpg.large_image_url,
        score: anime.score,
        totalEpisodes: anime.episodes,
        status: "watching",
      });
    }
  };

  const handleSelectStatus = (status: WatchlistStatus) => {
    addToWatchlist({
      animeId: anime.mal_id,
      title: anime.title,
      titleEnglish: anime.title_english,
      image: anime.images.webp?.large_image_url || anime.images.jpg.large_image_url,
      score: anime.score,
      totalEpisodes: anime.episodes,
      status,
    });
    setIsOpen(false);
  };

  const statusOptions: { key: WatchlistStatus; label: string; icon: typeof PlayCircle; color: string }[] = [
    { key: "watching", label: "Sedang Ditonton", icon: PlayCircle, color: "text-[#F47521]" },
    { key: "plan_to_watch", label: "Rencana Ditonton", icon: Clock, color: "text-[#FAB818]" },
    { key: "completed", label: "Selesai Ditonton", icon: Check, color: "text-emerald-400" },
    { key: "favorite", label: "Favorit Saya", icon: Heart, color: "text-rose-400" },
  ];

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-xs sm:text-sm",
    lg: "px-6 py-3 text-sm sm:text-base font-bold uppercase tracking-wider",
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button
        onClick={handleToggleQuick}
        className={`flex items-center gap-2 rounded-l font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
          isBookmarked
            ? "text-black bg-[#F47521] shadow-lg shadow-[#F47521]/30"
            : "bg-[#141519] hover:bg-[#2a2c34] text-white border border-white/10"
        } ${sizeClasses[size]}`}
        title={isBookmarked ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-4 h-4 fill-black" />
        ) : (
          <Bookmark className="w-4 h-4 text-[#F47521]" />
        )}
        <span>{isBookmarked ? "Di Watchlist" : "Watchlist"}</span>
      </button>

      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 rounded-r font-black transition-all duration-300 cursor-pointer border-l-0 ${
          isBookmarked
            ? "text-black bg-[#F47521] shadow-lg shadow-[#F47521]/30"
            : "bg-[#141519] hover:bg-[#2a2c34] text-white border border-white/10"
        } ${sizeClasses[size]}`}
        title="Ubah status kategori"
      >
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Category Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-52 rounded-md p-2 bg-[#23252b] border border-white/15 shadow-2xl z-50 animate-fade-in">
          <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-400">
            Pilih Status Watchlist
          </div>

          <div className="space-y-1 mt-1">
            {statusOptions.map((opt) => {
              const isSelected = currentStatus === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectStatus(opt.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                    isSelected ? "bg-[#F47521]/20 text-[#F47521]" : "hover:bg-white/5 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#F47521]" />}
                </button>
              );
            })}
          </div>

          {isBookmarked && (
            <div className="pt-1.5 mt-1.5 border-t border-white/10">
              <button
                onClick={() => {
                  removeFromWatchlist(anime.mal_id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                Hapus dari Watchlist
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
