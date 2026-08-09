"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Compass,
  Calendar,
  Bookmark,
  Shuffle,
  Clock,
  Tv,
  ChevronRight,
  Flame,
  Star,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuickSearch } from "@/hooks/useAnime";
import { formatScore } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { FALLBACK_ANIME_LIST } from "@/lib/fallbackData";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 400);
  const { results: searchResults, isLoading: isSearching } = useQuickSearch(debouncedQuery);

  const [mounted, setMounted] = useState(false);
  const { watchlist, isLoaded: watchlistLoaded } = useWatchlist();
  const { history, isLoaded: historyLoaded } = useWatchHistory();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { href: "/", label: "Jelajahi", icon: Compass },
    { href: "/ongoing", label: "Populer", icon: Flame },
    { href: "/genres", label: "Kategori", icon: Tv },
    { href: "/jadwal", label: "Jadwal Rilis", icon: Calendar },
    {
      href: "/watchlist",
      label: "Daftar Tonton",
      icon: Bookmark,
      badge: mounted && watchlistLoaded && watchlist.length > 0 ? watchlist.length : null,
    },
  ];

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === "Escape") {
        setIsSearchFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      setSearchQuery("");
      inputRef.current?.blur();
    }
  };

  const handleRandomAnime = () => {
    const randomIndex = Math.floor(Math.random() * FALLBACK_ANIME_LIST.length);
    const randomAnime = FALLBACK_ANIME_LIST[randomIndex];
    if (randomAnime) {
      router.push(`/anime/${randomAnime.mal_id}`);
    }
  };

  const showDropdown = isSearchFocused && debouncedQuery.length >= 2;
  const historyCount = mounted && historyLoaded && history.length > 0 ? history.length : null;

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-[#000000]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black"
          : "bg-[#000000]/80 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo: RafQ Dev with Crunchyroll-style Orange Spiral Mark */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" id="logo-link">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#F47521] text-black shadow-lg shadow-[#F47521]/30 transition-transform duration-300 group-hover:scale-110">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93c-2.95-.49-5-3.05-5-6.05 0-3.39 2.76-6.14 6.15-6.14 2.87 0 5.29 2 5.86 4.71-1.39-1.35-3.32-2.19-5.44-2.19-4.14 0-7.5 3.36-7.5 7.5 0 2.21.96 4.2 2.49 5.58-.29-.75-.46-1.57-.46-2.43 0-3.31 2.69-6 6-6 1.49 0 2.86.55 3.91 1.45-.69 2.05-2.64 3.55-4.91 3.57z" />
              </svg>
            </div>
            <div className="flex items-center tracking-tight text-lg font-black">
              <span className="text-white font-extrabold tracking-wider">RafQ</span>
              <span className="text-[#F47521] ml-1 tracking-wider">Dev</span>
              <span className="ml-2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#F47521] text-black uppercase tracking-wider">
                SUB INDO
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Crunchyroll Style) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 ml-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? "text-[#F47521] bg-[#F47521]/15 border-b-2 border-[#F47521]"
                      : "text-zinc-300 hover:text-[#F47521] hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F47521]" : "text-zinc-400"}`} />
                  <span>{link.label}</span>
                  {link.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#F47521] text-black">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" />

          {/* Actions & Search */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Box */}
            <div ref={searchRef} className="relative w-44 sm:w-64 lg:w-72">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Cari anime, genre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full pl-9 pr-8 py-2 rounded-md text-xs bg-[#23252b] border border-white/10 text-white placeholder-zinc-400 focus:outline-none focus:border-[#F47521] focus:ring-1 focus:ring-[#F47521] transition-all"
                  />
                  <kbd className="hidden sm:inline-flex absolute right-2 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-black/40 border border-white/10 rounded">
                    /
                  </kbd>
                </div>
              </form>

              {/* Quick Search Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-[#23252b] border border-white/10 shadow-2xl p-2 z-50 animate-fade-in max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      Mencari anime...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.slice(0, 5).map((anime) => (
                        <Link
                          key={anime.mal_id}
                          href={`/anime/${anime.mal_id}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-black/40 transition-colors group"
                        >
                          <div className="relative w-10 h-14 rounded overflow-hidden shrink-0 bg-zinc-800">
                            <Image
                              src={anime.images.webp?.small_image_url || anime.images.jpg.small_image_url}
                              alt={anime.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white group-hover:text-[#F47521] transition-colors truncate">
                              {anime.title_english || anime.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                              <span className="flex items-center gap-0.5 text-[#FAB818] font-bold">
                                <Star className="w-2.5 h-2.5 fill-[#FAB818]" />
                                {formatScore(anime.score)}
                              </span>
                              <span>•</span>
                              <span>{anime.type || "TV"}</span>
                              <span>•</span>
                              <span className="text-[#F47521] font-bold">SUB INDO</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white shrink-0" />
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="block text-center py-2 text-xs font-bold text-[#F47521] hover:underline"
                      >
                        Lihat Semua Hasil →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      Tidak ada hasil untuk &ldquo;{debouncedQuery}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Random Anime Button */}
            <button
              onClick={handleRandomAnime}
              title="Anime Acak (Random)"
              className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-white/10 bg-[#23252b] text-zinc-300 hover:text-[#F47521] hover:border-[#F47521]/60 transition-all text-xs font-bold cursor-pointer uppercase tracking-wider"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Acak</span>
            </button>

            {/* Watch History Quick Link */}
            <Link
              href="/history"
              title="Riwayat Tontonan"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-md border border-white/10 bg-[#23252b] text-zinc-300 hover:text-white hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wider"
            >
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden xl:inline">Riwayat</span>
              {historyCount !== null && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#F47521] text-black">
                  {historyCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
