"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  PlayCircle,
  Clock,
  CheckCircle,
  Heart,
  Trash2,
  Play,
  Search,
  ArrowRight,
  Filter,
  Sparkles,
} from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { WatchlistStatus } from "@/lib/types";
import { formatScore } from "@/lib/utils";

export default function WatchlistPage() {
  const { watchlist, isLoaded, removeFromWatchlist, updateStatus } = useWatchlist();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filterTabs: { key: string; label: string; icon: typeof PlayCircle; count: number }[] = useMemo(() => {
    return [
      { key: "all", label: "Semua", icon: Bookmark, count: watchlist.length },
      {
        key: "watching",
        label: "Sedang Ditonton",
        icon: PlayCircle,
        count: watchlist.filter((w) => w.status === "watching").length,
      },
      {
        key: "plan_to_watch",
        label: "Rencana Ditonton",
        icon: Clock,
        count: watchlist.filter((w) => w.status === "plan_to_watch").length,
      },
      {
        key: "completed",
        label: "Selesai",
        icon: CheckCircle,
        count: watchlist.filter((w) => w.status === "completed").length,
      },
      {
        key: "favorite",
        label: "Favorit",
        icon: Heart,
        count: watchlist.filter((w) => w.status === "favorite").length,
      },
    ];
  }, [watchlist]);

  const filteredItems = useMemo(() => {
    let list = watchlist;
    if (selectedFilter !== "all") {
      list = list.filter((w) => w.status === selectedFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.titleEnglish?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [watchlist, selectedFilter, searchQuery]);

  const getStatusBadge = (status: WatchlistStatus) => {
    switch (status) {
      case "watching":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Sedang Ditonton</span>;
      case "plan_to_watch":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Rencana Ditonton</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Selesai</span>;
      case "favorite":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Favorit</span>;
    }
  };

  return (
    <div className="container-main py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-6 h-6" style={{ color: "var(--accent)" }} />
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Daftar Tontonan Saya
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Koleksi anime yang kamu simpan, bookmark, dan rencanakan untuk ditonton.
          </p>
        </div>

        {/* Search input in watchlist */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Cari di watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl transition-all focus:outline-none"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b" style={{ borderColor: "var(--border)" }}>
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "text-white shadow-lg shadow-violet-500/20"
                  : "hover:bg-white/5 text-white/70"
              }`}
              style={{
                background: isActive ? "linear-gradient(135deg, var(--accent), #6d28d9)" : "var(--bg-secondary)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {!isLoaded ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl animate-pulse bg-white/5" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          className="p-12 text-center rounded-3xl backdrop-blur-md max-w-lg mx-auto"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: "var(--accent-soft)", border: "2px solid var(--accent)" }}>
            <Bookmark className="w-8 h-8" style={{ color: "var(--accent)" }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {searchQuery
              ? "Tidak ada anime yang cocok dengan pencarian"
              : selectedFilter === "all"
              ? "Watchlist Kamu Masih Kosong"
              : "Belum ada anime di kategori ini"}
          </h3>
          <p className="text-xs sm:text-sm max-w-sm mx-auto mb-6" style={{ color: "var(--text-muted)" }}>
            Temukan ribuan anime seru di katalog kami dan klik tombol Bookmark untuk menyimpannya ke sini!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-violet-500/20"
            style={{ background: "linear-gradient(135deg, var(--accent), #6d28d9)" }}
          >
            <Sparkles className="w-4 h-4" /> Jelajahi Anime Populer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.animeId}
              className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/20"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              {/* Poster Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Status Badge Top Left */}
                <div className="absolute top-2 left-2 z-10">
                  {getStatusBadge(item.status)}
                </div>

                {/* Remove Button Top Right */}
                <button
                  onClick={() => removeFromWatchlist(item.animeId)}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Hapus dari Watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Play Button Overlay */}
                <Link
                  href={`/anime/${item.animeId}/watch?ep=1`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-xl scale-90 group-hover:scale-100 transition-transform"
                       style={{ background: "linear-gradient(135deg, var(--accent), #6d28d9)" }}>
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </Link>
              </div>

              {/* Info Bottom */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <Link href={`/anime/${item.animeId}`}>
                    <h3 className="text-xs sm:text-sm font-bold line-clamp-2 hover:text-violet-400 transition-colors"
                        style={{ color: "var(--text-primary)" }}>
                      {item.titleEnglish || item.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    {item.totalEpisodes ? `${item.totalEpisodes} Episode` : "Ongoing"}
                    {item.score && ` · ⭐ ${formatScore(item.score)}`}
                  </p>
                </div>

                {/* Action dropdown or link */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.animeId, e.target.value as WatchlistStatus)}
                    className="text-[10px] font-semibold py-1 px-1.5 rounded bg-white/5 border border-white/10 text-white/80 focus:outline-none cursor-pointer"
                  >
                    <option value="watching" className="bg-gray-900 text-white">Sedang Ditonton</option>
                    <option value="plan_to_watch" className="bg-gray-900 text-white">Rencana Ditonton</option>
                    <option value="completed" className="bg-gray-900 text-white">Selesai</option>
                    <option value="favorite" className="bg-gray-900 text-white">Favorit</option>
                  </select>

                  <Link
                    href={`/anime/${item.animeId}/watch?ep=1`}
                    className="p-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors"
                    title="Nonton Sekarang"
                  >
                    <ArrowRight className="w-4 h-4" />
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
