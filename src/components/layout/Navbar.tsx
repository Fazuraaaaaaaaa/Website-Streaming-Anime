"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Compass,
  Calendar,
  Layers,
  Heart,
  Clock,
  Tv,
  ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuickSearch } from "@/hooks/useAnime";
import { formatScore } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useWatchHistory } from "@/hooks/useWatchHistory";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    { href: "/", label: "Beranda", icon: Compass },
    { href: "/jadwal", label: "Jadwal", icon: Calendar },
    { href: "/genres", label: "Genre", icon: Layers },
    {
      href: "/watchlist",
      label: "Watchlist",
      icon: Heart,
      badge: mounted && watchlistLoaded && watchlist.length > 0 ? watchlist.length : null,
    },
  ];

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const showDropdown = isSearchFocused && debouncedQuery.length >= 2;
  const historyCount = mounted && historyLoaded && history.length > 0 ? history.length : null;

  return (
    <nav
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#060814]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40"
          : "bg-[#060814]/40 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-20">
          {/* Mayonime V3 Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group" id="logo-link">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/40 shadow-lg shadow-violet-600/20">
              <Tv className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex items-center tracking-tight text-xl font-black">
              <span className="text-white font-extrabold tracking-wider">MAYO</span>
              <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent ml-0.5 tracking-wider">NIME V3</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white font-bold bg-white/10 shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                  {link.badge !== null && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-violet-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search Bar, History, & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div
                  className={`flex items-center rounded-full transition-all duration-300 bg-[#0d1124] border border-white/10 ${
                    isSearchFocused ? "w-56 sm:w-72 ring-2 ring-violet-500/50 border-violet-500/50" : "w-40 sm:w-56"
                  }`}
                >
                  <Search className="w-4 h-4 ml-3.5 shrink-0 text-slate-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Cari anime..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white outline-none placeholder:text-slate-500"
                    id="search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        inputRef.current?.focus();
                      }}
                      className="mr-2.5 p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  )}
                </div>
              </form>

              {/* Search Dropdown */}
              {showDropdown && (
                <div
                  className="absolute top-full mt-2 w-full right-0 min-w-[320px] rounded-2xl overflow-hidden shadow-2xl shadow-black/70 animate-fade-in z-50 bg-[#0d1124] border border-white/10"
                >
                  {isSearching ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="skeleton w-10 h-14 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="skeleton h-3.5 w-3/4 rounded" />
                            <div className="skeleton h-3 w-1/2 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((anime) => (
                        <Link
                          key={anime.mal_id}
                          href={`/anime/${anime.mal_id}`}
                          onClick={() => {
                            setIsSearchFocused(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                        >
                          <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 relative shadow-md">
                            <Image
                              src={anime.images.webp?.small_image_url || anime.images.jpg.small_image_url}
                              alt={anime.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold line-clamp-1 text-white">
                              {anime.title_english || anime.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {anime.score && (
                                <span className="text-xs text-amber-400 font-semibold">
                                  ★ {formatScore(anime.score)}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">{anime.type || "Anime"}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/search?q=${encodeURIComponent(debouncedQuery)}`}
                        onClick={() => setIsSearchFocused(false)}
                        className="flex items-center justify-center gap-1.5 p-3 text-xs font-bold text-violet-400 hover:bg-violet-600/10 border-t border-white/10 transition-colors"
                      >
                        Lihat semua hasil
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-400">
                      Tidak ada hasil untuk &quot;{debouncedQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Circular History Button with Badge */}
            <Link
              href="/history"
              className="relative p-2.5 rounded-full bg-[#0d1124] border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/40 transition-all duration-200"
              title="Riwayat Nonton"
            >
              <Clock className="w-4 h-4" />
              {historyCount !== null && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {historyCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-5 pt-2 border-t border-white/10 animate-fade-in space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-white font-bold bg-violet-600/20 border border-violet-500/30"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-violet-400" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== null && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-600 text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/history"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-violet-400" />
                <span>Riwayat Nonton</span>
              </div>
              {historyCount !== null && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-violet-600 text-white">
                  {historyCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
