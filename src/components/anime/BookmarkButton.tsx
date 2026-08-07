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
    { key: "watching", label: "Sedang Ditonton", icon: PlayCircle, color: "text-blue-400" },
    { key: "plan_to_watch", label: "Rencana Ditonton", icon: Clock, color: "text-amber-400" },
    { key: "completed", label: "Selesai Ditonton", icon: Check, color: "text-emerald-400" },
    { key: "favorite", label: "Favorit Saya", icon: Heart, color: "text-rose-400" },
  ];

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base font-semibold",
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button
        onClick={handleToggleQuick}
        className={`flex items-center gap-2 rounded-l-full font-semibold transition-all duration-300 cursor-pointer ${
          isBookmarked
            ? "text-white shadow-lg shadow-violet-500/25"
            : "hover:bg-white/10 text-white/90"
        } ${sizeClasses[size]}`}
        style={{
          background: isBookmarked
            ? "linear-gradient(135deg, var(--accent), #6d28d9)"
            : "var(--bg-secondary)",
          border: `1px solid ${isBookmarked ? "var(--accent)" : "var(--border)"}`,
        }}
        title={isBookmarked ? "Hapus dari Watchlist" : "Tambah ke Watchlist"}
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-4 h-4 fill-white" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        <span>{isBookmarked ? "Di Watchlist" : "Watchlist"}</span>
      </button>

      {/* Dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 rounded-r-full font-semibold transition-all duration-300 cursor-pointer border-l-0 ${
          isBookmarked
            ? "text-white shadow-lg shadow-violet-500/25"
            : "hover:bg-white/10 text-white/90"
        } ${sizeClasses[size]}`}
        style={{
          background: isBookmarked
            ? "linear-gradient(135deg, var(--accent), #6d28d9)"
            : "var(--bg-secondary)",
          border: `1px solid ${isBookmarked ? "var(--accent)" : "var(--border)"}`,
        }}
        title="Ubah status kategori"
      >
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Category Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-52 rounded-xl p-1.5 shadow-2xl z-50 animate-fade-in"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.7)",
          }}
        >
          <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Pilih Status Watchlist
          </div>

          <div className="space-y-1">
            {statusOptions.map((opt) => {
              const isSelected = currentStatus === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleSelectStatus(opt.key)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected ? "bg-violet-600/20 text-violet-300 font-bold" : "hover:bg-white/5 text-white/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${opt.color}`} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              );
            })}
          </div>

          {isBookmarked && (
            <div className="pt-1 mt-1 border-t" style={{ borderColor: "var(--border)" }}>
              <button
                onClick={() => {
                  removeFromWatchlist(anime.mal_id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
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
