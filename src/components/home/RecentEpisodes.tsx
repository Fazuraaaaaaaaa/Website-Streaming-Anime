import AnimeCard from "@/components/anime/AnimeCard";
import { toAnimeCard } from "@/lib/types";
import type { JikanAnime } from "@/lib/types";
import { Sparkles } from "lucide-react";

interface RecentEpisodesProps {
  animeList: JikanAnime[];
  title?: string;
}

export default function RecentEpisodes({
  animeList,
  title = "Update Episode Terbaru",
}: RecentEpisodesProps) {
  if (!animeList.length) return null;

  return (
    <section id="recent-episodes" className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
            {title}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {animeList.map((anime) => (
          <AnimeCard
            key={anime.mal_id}
            anime={toAnimeCard(anime)}
          />
        ))}
      </div>
    </section>
  );
}
