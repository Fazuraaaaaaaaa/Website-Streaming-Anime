"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Star, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { formatScore, getStatusLabel } from "@/lib/utils";
import type { JikanAnime } from "@/lib/types";

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
    setTimeout(() => setIsTransitioning(false), 500);
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
    <section id="hero-spotlight" className="relative w-full overflow-hidden rounded-3xl bg-[#0d1124] border border-white/10 shadow-2xl my-4">
      {/* Background Anime Blur Backdrop */}
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
            className="object-cover blur-2xl scale-125"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1124] via-[#0d1124]/80 to-[#0d1124]/90" />
        </div>
      ))}

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col sm:flex-row items-center sm:items-center gap-8 min-h-[380px]">
        {/* Left: Poster */}
        <Link
          href={`/anime/${anime.mal_id}`}
          className="shrink-0 group block"
          title={`Lihat ${anime.title}`}
        >
          <div className="relative w-44 sm:w-52 h-64 sm:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 group-hover:ring-violet-500/60 transition-all duration-300 group-hover:scale-[1.02]">
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
          {/* Spotlight Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-violet-600 shadow-md shadow-violet-600/30">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>POPULAR SPOTLIGHT</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight">
            {anime.title_english || anime.title}
          </h1>

          {/* Rating & Status */}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-300 font-medium">
            <span>Rating:</span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-current" />
              {formatScore(anime.score)}
            </span>
            <span className="text-slate-500">•</span>
            <span>Status: <strong className="text-violet-300 font-semibold">{getStatusLabel(anime.status)}</strong></span>
          </div>

          {/* Description Tagline */}
          <p className="text-sm text-slate-300/90 leading-relaxed max-w-2xl">
            Tonton episode ter-update dari anime ini secara eksklusif dengan kualitas terbaik sekarang.
          </p>

          {/* CTA Button */}
          <div className="pt-2 flex items-center justify-center sm:justify-start gap-4">
            <Link
              href={`/anime/${anime.mal_id}/watch?ep=1`}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/40 hover:shadow-violet-600/60 hover:scale-105 transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-white" />
              Mulai Menonton
            </Link>
            <Link
              href={`/anime/${anime.mal_id}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
            >
              Detail Anime
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#060814]/70 hover:bg-violet-600 border border-white/10 text-white transition-all duration-200 hover:scale-110 shadow-lg"
        aria-label="Previous anime"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#060814]/70 hover:bg-violet-600 border border-white/10 text-white transition-all duration-200 hover:scale-110 shadow-lg"
        aria-label="Next anime"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {animeList.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`transition-all duration-300 rounded-full ${
              i === currentIndex
                ? "w-8 h-2 bg-violet-500 shadow-md shadow-violet-500/50"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
