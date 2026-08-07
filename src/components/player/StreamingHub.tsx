"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Share2,
  Tv,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import ServerSelector from "./ServerSelector";
import EpisodeSelector from "./EpisodeSelector";
import CommentSection from "./CommentSection";
import DownloadModal from "./DownloadModal";
import ShareModal from "./ShareModal";
import BookmarkButton from "../anime/BookmarkButton";
import AnimeCard from "../anime/AnimeCard";
import { JikanAnime, JikanEpisode, VideoServer, toAnimeCard } from "@/lib/types";
import { useWatchHistory } from "@/hooks/useWatchHistory";

interface StreamingHubProps {
  anime: JikanAnime;
  episodes: JikanEpisode[];
  currentEpisodeNum: number;
  recommendations?: JikanAnime[];
}

export default function StreamingHub({
  anime,
  episodes,
  currentEpisodeNum,
  recommendations = [],
}: StreamingHubProps) {
  const router = useRouter();
  const { history, updateProgress, getAnimeProgress } = useWatchHistory();

  // Modals & States
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [autoNext, setAutoNext] = useState(true);

  // Available Streaming Servers
  const servers: VideoServer[] = useMemo(() => {
    const list: VideoServer[] = [
      {
        id: "srv-1",
        name: "Wibufile 1080p",
        quality: "1080p FHD",
        type: "direct",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        tag: "Super Cepat",
      },
      {
        id: "srv-2",
        name: "Wibufile 720p",
        quality: "720p HD",
        type: "direct",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        tag: "Stabil",
      },
      {
        id: "srv-4",
        name: "Wibufile 480p",
        quality: "480p SD",
        type: "direct",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        tag: "Hemat Data",
      },
    ];

    if (anime.trailer?.embed_url) {
      list.push({
        id: "srv-3",
        name: "Trailer Resmi",
        quality: "1080p Official",
        type: "embed",
        url: anime.trailer.embed_url.replace("autoplay=1", "autoplay=0"),
        tag: "Official Embed",
      });
    }

    return list;
  }, [anime.trailer?.embed_url]);

  const [activeServerId, setActiveServerId] = useState(servers[0].id);
  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];

  // Get previous progress for this anime
  const savedProgress = getAnimeProgress(anime.mal_id);
  const savedResumeTime =
    savedProgress && savedProgress.episodeNum === currentEpisodeNum
      ? savedProgress.currentTime
      : 0;

  // Watched episodes list
  const watchedEpisodes = useMemo(() => {
    return history
      .filter((h) => h.animeId === anime.mal_id)
      .map((h) => h.episodeNum);
  }, [history, anime.mal_id]);

  // Handle Progress Save
  const handleSaveProgress = (currentTime: number, duration: number) => {
    updateProgress({
      animeId: anime.mal_id,
      animeTitle: anime.title_english || anime.title,
      animeImage: anime.images.webp?.large_image_url || anime.images.jpg.large_image_url,
      episodeNum: currentEpisodeNum,
      episodeTitle: episodes.find((e) => e.mal_id === currentEpisodeNum)?.title || `Episode ${currentEpisodeNum}`,
      totalEpisodes: anime.episodes,
      currentTime,
      duration,
    });
  };

  // Handle Auto-Next Episode on End
  const handleEpisodeEnded = () => {
    if (!autoNext) return;
    const maxEp = anime.episodes || (episodes.length > 0 ? episodes.length : 12);
    if (currentEpisodeNum < maxEp) {
      router.push(`/anime/${anime.mal_id}/watch?ep=${currentEpisodeNum + 1}`);
    }
  };

  const animeTitle = anime.title_english || anime.title;
  const posterImage = anime.images.webp?.large_image_url || anime.images.jpg.large_image_url;
  const maxEp = anime.episodes || (episodes.length > 0 ? episodes.length : 12);

  const prevEpNum = currentEpisodeNum > 1 ? currentEpisodeNum - 1 : null;
  const nextEpNum = currentEpisodeNum < maxEp ? currentEpisodeNum + 1 : null;

  return (
    <div className={`transition-all duration-300 ${isTheaterMode ? "bg-[#060814] py-4" : "container-main py-6"}`}>
      {/* Top Header: Back to Detail Link */}
      <div className="mb-4">
        <Link
          href={`/anime/${anime.mal_id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-violet-400 transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Anime</span>
        </Link>
      </div>

      {/* Episode Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
          {animeTitle} Episode {currentEpisodeNum} Sub Indo
        </h1>
        {anime.title_japanese && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            JP: {anime.title_japanese}
          </p>
        )}
      </div>

      {/* Main Grid: Player on left, Playlist Episode on right */}
      <div className={`grid gap-6 ${isTheaterMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]"}`}>
        {/* Left: Video Player & Sub-Controls */}
        <div className="space-y-6">
          {/* Custom Video Player */}
          <VideoPlayer
            server={activeServer}
            animeTitle={animeTitle}
            episodeNum={currentEpisodeNum}
            totalEpisodes={anime.episodes}
            animeImage={posterImage}
            animeId={anime.mal_id}
            onEpisodeEnded={handleEpisodeEnded}
            isTheaterMode={isTheaterMode}
            onToggleTheaterMode={() => setIsTheaterMode(!isTheaterMode)}
            savedResumeTime={savedResumeTime}
            onSaveProgress={handleSaveProgress}
          />

          {/* Navigation & Server Info Row (Directly below player) */}
          <div className="bg-[#0d1124] rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            {/* Prev Button */}
            {prevEpNum ? (
              <Link
                href={`/anime/${anime.mal_id}/watch?ep=${prevEpNum}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-[#121735] hover:bg-[#1a2046] border border-white/5 transition-all shadow-md"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </Link>
            ) : (
              <div className="w-28" />
            )}

            {/* Current Server & Sandbox Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">SERVER:</span>
              <span className="font-bold text-white uppercase">{activeServer.name} ({activeServer.quality.split(" ")[0]})</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Premium Sandbox (Anti Pop-Up)
              </span>
            </div>

            {/* Next Button */}
            {nextEpNum ? (
              <Link
                href={`/anime/${anime.mal_id}/watch?ep=${nextEpNum}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/30"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-28" />
            )}
          </div>

          {/* Server Selector Matrix */}
          <ServerSelector
            servers={servers}
            activeServerId={activeServerId}
            onSelectServer={setActiveServerId}
          />

          {/* Action Row: Watchlist, Download, Share */}
          <div className="bg-[#0d1124] rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <BookmarkButton anime={anime} size="md" />

              <button
                onClick={() => setIsDownloadOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#121735] hover:bg-[#1a2046] text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 text-violet-400" /> Download
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#121735] hover:bg-[#1a2046] text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4 text-violet-400" /> Bagikan
              </button>
            </div>
          </div>

          {/* Mobile Playlist Section */}
          <div className="block lg:hidden">
            <EpisodeSelector
              animeId={anime.mal_id}
              currentEpisode={currentEpisodeNum}
              episodes={episodes}
              totalEpisodes={anime.episodes}
              autoNext={autoNext}
              onToggleAutoNext={() => setAutoNext(!autoNext)}
              watchedEpisodes={watchedEpisodes}
            />
          </div>

          {/* Discussion / Comment Section */}
          <CommentSection
            animeId={anime.mal_id}
            episodeNum={currentEpisodeNum}
            animeTitle={animeTitle}
          />
        </div>

        {/* Right Sidebar: Playlist Episode (Sticky on Desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <EpisodeSelector
              animeId={anime.mal_id}
              currentEpisode={currentEpisodeNum}
              episodes={episodes}
              totalEpisodes={anime.episodes}
              autoNext={autoNext}
              onToggleAutoNext={() => setAutoNext(!autoNext)}
              watchedEpisodes={watchedEpisodes}
            />
          </div>
        </aside>
      </div>

      {/* Recommendations Carousel at Bottom */}
      {recommendations.length > 0 && (
        <section className="mt-14 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <Tv className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-black tracking-wider uppercase text-white">
              Rekomendasi Anime Lainnya
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.slice(0, 6).map((rec) => (
              <AnimeCard key={rec.mal_id} anime={toAnimeCard(rec)} />
            ))}
          </div>
        </section>
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        animeTitle={animeTitle}
        episodeNum={currentEpisodeNum}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        animeTitle={animeTitle}
        episodeNum={currentEpisodeNum}
      />
    </div>
  );
}
