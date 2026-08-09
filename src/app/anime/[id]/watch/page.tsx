import type { Metadata } from "next";
import Link from "next/link";
import { getAnimeById, getAnimeEpisodes, getAnimeByGenre } from "@/lib/api";
import { JikanAnime, JikanEpisode } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import StreamingHub from "@/components/player/StreamingHub";

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}

export async function generateMetadata({ params, searchParams }: WatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const { ep } = await searchParams;
  const episodeNum = ep || "1";

  try {
    const res = await getAnimeById(Number(id));
    const anime = res.data;
    const title = anime.title_english || anime.title;
    return {
      title: `Nonton ${title} Episode ${episodeNum} Sub Indo — RafQ Dev`,
      description: `Streaming & nonton anime ${title} Episode ${episodeNum} Subtitle Indonesia gratis kualitas HD 1080p di RafQ Dev.`,
      openGraph: {
        title: `Nonton ${title} Episode ${episodeNum} Sub Indo — RafQ Dev`,
        description: anime.synopsis?.slice(0, 160) || `Nonton ${title} Episode ${episodeNum}`,
        images: [anime.images.webp?.large_image_url || anime.images.jpg.large_image_url],
      },
    };
  } catch {
    return { title: `Nonton Anime Episode ${episodeNum} Sub Indo — RafQ Dev` };
  }
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const { ep } = await searchParams;
  const animeId = Number(id);
  const currentEpisodeNum = parseInt(ep || "1", 10) || 1;

  let anime: JikanAnime | null = null;
  let episodes: JikanEpisode[] = [];
  let recommendations: JikanAnime[] = [];

  try {
    const [animeRes, epRes] = await Promise.all([
      getAnimeById(animeId),
      getAnimeEpisodes(animeId).catch(() => ({ data: [] })),
    ]);

    anime = animeRes.data;
    episodes = epRes.data || [];

    // Fetch recommendations based on primary genre if available
    if (anime.genres && anime.genres.length > 0) {
      try {
        const genreRes = await getAnimeByGenre(anime.genres[0].mal_id, 1);
        recommendations = (genreRes.data || [])
          .filter((item) => item.mal_id !== animeId)
          .slice(0, 6);
      } catch {
        recommendations = [];
      }
    }
  } catch (error) {
    console.error("Failed to load anime for streaming", error);
  }

  if (!anime) {
    return (
      <div className="container-main py-20 text-center">
        <h1 className="text-2xl font-black mb-4 text-white uppercase tracking-wider">
          Anime Tidak Ditemukan
        </h1>
        <p className="text-zinc-400">
          Data streaming anime ini tidak tersedia atau gagal dimuat.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded text-xs font-black uppercase tracking-wider text-black bg-[#F47521] hover:bg-[#FF640A] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <StreamingHub
      anime={anime}
      episodes={episodes}
      currentEpisodeNum={currentEpisodeNum}
      recommendations={recommendations}
    />
  );
}
