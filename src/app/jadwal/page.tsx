"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Star, Play } from "lucide-react";
import { formatScore } from "@/lib/utils";

interface ScheduleItem {
  id: number;
  title: string;
  image: string;
  time: string;
  episode: number;
  score: number;
  type: string;
}

const SCHEDULE_DATA: Record<string, ScheduleItem[]> = {
  Senin: [
    {
      id: 52991,
      title: "Sousou no Frieren Season 2",
      image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
      time: "21:30 WIB",
      episode: 3,
      score: 9.38,
      type: "TV",
    },
    {
      id: 54744,
      title: "Mushoku Tensei Season 3",
      image: "https://cdn.myanimelist.net/images/anime/1028/136477l.jpg",
      time: "22:00 WIB",
      episode: 5,
      score: 8.78,
      type: "TV",
    },
  ],
  Selasa: [
    {
      id: 5114,
      title: "Fullmetal Alchemist: Brotherhood",
      image: "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg",
      time: "19:00 WIB",
      episode: 12,
      score: 9.10,
      type: "TV",
    },
    {
      id: 55644,
      title: "Wind Breaker Season 2",
      image: "https://cdn.myanimelist.net/images/anime/1815/141384l.jpg",
      time: "20:30 WIB",
      episode: 2,
      score: 8.24,
      type: "TV",
    },
  ],
  Rabu: [
    {
      id: 52034,
      title: "Oshi no Ko Season 2",
      image: "https://cdn.myanimelist.net/images/anime/1806/134019l.jpg",
      time: "21:00 WIB",
      episode: 8,
      score: 8.91,
      type: "TV",
    },
    {
      id: 52701,
      title: "Dungeon Meshi Season 2",
      image: "https://cdn.myanimelist.net/images/anime/1174/141383l.jpg",
      time: "22:30 WIB",
      episode: 4,
      score: 8.65,
      type: "TV",
    },
  ],
  Kamis: [
    {
      id: 52299,
      title: "Solo Leveling Season 2: Arise from the Shadow",
      image: "https://cdn.myanimelist.net/images/anime/1484/141380l.jpg",
      time: "23:00 WIB",
      episode: 6,
      score: 8.84,
      type: "TV",
    },
    {
      id: 48583,
      title: "Shingeki no Kyojin: The Final Season",
      image: "https://cdn.myanimelist.net/images/anime/1000/110531l.jpg",
      time: "20:00 WIB",
      episode: 10,
      score: 9.05,
      type: "TV",
    },
  ],
  Jumat: [
    {
      id: 51009,
      title: "Jujutsu Kaisen Season 3: The Culling Game",
      image: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg",
      time: "22:00 WIB",
      episode: 7,
      score: 8.92,
      type: "TV",
    },
    {
      id: 54112,
      title: "Bleach: Sennen Kessen-hen - Soukoku-tan",
      image: "https://cdn.myanimelist.net/images/anime/1764/126627l.jpg",
      time: "21:30 WIB",
      episode: 9,
      score: 8.89,
      type: "TV",
    },
  ],
  Sabtu: [
    {
      id: 21,
      title: "One Piece (Egghead Arc)",
      image: "https://cdn.myanimelist.net/images/anime/6/73245l.jpg",
      time: "09:30 WIB",
      episode: 1115,
      score: 8.72,
      type: "TV",
    },
    {
      id: 52588,
      title: "Kaijuu 8-gou Season 2",
      image: "https://cdn.myanimelist.net/images/anime/1307/141382l.jpg",
      time: "21:00 WIB",
      episode: 4,
      score: 8.42,
      type: "TV",
    },
  ],
  Minggu: [
    {
      id: 54857,
      title: "Kimetsu no Yaiba: Hashira Geiko-hen",
      image: "https://cdn.myanimelist.net/images/anime/1702/136843l.jpg",
      time: "21:15 WIB",
      episode: 8,
      score: 8.88,
      type: "TV",
    },
    {
      id: 52044,
      title: "Boku no Hero Academia Season 7",
      image: "https://cdn.myanimelist.net/images/anime/1935/141385l.jpg",
      time: "16:30 WIB",
      episode: 14,
      score: 8.35,
      type: "TV",
    },
  ],
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function JadwalPage() {
  const [activeDay, setActiveDay] = useState("Senin");
  const animeList = SCHEDULE_DATA[activeDay] || [];

  return (
    <div className="container-main py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-[#0d1124] rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-violet-600/30 text-violet-300 border border-violet-500/40 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>JADWAL RILIS ANIME</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            Jadwal Tayang Mingguan
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Simak jadwal penayangan episode anime terbaru setiap harinya lengkap dengan estimasi jam rilis Sub Indo.
          </p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => {
          const isActive = activeDay === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 ${
                isActive
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40 scale-105"
                  : "bg-[#0d1124] hover:bg-[#121735] text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Anime Grid for Selected Day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {animeList.map((anime) => (
          <Link
            key={anime.id}
            href={`/anime/${anime.id}`}
            className="group bg-[#0d1124] hover:bg-[#121735] border border-white/5 hover:border-violet-500/50 rounded-3xl p-4.5 flex gap-4 transition-all duration-300 shadow-xl hover:-translate-y-1"
          >
            {/* Poster */}
            <div className="relative w-24 h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg ring-1 ring-white/10">
              <Image
                src={anime.image}
                alt={anime.title}
                fill
                sizes="96px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug">
                  {anime.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {formatScore(anime.score)}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs text-violet-300 font-semibold">
                    Episode {anime.episode}
                  </span>
                </div>
              </div>

              {/* Time Badge */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-2 border-t border-white/5">
                <Clock className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-bold text-white">{anime.time}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
