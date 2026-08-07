"use client";

import { Bookmark, ShieldCheck, Zap } from "lucide-react";
import { VideoServer } from "@/lib/types";

interface ServerSelectorProps {
  servers: VideoServer[];
  activeServerId: string;
  onSelectServer: (serverId: string) => void;
}

export default function ServerSelector({
  servers,
  activeServerId,
  onSelectServer,
}: ServerSelectorProps) {
  const activeServer = servers.find((s) => s.id === activeServerId) || servers[0];

  // Quality groups: 480P, 720P, 1080P
  const qualityRows = [
    {
      label: "480P",
      servers: [
        { id: "srv-4", name: "Wibufile 480p", provider: "Wibufile" },
        { id: "srv-mega-480", name: "Mega 480p", provider: "Mega" },
      ],
    },
    {
      label: "720P",
      servers: [
        { id: "srv-2", name: "Wibufile 720p", provider: "Wibufile" },
        { id: "srv-mega-720", name: "Mega 720p", provider: "Mega" },
      ],
    },
    {
      label: "1080P",
      servers: [
        { id: "srv-1", name: "Wibufile 1080p", provider: "Wibufile" },
        { id: "srv-mega-1080", name: "Mega 1080p", provider: "Mega" },
      ],
    },
  ];

  return (
    <div className="bg-[#0d1124] rounded-3xl p-6 border border-white/10 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
        <Bookmark className="w-5 h-5 text-violet-400" />
        <h3 className="text-base font-black tracking-wider uppercase text-white">
          Pilihan Server Kualitas
        </h3>
      </div>

      {/* Quality Matrix (480p / 720p / 1080p) */}
      <div className="space-y-4">
        {qualityRows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col sm:flex-row sm:items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0"
          >
            {/* Resolution Label */}
            <div className="w-16 text-xs font-black text-slate-400 tracking-wider">
              {row.label}
            </div>

            {/* Server Pill Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {row.servers.map((srv) => {
                const isActive =
                  activeServerId === srv.id ||
                  (row.label === "1080P" && activeServerId === "srv-1" && srv.provider === "Wibufile") ||
                  (row.label === "720P" && activeServerId === "srv-2" && srv.provider === "Wibufile") ||
                  (row.label === "480P" && activeServerId === "srv-4" && srv.provider === "Wibufile");

                return (
                  <button
                    key={srv.id}
                    onClick={() => {
                      // Map to available server id
                      const targetId = srv.id.includes("480")
                        ? "srv-4"
                        : srv.id.includes("720")
                        ? "srv-2"
                        : "srv-1";
                      onSelectServer(targetId);
                    }}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40 scale-105"
                        : "bg-[#121735] hover:bg-[#1a2046] text-slate-300 border border-white/5 hover:border-white/10"
                    }`}
                  >
                    {srv.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
