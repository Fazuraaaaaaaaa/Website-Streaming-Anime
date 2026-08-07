"use client";

import { useState } from "react";
import { X, Share2, Copy, Check, MessageCircle, Send, Code } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  animeTitle?: string;
  episodeNum?: number;
  url?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  animeTitle,
  episodeNum,
  url,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const displayTitle =
    title || (animeTitle ? `${animeTitle}${episodeNum ? ` Episode ${episodeNum}` : ""}` : "Anime");
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(`Nonton ${displayTitle} Subtitle Indonesia di Mayonime V3!`);

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const embedCode = `<iframe src="${currentUrl}" width="100%" height="480" frameborder="0" allowfullscreen></iframe>`;

  const handleCopyEmbed = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl overflow-hidden"
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
              <Share2 className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Bagikan Anime
              </h3>
              <p className="text-xs truncate max-w-[240px]" style={{ color: "var(--text-muted)" }}>
                {title}
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

        {/* Copy Link Input */}
        <div className="py-4">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Salin Tautan
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent px-2.5 text-xs focus:outline-none truncate"
              style={{ color: "var(--text-primary)" }}
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 shrink-0 cursor-pointer"
              style={{ background: copied ? "#10b981" : "var(--accent)" }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Salin
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="pb-4">
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Bagikan ke Media Sosial
          </label>
          <div className="grid grid-cols-4 gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(37, 211, 102, 0.15)", border: "1px solid rgba(37, 211, 102, 0.3)" }}
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-300">WhatsApp</span>
            </a>

            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(0, 136, 204, 0.15)", border: "1px solid rgba(0, 136, 204, 0.3)" }}
            >
              <Send className="w-5 h-5 text-sky-400" />
              <span className="text-[10px] font-medium text-sky-300">Telegram</span>
            </a>

            <a
              href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(29, 161, 242, 0.15)", border: "1px solid rgba(29, 161, 242, 0.3)" }}
            >
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-[10px] font-medium text-blue-300">Twitter / X</span>
            </a>

            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105"
              style={{ background: "rgba(66, 103, 178, 0.15)", border: "1px solid rgba(66, 103, 178, 0.3)" }}
            >
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-[10px] font-medium text-indigo-300">Facebook</span>
            </a>
          </div>
        </div>

        {/* Embed code */}
        <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handleCopyEmbed}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            style={{ color: "var(--text-muted)" }}
          >
            <Code className="w-4 h-4" />
            {copiedEmbed ? "Kode Embed Disalin!" : "Salin Kode Embed Player"}
          </button>
        </div>
      </div>
    </div>
  );
}
