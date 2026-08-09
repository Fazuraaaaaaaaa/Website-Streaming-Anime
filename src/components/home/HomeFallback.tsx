"use client";

import { useState, useEffect } from "react";
import HeroSpotlight from "@/components/home/HeroSpotlight";
import RecentEpisodes from "@/components/home/RecentEpisodes";
import TopPopular from "@/components/home/TopPopular";
import { SkeletonHero } from "@/components/ui/SkeletonCard";
import { JikanAnime, JikanResponse } from "@/lib/types";
import { FALLBACK_ANIME_LIST } from "@/lib/fallbackData";
import { RefreshCw } from "lucide-react";

const JIKAN_BASE = "https://api.jikan.moe/v4";

async function fetchWithRetry<T>(url: string, retries = 2): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
        continue;
      }
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  return null;
}

function InlineSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-md overflow-hidden bg-[#23252b] border border-white/5">
          <div className="skeleton aspect-[2/3] w-full" />
          <div className="p-3 space-y-2">
            <div className="skeleton h-3.5 w-3/4 rounded" />
            <div className="skeleton h-2.5 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeFallback() {
  const [topAnime, setTopAnime] = useState<JikanAnime[]>([]);
  const [seasonAnime, setSeasonAnime] = useState<JikanAnime[]>([]);
  const [popularAnime, setPopularAnime] = useState<JikanAnime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);

      try {
        const topRes = await fetchWithRetry<JikanResponse<JikanAnime[]>>(
          `${JIKAN_BASE}/top/anime?limit=8&filter=airing`
        );
        if (cancelled) return;
        if (topRes?.data && topRes.data.length > 0) {
          setTopAnime(topRes.data);
        } else {
          setTopAnime(FALLBACK_ANIME_LIST.slice(0, 6));
        }

        const seasonRes = await fetchWithRetry<JikanResponse<JikanAnime[]>>(
          `${JIKAN_BASE}/seasons/now?page=1&limit=16`
        );
        if (cancelled) return;
        if (seasonRes?.data && seasonRes.data.length > 0) {
          setSeasonAnime(seasonRes.data);
        } else {
          setSeasonAnime(FALLBACK_ANIME_LIST);
        }

        const popularRes = await fetchWithRetry<JikanResponse<JikanAnime[]>>(
          `${JIKAN_BASE}/top/anime?limit=10&filter=bypopularity`
        );
        if (cancelled) return;
        if (popularRes?.data && popularRes.data.length > 0) {
          setPopularAnime(popularRes.data);
        } else {
          setPopularAnime(FALLBACK_ANIME_LIST.slice(0, 10));
        }
      } catch {
        if (!cancelled) {
          setTopAnime(FALLBACK_ANIME_LIST.slice(0, 6));
          setSeasonAnime(FALLBACK_ANIME_LIST);
          setPopularAnime(FALLBACK_ANIME_LIST.slice(0, 10));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  if (isLoading && topAnime.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <SkeletonHero />
        <div className="flex items-center gap-2.5 px-1">
          <RefreshCw className="w-4 h-4 text-[#F47521] animate-spin" />
          <p className="text-xs font-semibold text-zinc-300">
            Memuat data katalog anime RafQ Dev...
          </p>
        </div>
        <InlineSkeletonGrid />
      </div>
    );
  }

  const activeTop = topAnime.length > 0 ? topAnime : FALLBACK_ANIME_LIST.slice(0, 6);
  const activeSeason = seasonAnime.length > 0 ? seasonAnime : FALLBACK_ANIME_LIST;
  const activePopular = popularAnime.length > 0 ? popularAnime : FALLBACK_ANIME_LIST.slice(0, 10);

  return (
    <>
      {activeTop.length > 0 && <HeroSpotlight animeList={activeTop.slice(0, 6)} />}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-10">
          <RecentEpisodes animeList={activeSeason} title="Update Episode Terbaru (Sub Indo)" />
          <RecentEpisodes animeList={activeTop} title="Anime Populer Sedang Tayang" />
        </div>

        <aside className="hidden lg:block sticky top-24">
          <TopPopular animeList={activePopular} />
        </aside>
      </div>
    </>
  );
}
