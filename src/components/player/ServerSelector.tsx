"use client";

import { Server, Zap, ShieldCheck } from "lucide-react";
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
  return (
    <div className="bg-[#23252b] rounded-md p-5 border border-white/5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <Server className="w-5 h-5 text-[#F47521]" />
          <h3 className="text-sm font-black tracking-wider uppercase text-white">
            Pilihan Server Streaming (Sub Indo)
          </h3>
        </div>
        <span className="text-[11px] text-[#F47521] font-bold flex items-center gap-1 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> Multi-Source Active
        </span>
      </div>

      {/* Grid of Available Server Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {servers.map((srv) => {
          const isActive = activeServerId === srv.id;

          return (
            <button
              key={srv.id}
              onClick={() => onSelectServer(srv.id)}
              className={`p-3.5 rounded-md text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between gap-2 relative ${
                isActive
                  ? "bg-[#F47521]/15 border-[#F47521] shadow-lg shadow-[#F47521]/20"
                  : "bg-[#141519] hover:bg-[#2a2c34] border-white/5 text-zinc-300 hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-black truncate ${
                    isActive ? "text-[#F47521]" : "text-white"
                  }`}
                >
                  {srv.name.split("•")[0].trim()}
                </span>
                {srv.tag && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                      isActive
                        ? "bg-[#F47521] text-black"
                        : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {srv.tag}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>{srv.quality}</span>
                <span className="font-bold text-[#F47521]">SUB INDO</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notice info */}
      <div className="pt-1 flex items-center gap-2 text-xs text-zinc-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Jika server mengalami buffering, silakan ganti ke server alternatif di atas untuk kelancaran menonton.</span>
      </div>
    </div>
  );
}
