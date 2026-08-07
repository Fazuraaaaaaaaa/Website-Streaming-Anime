"use client";

import { useState, useEffect } from "react";
import HeroSpotlight from "@/components/home/HeroSpotlight";
import RecentEpisodes from "@/components/home/RecentEpisodes";
import TopPopular from "@/components/home/TopPopular";
import { SkeletonHero } from "@/components/ui/SkeletonCard";
import { JikanAnime, JikanResponse } from "@/lib/types";
import { RefreshCw, AlertTriangle } from "lucide-react";

const JIKAN_BASE = "https://api.jikan.moe/v4";

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
        continue;
      }
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1500));
        continue;
      }
      return await res.json();
    } catch {
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  return null;
}

function InlineSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-[#0d1124] border border-white/5">
          <div className="skeleton aspect-[3/4] w-full" />
          <div className="p-3.5 space-y-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
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
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(false);

      const topRes = await fetchWithRetry<JikanResponse<JikanAnime[]>>(
        `${JIKAN_BASE}/top/anime?limit=8&filter=airing`
      );
      if (cancelled) return;
      if (topRes?.data) setTopAnime(topRes.data);

      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;

      const seasonRes = await fetchWithRetry<JikanResponse<JikanAnime[]>>(
        `${JIKAN_BASE}/seasons/now?page=1&limit=16`
      );
      if (cancelled) return;
      if (seasonRes?.data) setSeasonAnime(seasonRes.data);

      await new Promise((r) => setTimeout(r, 600));
      if (cancelled) return;

      const popularRes = await fetchWithRetry<JikanResponse<JikanAnime[]>>(
        `${JIKAN_BASE}/top/anime?limit=10&filter=bypopularity`
      );
      if (cancelled) return;
      if (popularRes?.data) setPopularAnime(popularRes.data);

      const hasAny =
        (topRes?.data?.length ?? 0) > 0 ||
        (seasonRes?.data?.length ?? 0) > 0 ||
        (popularRes?.data?.length ?? 0) > 0;

      if (!hasAny) setError(true);
      setIsLoading(false);
    }

    loadData();
    return () => { cancelled = true; };
  }, [retryCount]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <SkeletonHero />
        <div className="flex items-center gap-3 px-1">
          <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
          <p className="text-sm font-semibold text-slate-300">
            Memuat data anime dari server Jikan API...
          </p>
        </div>
        <InlineSkeletonGrid />
      </div>
    );
  }

  if (error && topAnime.length === 0 && seasonAnime.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-fade-in">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h2 className="text-xl font-black text-white">Server API Sedang Sibuk</h2>
        <p className="text-sm text-slate-400 text-center max-w-md">
          Jikan API (MyAnimeList) sedang mengalami rate-limit atau timeout. Coba muat ulang.
        </p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <>
      {topAnime.length > 0 && <HeroSpotlight animeList={topAnime.slice(0, 6)} />}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-10">
          {seasonAnime.length > 0 && (
            <RecentEpisodes animeList={seasonAnime} title="Rilisan Episode Terbaru" />
          )}
          {topAnime.length > 0 && (
            <RecentEpisodes animeList={topAnime} title="Anime Populer Sedang Tayang" />
          )}
        </div>

        {popularAnime.length > 0 && (
          <aside className="hidden lg:block sticky top-24">
            <TopPopular animeList={popularAnime} />
          </aside>
        )}
      </div>
    </>
  );
}
