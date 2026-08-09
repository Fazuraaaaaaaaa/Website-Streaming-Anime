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
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#F47521] text-black">Sedang Ditonton</span>;
      case "plan_to_watch":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#FAB818] text-black">Rencana Ditonton</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500 text-black">Selesai</span>;
      case "favorite":
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500 text-white">Favorit</span>;
    }
  };

  return (
    <div className="container-main py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-6 h-6 text-[#F47521]" />
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
              Daftar Tontonan Saya
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
            Koleksi anime yang kamu simpan, bookmark, dan rencanakan untuk ditonton di RafQ Dev.
          </p>
        </div>

        {/* Search input in watchlist */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari di watchlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded bg-[#141519] border border-white/10 text-white focus:outline-none focus:border-[#F47521]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-white/10">
        {filterTabs.map((tab) => {
          const isActive = selectedFilter === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#F47521] text-black shadow-lg shadow-[#F47521]/30"
                  : "bg-[#23252b] hover:bg-[#2e3038] text-zinc-300 border border-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                  isActive ? "bg-black/20 text-black" : "bg-white/10 text-zinc-400"
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
            <div key={i} className="aspect-[3/4] rounded animate-pulse bg-white/5" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded bg-[#23252b] border border-white/5 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#F47521]/15 border border-[#F47521]">
            <Bookmark className="w-8 h-8 text-[#F47521]" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-wider mb-2 text-white">
            {searchQuery
              ? "Tidak ada anime yang cocok dengan pencarian"
              : selectedFilter === "all"
              ? "Watchlist Kamu Masih Kosong"
              : "Belum ada anime di kategori ini"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto mb-6">
            Temukan ribuan anime seru di katalog kami dan klik tombol Bookmark untuk menyimpannya ke sini!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded text-xs sm:text-sm font-black uppercase tracking-wider text-black bg-[#F47521] hover:bg-[#FF640A] transition-all shadow-lg shadow-[#F47521]/30"
          >
            <Sparkles className="w-4 h-4" /> Jelajahi Anime Populer
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.animeId}
              className="group relative flex flex-col rounded overflow-hidden transition-all duration-200 bg-[#23252b] border border-white/5 hover:border-[#F47521] shadow-xl"
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
                  className="absolute top-2 right-2 z-10 p-1.5 rounded bg-black/60 hover:bg-rose-600 text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Hapus dari Watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Play Button Overlay */}
                <Link
                  href={`/anime/${item.animeId}/watch?ep=1`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-black bg-[#F47521] shadow-xl scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </div>
                </Link>
              </div>

              {/* Info Bottom */}
              <div className="p-3.5 flex flex-col justify-between flex-1">
                <div>
                  <Link href={`/anime/${item.animeId}`}>
                    <h3 className="text-xs sm:text-sm font-black text-white line-clamp-2 hover:text-[#F47521] transition-colors">
                      {item.titleEnglish || item.title}
                    </h3>
                  </Link>
                  <p className="text-[11px] mt-1 text-zinc-400">
                    {item.totalEpisodes ? `${item.totalEpisodes} Episode` : "Ongoing"}
                    {item.score && ` · ⭐ ${formatScore(item.score)}`}
                  </p>
                </div>

                {/* Action dropdown or link */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/10">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.animeId, e.target.value as WatchlistStatus)}
                    className="text-[10px] font-bold py-1 px-1.5 rounded bg-[#141519] border border-white/10 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="watching" className="bg-[#141519] text-white">Sedang Ditonton</option>
                    <option value="plan_to_watch" className="bg-[#141519] text-white">Rencana Ditonton</option>
                    <option value="completed" className="bg-[#141519] text-white">Selesai</option>
                    <option value="favorite" className="bg-[#141519] text-white">Favorit</option>
                  </select>

                  <Link
                    href={`/anime/${item.animeId}/watch?ep=1`}
                    className="p-1.5 rounded text-[#F47521] hover:bg-[#F47521]/10 transition-colors"
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
