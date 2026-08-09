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
  Sparkles,
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
      title: `${anime.title_english || anime.title} (Sub Indo) — RafQ Dev`,
      description: anime.synopsis?.slice(0, 160) || `Streaming anime ${anime.title} Sub Indo`,
      openGraph: {
        title: `${anime.title_english || anime.title} — RafQ Dev`,
        description: anime.synopsis?.slice(0, 160) || "",
        images: [anime.images.webp?.large_image_url || anime.images.jpg.large_image_url],
      },
    };
  } catch {
    return { title: "Detail Anime — RafQ Dev" };
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
        <h1 className="text-2xl font-black mb-4 text-white uppercase tracking-wider">Anime Tidak Ditemukan</h1>
        <p className="text-zinc-400">Anime yang kamu cari tidak ada atau terjadi kesalahan jaringan.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded text-xs font-black uppercase tracking-wider text-black bg-[#F47521] hover:bg-[#FF640A] shadow-lg shadow-[#F47521]/30 transition-all"
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
      <nav className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:text-[#F47521] transition-colors font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-bold truncate max-w-md">
            {anime.title_english || anime.title}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black uppercase tracking-wider bg-[#F47521] text-black">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sub Indo Ready</span>
        </div>
      </nav>

      {/* Main Detail Header Container */}
      <div className="bg-[#23252b] rounded-md p-6 sm:p-10 border border-white/5 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Column: Big Poster & Watchlist Action */}
          <div className="w-full md:w-72 shrink-0 space-y-4">
            <div className="relative aspect-[3/4.2] w-full rounded-md overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 bg-[#141519]">
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
            <div className="w-full flex justify-center md:justify-start">
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
                <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1.5">
                  JP: {anime.title_japanese}
                </p>
              )}
            </div>

            {/* 4 Stat Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Score */}
              <div className="bg-[#141519] border border-white/5 rounded p-3 flex items-center gap-2.5">
                <Star className="w-5 h-5 text-[#FAB818] fill-[#FAB818] shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">SCORE</div>
                  <div className="text-xs sm:text-sm font-black text-white">
                    {anime.score ? formatScore(anime.score) : "N/A"}
                    {anime.scored_by && (
                      <span className="text-[10px] text-zinc-400 font-normal ml-1">
                        ({formatNumber(anime.scored_by)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-[#141519] border border-white/5 rounded p-3 flex items-center gap-2.5">
                <Tv className="w-5 h-5 text-[#F47521] shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">STATUS</div>
                  <div className="text-xs sm:text-sm font-black text-white">{getStatusLabel(anime.status)}</div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-[#141519] border border-white/5 rounded p-3 flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">DURASI</div>
                  <div className="text-xs sm:text-sm font-black text-white">{anime.duration || "24 min."}</div>
                </div>
              </div>

              {/* Studio */}
              <div className="bg-[#141519] border border-white/5 rounded p-3 flex items-center gap-2.5">
                <Film className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">STUDIO</div>
                  <div className="text-xs sm:text-sm font-black text-white truncate max-w-[120px]">
                    {anime.studios?.map((s) => s.name).join(", ") || "Unknown"}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Box */}
            <div className="bg-[#141519] border border-white/5 rounded p-4 text-xs sm:text-sm space-y-2 text-zinc-300">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong className="text-zinc-400">Tipe:</strong>{" "}
                  <span className="font-bold text-white">{anime.type || "TV"}</span>
                </div>
                <div>
                  <strong className="text-zinc-400">Rilis:</strong>{" "}
                  <span className="font-bold text-white">{anime.aired?.string || anime.season || "Unknown"}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                <div>
                  <strong className="text-zinc-400">Sumber:</strong>{" "}
                  <span className="font-bold text-white">{anime.source || "Original"}</span>
                </div>
                <div>
                  <strong className="text-zinc-400">Bahasa:</strong>{" "}
                  <span className="font-black text-[#F47521] uppercase">Subtitle Indonesia</span>
                </div>
              </div>
            </div>

            {/* Genre Pill Badges */}
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((g) => (
                <span
                  key={g.mal_id}
                  className="px-3.5 py-1 rounded text-xs font-black uppercase tracking-wider bg-[#141519] text-zinc-300 border border-white/10 hover:border-[#F47521] transition-colors"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Synopsis Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2 text-white font-black text-xs sm:text-sm tracking-wider uppercase">
                <Info className="w-4 h-4 text-[#F47521]" />
                <span>SINOPSIS CERITA</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {anime.synopsis || "Sinopsis belum tersedia untuk anime ini."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Episode List Section */}
      <section id="episode-list" className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
          <Tv className="w-5 h-5 text-[#F47521]" />
          <h2 className="text-sm sm:text-base font-black tracking-wider uppercase text-white">
            Daftar Episode Sub Indo{" "}
            <span className="text-xs text-zinc-400 font-normal lowercase">
              ({displayEpisodes.length} episode)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayEpisodes.map((ep) => (
            <Link
              key={ep.mal_id}
              href={`/anime/${anime.mal_id}/watch?ep=${ep.mal_id}`}
              className="group bg-[#23252b] hover:bg-[#2a2c34] border border-white/5 hover:border-[#F47521] rounded p-4 flex items-center justify-between transition-all duration-200 shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#F47521]/15 text-[#F47521] flex items-center justify-center font-bold text-xs border border-[#F47521]/30 group-hover:bg-[#F47521] group-hover:text-black transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#F47521] transition-colors">
                    Episode {ep.mal_id}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Sub Indo • 1080p FHD
                  </p>
                </div>
              </div>

              {/* Nonton Button */}
              <span className="px-3 py-1 rounded text-xs font-black uppercase tracking-wider text-zinc-200 bg-black/40 border border-white/10 group-hover:bg-[#F47521] group-hover:text-black group-hover:border-[#F47521] transition-all shadow-md">
                NONTON
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
