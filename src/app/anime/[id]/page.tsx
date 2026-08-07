import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAnimeById, getAnimeEpisodes } from "@/lib/api";
import { formatScore, formatNumber, getStatusLabel } from "@/lib/utils";
import BookmarkButton from "@/components/anime/BookmarkButton";
import {
  Star,
  Clock,
  Tv,
  Film,
  Play,
  ArrowLeft,
  Info,
  Layers,
} from "lucide-react";

interface AnimeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AnimeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await getAnimeById(Number(id));
    const anime = res.data;
    return {
      title: `${anime.title_english || anime.title} — Mayonime V3`,
      description: anime.synopsis?.slice(0, 160) || `Streaming anime ${anime.title}`,
      openGraph: {
        title: anime.title_english || anime.title,
        description: anime.synopsis?.slice(0, 160) || "",
        images: [anime.images.webp?.large_image_url || anime.images.jpg.large_image_url],
      },
    };
  } catch {
    return { title: "Detail Anime — Mayonime V3" };
  }
}

export default async function AnimeDetailPage({ params }: AnimeDetailPageProps) {
  const { id } = await params;
  const animeId = Number(id);

  let anime;
  let episodes;

  try {
    const [animeRes, episodeRes] = await Promise.all([
      getAnimeById(animeId),
      getAnimeEpisodes(animeId).catch(() => ({ data: [] })),
    ]);
    anime = animeRes.data;
    episodes = episodeRes.data || [];
  } catch {
    return (
      <div className="container-main py-24 text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">Anime Tidak Ditemukan</h1>
        <p className="text-slate-400">Anime yang kamu cari tidak ada atau terjadi kesalahan.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full text-sm font-bold text-white bg-violet-600 shadow-lg shadow-violet-600/30"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const posterImage = anime.images.webp?.large_image_url || anime.images.jpg.large_image_url;

  // Fallback episodes if Jikan episodes list is empty
  const episodeCount = anime.episodes || episodes.length || 12;
  const displayEpisodes =
    episodes.length > 0
      ? episodes
      : Array.from({ length: Math.min(episodeCount, 24) }, (_, i) => ({
          mal_id: episodeCount - i,
          title: `Episode ${episodeCount - i}`,
          filler: false,
        }));

  return (
    <div className="container-main py-8 space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400">
        <Link
          href="/"
          className="flex items-center gap-1.5 hover:text-violet-400 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Beranda</span>
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold truncate max-w-md">
          {anime.title_english || anime.title}
        </span>
      </nav>

      {/* Main Detail Header Container */}
      <div className="bg-[#0d1124] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Column: Big Poster & Watchlist Action */}
          <div className="w-full md:w-72 shrink-0 space-y-4">
            <div className="relative aspect-[3/4.2] w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10">
              <Image
                src={posterImage}
                alt={anime.title}
                fill
                sizes="(max-width: 768px) 100vw, 288px"
                className="object-cover"
                priority
              />
            </div>

            {/* Simpan ke Watchlist Button */}
            <div className="w-full">
              <BookmarkButton anime={anime} size="lg" />
            </div>
          </div>

          {/* Right Column: Title, Stats, Metadata, Genres, Synopsis */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title & Japanese title */}
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {anime.title_english || anime.title}
              </h1>
              {anime.title_japanese && (
                <p className="text-sm sm:text-base text-slate-400 font-medium mt-2">
                  JP: {anime.title_japanese}
                </p>
              )}
            </div>

            {/* 4 Stat Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Score */}
              <div className="bg-[#121735] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SCORE</div>
                  <div className="text-sm font-black text-white">
                    {anime.score ? formatScore(anime.score) : "N/A"}
                    {anime.scored_by && (
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({formatNumber(anime.scored_by)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-[#121735] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                <Tv className="w-5 h-5 text-violet-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">STATUS</div>
                  <div className="text-sm font-black text-white">{getStatusLabel(anime.status)}</div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-[#121735] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">DURASI</div>
                  <div className="text-sm font-black text-white">{anime.duration || "24 min."}</div>
                </div>
              </div>

              {/* Studio */}
              <div className="bg-[#121735] border border-white/5 rounded-2xl p-3.5 flex items-center gap-3">
                <Film className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">STUDIO</div>
                  <div className="text-sm font-black text-white truncate max-w-[120px]">
                    {anime.studios?.map((s) => s.name).join(", ") || "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Box */}
            <div className="bg-[#121735]/60 border border-white/5 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm space-y-2 text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong className="text-slate-400">Tipe:</strong>{" "}
                  <span className="font-semibold text-white">{anime.type || "TV"}</span>
                </div>
                <div>
                  <strong className="text-slate-400">Rilis:</strong>{" "}
                  <span className="font-semibold text-white">{anime.aired?.string || anime.season || "Unknown"}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                <div>
                  <strong className="text-slate-400">Sumber:</strong>{" "}
                  <span className="font-semibold text-white">{anime.source || "Original"}</span>
                </div>
                <div>
                  <strong className="text-slate-400">Produser:</strong>{" "}
                  <span className="font-semibold text-white">
                    {anime.producers?.map((p) => p.name).slice(0, 2).join(", ") || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Genre Pill Badges */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <span
                  key={g.mal_id}
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#121735] text-slate-200 border border-white/10 hover:border-violet-500/50 transition-colors"
                >
                  {g.name}
                </span>
              ))}
              {anime.themes?.map((t) => (
                <span
                  key={t.mal_id}
                  className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#121735] text-slate-200 border border-white/10 hover:border-violet-500/50 transition-colors"
                >
                  {t.name}
                </span>
              ))}
            </div>

            {/* Synopsis Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 text-white font-bold text-sm tracking-wider uppercase">
                <Info className="w-4 h-4 text-violet-400" />
                <span>SINOPSIS CERITA</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {anime.synopsis || "Sinopsis belum tersedia untuk anime ini."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Episode List Section (3-Column Grid with NONTON button) */}
      <section id="episode-list" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Tv className="w-5 h-5 text-violet-400" />
          <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-white">
            Daftar Semua Episode{" "}
            <span className="text-xs text-slate-400 font-normal lowercase">
              ({displayEpisodes.length} rilis)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayEpisodes.map((ep) => (
            <Link
              key={ep.mal_id}
              href={`/anime/${anime.mal_id}/watch?ep=${ep.mal_id}`}
              className="group bg-[#0d1124] hover:bg-[#121735] border border-white/5 hover:border-violet-500/50 rounded-2xl p-4.5 flex items-center justify-between transition-all duration-200 shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold text-xs border border-violet-500/30 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors">
                    Episode {ep.mal_id}
                  </h3>
                  {ep.title && ep.title !== `Episode ${ep.mal_id}` && (
                    <p className="text-xs text-slate-400 line-clamp-1 max-w-[180px]">
                      {ep.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Mayonime 'NONTON' Pill Button */}
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-300 bg-black/40 border border-white/10 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-500 transition-all shadow-md">
                NONTON
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
