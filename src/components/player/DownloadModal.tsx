"use client";

import { useState } from "react";
import { X, Download, HardDrive, Check, ExternalLink, Sparkles } from "lucide-react";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  animeTitle: string;
  episodeNum: string | number;
}

export default function DownloadModal({
  isOpen,
  onClose,
  animeTitle,
  episodeNum,
}: DownloadModalProps) {
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadOptions = [
    { quality: "360p SD", size: "~85 MB", server: "Google Drive / Mega", ext: "MP4", desc: "Hemat kuota & cepat unduh" },
    { quality: "480p SD", size: "~140 MB", server: "Google Drive / Mega", ext: "MP4", desc: "Kualitas standar ponsel" },
    { quality: "720p HD", size: "~285 MB", server: "Fast Direct CDN / Mega", ext: "MP4", desc: "Kualitas tajam rekomendasi", popular: true },
    { quality: "1080p FHD", size: "~550 MB", server: "High Speed CDN / GDrive", ext: "MKV x265", desc: "Audio visual maksimal 60fps" },
  ];

  const handleDownload = (quality: string) => {
    setDownloadingQuality(quality);
    setTimeout(() => {
      // Trigger a simulated file download or alert
      const link = document.createElement("a");
      link.href = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
      link.download = `${animeTitle.replace(/[^a-zA-Z0-9]/g, "_")}_EP${episodeNum}_${quality.replace(" ", "_")}.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadingQuality(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px -12px rgba(124, 58, 237, 0.25)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg" style={{ background: "var(--accent-soft)" }}>
              <Download className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Download Episode {episodeNum}
              </h3>
              <p className="text-xs truncate max-w-xs" style={{ color: "var(--text-muted)" }}>
                {animeTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Options */}
        <div className="py-4 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Pilih Resolusi Video
          </p>

          {downloadOptions.map((opt) => (
            <div
              key={opt.quality}
              className={`relative flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 ${
                opt.popular ? "ring-1 ring-violet-500/50" : ""
              }`}
              style={{
                background: opt.popular ? "rgba(124, 58, 237, 0.08)" : "var(--bg-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {opt.quality}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/80 font-mono">
                    {opt.ext}
                  </span>
                  {opt.popular && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                      <Sparkles className="w-3 h-3" /> Rekomendasi
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Ukuran: <span className="font-semibold text-white/90">{opt.size}</span> · {opt.desc}
                </p>
              </div>

              <button
                onClick={() => handleDownload(opt.quality)}
                disabled={downloadingQuality === opt.quality}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer shrink-0 ml-3"
                style={{
                  background: opt.popular
                    ? "linear-gradient(135deg, var(--accent), #6d28d9)"
                    : "var(--bg-card)",
                  border: opt.popular ? "none" : "1px solid var(--border)",
                }}
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
        <div
          className="p-3 rounded-xl flex items-center justify-between text-xs mt-2"
          style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px dashed var(--border)" }}
        >
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-amber-400" />
            <span style={{ color: "var(--text-muted)" }}>Download Batch All Episodes (.zip)</span>
          </div>
          <button
            onClick={() => handleDownload("Batch Zip")}
            className="flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: "var(--accent)" }}
          >
            Pilih Server <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
