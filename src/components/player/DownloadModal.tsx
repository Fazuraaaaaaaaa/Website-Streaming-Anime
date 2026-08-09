"use client";

import { useState } from "react";
import { X, Download, HardDrive, Check, ExternalLink, Sparkles, Video } from "lucide-react";
import { VideoServer } from "@/lib/types";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeTitle: string;
  episodeNum: string | number;
  activeServer?: VideoServer;
}

export default function DownloadModal({
  isOpen,
  onClose,
  animeTitle,
  episodeNum,
  activeServer,
}: DownloadModalProps) {
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadOptions = [
    { quality: "720p HD", size: "Bervariasi", server: "Premium Downloader", ext: "MP4", desc: "Kualitas tajam standar" },
    { quality: "1080p FHD", size: "Bervariasi", server: "VIP Downloader", ext: "MP4", desc: "Kualitas tertinggi", popular: true },
  ];

  const handleDownload = (quality: string) => {
    setDownloadingQuality(quality);
    setTimeout(() => {
      // Ekstrak ID YouTube jika menggunakan server YouTube
      let ytVideoId = "";
      if (activeServer?.url?.includes("youtube.com/embed/")) {
        ytVideoId = activeServer.url.split("embed/")[1].split("?")[0];
      }

      const queryTitle = `${animeTitle} Episode ${episodeNum} Sub Indo`;
      
      let redirectUrl = "";
      if (ytVideoId) {
        // Redirect ke pengunduh YouTube populer menggunakan Video ID
        redirectUrl = `https://ssyoutube.com/en731ve/youtube-video-downloader?url=https://www.youtube.com/watch?v=${ytVideoId}`;
      } else {
        // Fallback pencarian generik
        redirectUrl = `https://www.google.com/search?q=Download+${encodeURIComponent(queryTitle)}+MP4`;
      }

      window.open(redirectUrl, "_blank");
      setDownloadingQuality(null);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-md p-6 shadow-2xl bg-[#23252b] border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#F47521]/15">
              <Download className="w-5 h-5 text-[#F47521]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                Download <Video className="w-4 h-4 text-red-500" />
              </h3>
              <p className="text-xs truncate max-w-xs text-zinc-400">
                {animeTitle} - Episode {episodeNum}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Options */}
        <div className="py-4 space-y-2.5">
          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
            Pilih Resolusi Video
          </p>

          {downloadOptions.map((opt) => (
            <div
              key={opt.quality}
              className={`relative flex items-center justify-between p-3.5 rounded transition-all duration-200 bg-[#141519] border ${
                opt.popular ? "border-[#F47521] shadow-md shadow-[#F47521]/10" : "border-white/5"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {opt.quality}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                    {opt.ext}
                  </span>
                  {opt.popular && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-black uppercase bg-[#F47521] text-black">
                      <Sparkles className="w-3 h-3" /> Rekomendasi
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 text-zinc-400">
                  Ukuran: <span className="font-semibold text-zinc-200">{opt.size}</span> · {opt.desc}
                </p>
              </div>

              <button
                onClick={() => handleDownload(opt.quality)}
                disabled={downloadingQuality === opt.quality}
                className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ml-3 ${
                  opt.popular
                    ? "bg-[#F47521] hover:bg-[#FF640A] text-black shadow-md shadow-[#F47521]/30"
                    : "bg-[#23252b] hover:bg-[#2e3038] text-white border border-white/10"
                }`}
              >
                {downloadingQuality === opt.quality ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Mengunduh...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Unduh
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Batch download info */}
        <div className="p-3 rounded flex items-center justify-between text-xs bg-white/5 border border-dashed border-white/10">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#FAB818]" />
            <span className="text-zinc-300">Download Batch All Episodes (.zip)</span>
          </div>
          <button
            onClick={() => handleDownload("Batch Zip")}
            className="flex items-center gap-1 text-xs font-bold text-[#F47521] hover:underline cursor-pointer"
          >
            Pilih Server <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
