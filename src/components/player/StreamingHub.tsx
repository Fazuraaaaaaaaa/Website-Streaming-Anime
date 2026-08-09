"use client";

import { useState, useMemo, useEffect } from "react";
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
  Sparkles,
  RefreshCw,
  AlertCircle,
  Zap,
} from "lucide-react";
import VideoPlayer from "./VideoPlayer";
import ServerSelector from "./ServerSelector";
import EpisodeSelector from "./EpisodeSelector";
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

  // Fetch servers from API (which includes server-side YouTube search)
  const [servers, setServers] = useState<VideoServer[]>([]);
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [activeServerId, setActiveServerId] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoadingServers(true);
    fetch(`/api/stream/${anime.mal_id}?ep=${currentEpisodeNum}&title=${encodeURIComponent(anime.title)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setServers(data.servers || []);
          if (data.servers && data.servers.length > 0) {
            setActiveServerId(data.servers[0].id);
          }
          setIsLoadingServers(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load servers", err);
        if (isMounted) setIsLoadingServers(false);
      });
    return () => {
      isMounted = false;
    };
  }, [anime.mal_id, currentEpisodeNum, anime.title]);

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
      episodeTitle:
        episodes.find((e) => e.mal_id === currentEpisodeNum)?.title ||
        `Episode ${currentEpisodeNum}`,
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

  // Switch to next alternative server
  const handleSwitchAlternativeServer = () => {
    if (servers.length === 0) return;
    const currentIndex = servers.findIndex((s) => s.id === activeServerId);
    const nextIndex = (currentIndex + 1) % servers.length;
    setActiveServerId(servers[nextIndex].id);
  };

  const animeTitle = anime.title_english || anime.title;
  const posterImage = anime.images.webp?.large_image_url || anime.images.jpg.large_image_url;
  const maxEp = anime.episodes || (episodes.length > 0 ? episodes.length : 12);

  const prevEpNum = currentEpisodeNum > 1 ? currentEpisodeNum - 1 : null;
  const nextEpNum = currentEpisodeNum < maxEp ? currentEpisodeNum + 1 : null;

  return (
    <div
      className={`transition-all duration-300 ${
        isTheaterMode ? "bg-[#060911] py-4" : "container-main py-6"
      }`}
    >
      {/* Top Header: Back to Detail Link */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href={`/anime/${anime.mal_id}`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-[#F47521] transition-colors font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Anime</span>
        </Link>

        {/* Sub Indo Indicator Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black bg-[#F47521] text-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subtitle: Bahasa Indonesia</span>
        </div>
      </div>

      {/* Episode Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
          {animeTitle} Episode {currentEpisodeNum} Sub Indo
        </h1>
        {anime.title_japanese && (
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            JP: {anime.title_japanese}
          </p>
        )}
      </div>

      {/* Main Grid: Player on left, Playlist Episode on right */}
      <div
        className={`grid gap-6 ${
          isTheaterMode
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]"
        }`}
      >
        {/* Left: Video Player & Sub-Controls */}
        <div className="space-y-4">
          {/* Custom Video Player with Quick Server and Sandbox */}
          {isLoadingServers || !activeServer ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#F47521] animate-spin" />
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Mencari Sumber Video...</span>
              </div>
            </div>
          ) : (
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
              onSelectServer={setActiveServerId}
              servers={servers}
            />
          )}

          {/* Quick Troubleshooting & Server Switch Assistant Bar */}
          <div className="bg-[#141519] border border-[#F47521]/30 rounded-md p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5 text-xs text-zinc-300">
              <AlertCircle className="w-4 h-4 text-[#F47521] shrink-0" />
              <span>
                Video macet / buffering? Gunakan{" "}
                <strong className="text-[#F47521]">Server 1 (VIP Direct)</strong> untuk kelancaran ekstra.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSwitchAlternativeServer}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-black uppercase text-black bg-[#F47521] hover:bg-[#FF640A] transition-colors cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Ganti Server Alternatif</span>
              </button>
            </div>
          </div>

          {/* Navigation & Server Info Row (Directly below player) */}
          <div className="bg-[#23252b] rounded-md p-4 border border-white/5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            {/* Prev Button */}
            {prevEpNum ? (
              <Link
                href={`/anime/${anime.mal_id}/watch?ep=${prevEpNum}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold uppercase text-zinc-300 hover:text-white bg-[#141519] hover:bg-[#2a2c34] border border-white/5 transition-all shadow-md"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </Link>
            ) : (
              <div className="w-24" />
            )}

            {/* Current Server & Sandbox Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-zinc-400 font-medium">SERVER:</span>
              <span className="font-black text-[#F47521] uppercase">
                {activeServer?.name || "Mencari Server..."}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Anti Iklan Pop-up
              </span>
            </div>

            {/* Next Button */}
            {nextEpNum ? (
              <Link
                href={`/anime/${anime.mal_id}/watch?ep=${nextEpNum}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-xs font-black uppercase text-black bg-[#F47521] hover:bg-[#FF640A] transition-all shadow-lg shadow-[#F47521]/30"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="w-24" />
            )}
          </div>

          {/* Server Selector Matrix */}
          <ServerSelector
            servers={servers}
            activeServerId={activeServerId}
            onSelectServer={setActiveServerId}
          />

          {/* Action Row: Watchlist, Download, Share */}
          <div className="bg-[#23252b] rounded-md p-4 border border-white/5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <BookmarkButton anime={anime} size="md" />

              <button
                onClick={() => setIsDownloadOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold uppercase bg-[#141519] hover:bg-[#2a2c34] text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 text-[#F47521]" /> Download
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded text-xs font-bold uppercase bg-[#141519] hover:bg-[#2a2c34] text-white border border-white/5 hover:border-white/10 transition-all cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4 text-[#F47521]" /> Bagikan
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
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Tv className="w-5 h-5 text-[#F47521]" />
            <h2 className="text-base font-black tracking-wider uppercase text-white">
              Rekomendasi Anime Serupa (Sub Indo)
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
        activeServer={activeServer}
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
