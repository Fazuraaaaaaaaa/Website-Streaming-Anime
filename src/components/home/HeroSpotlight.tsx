"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, Sparkles, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { formatScore, getStatusLabel } from "@/lib/utils";
import type { JikanAnime } from "@/lib/types";
import BookmarkButton from "@/components/anime/BookmarkButton";

interface HeroSpotlightProps {
  animeList: JikanAnime[];
}

export default function HeroSpotlight({ animeList }: HeroSpotlightProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 400);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % animeList.length);
  }, [currentIndex, animeList.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + animeList.length) % animeList.length);
  }, [currentIndex, animeList.length, goTo]);

  // Auto-play every 7 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [goNext]);

  if (!animeList.length) return null;

  const anime = animeList[currentIndex];
  const posterImage = anime.images.webp?.large_image_url || anime.images.jpg.large_image_url;

  return (
    <section id="hero-spotlight" className="relative w-full overflow-hidden rounded-lg bg-[#141519] border border-white/10 shadow-2xl my-4">
      {/* Background Anime Blur & Backdrop */}
      {animeList.map((item, i) => (
        <div
          key={item.mal_id}
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{ opacity: i === currentIndex ? 0.35 : 0 }}
        >
          <Image
            src={item.images.webp?.large_image_url || item.images.jpg.large_image_url}
            alt={item.title}
            fill
            sizes="100vw"
            className="object-cover blur-2xl scale-110"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0d10] via-[#0c0d10]/90 to-[#141519]/80" />
        </div>
      ))}

      {/* Content Container (Crunchyroll Showcase Style) */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col sm:flex-row items-center gap-8 min-h-[380px]">
        {/* Left: Poster */}
        <Link
          href={`/anime/${anime.mal_id}`}
          className="shrink-0 group block"
          title={`Lihat ${anime.title}`}
        >
          <div className="relative w-44 sm:w-52 h-64 sm:h-76 rounded-md overflow-hidden shadow-2xl shadow-black ring-1 ring-white/10 group-hover:ring-[#F47521] transition-all duration-300 group-hover:scale-[1.02] bg-[#23252b]">
            <Image
              src={posterImage}
              alt={anime.title}
              fill
              sizes="(max-width: 640px) 176px, 208px"
              className="object-cover"
              priority
            />
          </div>
        </Link>

        {/* Right: Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-4" key={anime.mal_id}>
          {/* Spotlight & Sub Indo Badge */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-black tracking-wider text-black bg-[#F47521] shadow-md uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              SOROTAN POPULER
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-black tracking-wider text-white bg-black/80 border border-white/20 uppercase">
              SUB INDONESIA
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-[11px] font-black tracking-wider text-black bg-[#FAB818] uppercase">
              1080P FHD
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight line-clamp-2">
            {anime.title_english || anime.title}
          </h1>

          {/* Rating, Studio, Status */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-300 font-semibold">
            <span className="flex items-center gap-1 text-[#FAB818] font-bold bg-[#FAB818]/10 px-2 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-[#FAB818]" />
              {formatScore(anime.score)}
            </span>
            <span>•</span>
            <span className="uppercase">{anime.type || "SERIAL TV"}</span>
            <span>•</span>
            <span className="text-[#F47521] font-bold">{getStatusLabel(anime.status)}</span>
            {anime.studios && anime.studios.length > 0 && (
              <>
                <span>•</span>
                <span className="text-zinc-400">{anime.studios[0].name}</span>
              </>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-2xl line-clamp-3">
            {anime.synopsis ||
              "Tonton episode ter-update dari anime ini secara eksklusif dengan kualitas terbaik dan subtitle Indonesia di RafQ Dev."}
          </p>

          {/* CTA Buttons (Crunchyroll Style) */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Link
              href={`/anime/${anime.mal_id}/watch?ep=1`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-xs sm:text-sm font-black text-black bg-[#F47521] hover:bg-[#FF640A] shadow-xl shadow-[#F47521]/30 hover:scale-105 transition-all duration-200 uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-black" />
              MULAI MENONTON S1 E1
            </Link>
            <Link
              href={`/anime/${anime.mal_id}`}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-md text-xs sm:text-sm font-bold text-white bg-[#23252b] hover:bg-[#2a2c34] border border-white/10 transition-all duration-200 uppercase tracking-wider"
            >
              RINCIAN ANIME
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#0c0d10]/90 hover:bg-[#F47521] hover:text-black border border-white/10 text-white transition-all duration-200 hover:scale-110 shadow-xl cursor-pointer"
        aria-label="Previous anime"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#0c0d10]/90 hover:bg-[#F47521] hover:text-black border border-white/10 text-white transition-all duration-200 hover:scale-110 shadow-xl cursor-pointer"
        aria-label="Next anime"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {animeList.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === currentIndex ? "w-8 bg-[#F47521]" : "w-2 bg-white/25 hover:bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
