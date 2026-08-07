import { Suspense } from "react";
import { getTopAnime, getSeasonNow, getPopularAnime } from "@/lib/api";
import HeroSpotlight from "@/components/home/HeroSpotlight";
import RecentEpisodes from "@/components/home/RecentEpisodes";
import TopPopular from "@/components/home/TopPopular";
import ContinueWatching from "@/components/home/ContinueWatching";
import HomeFallback from "@/components/home/HomeFallback";
import { SkeletonHero } from "@/components/ui/SkeletonCard";

export const revalidate = 60;

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <SkeletonHero />
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
    </div>
  );
}

async function fetchHomeData() {
  try {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const topRes = await getTopAnime(8).catch(() => null);
    await delay(500);
    const seasonRes = await getSeasonNow(1, 16).catch(() => null);
    await delay(500);
    const popularRes = await getPopularAnime(10).catch(() => null);

    const topAnime = topRes?.data || [];
    const seasonAnime = seasonRes?.data || [];
    const popularAnime = popularRes?.data || [];

    if (topAnime.length === 0 && seasonAnime.length === 0 && popularAnime.length === 0) {
      return null;
    }

    return { topAnime, seasonAnime, popularAnime };
  } catch {
    return null;
  }
}

async function HomeContent() {
  const data = await fetchHomeData();

  if (!data) {
    return <HomeFallback />;
  }

  const { topAnime, seasonAnime, popularAnime } = data;

  return (
    <>
      {topAnime.length > 0 ? (
        <HeroSpotlight animeList={topAnime.slice(0, 6)} />
      ) : (
        <SkeletonHero />
      )}

      <ContinueWatching />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        <div className="space-y-10">
          {seasonAnime.length > 0 && (
            <RecentEpisodes animeList={seasonAnime} title="Rilisan Episode Terbaru" />
          )}
          {topAnime.length > 0 && (
            <RecentEpisodes animeList={topAnime} title="Anime Populer Sedang Tayang" />
          )}
          {seasonAnime.length === 0 && topAnime.length === 0 && <HomeFallback />}
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

export default function HomePage() {
  return (
    <div className="container-main py-6 space-y-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
