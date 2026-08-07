"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MessageSquare, Heart, Send, AlertTriangle, Eye, EyeOff, Sparkles, User } from "lucide-react";
import { CommentItem } from "@/lib/types";

interface CommentSectionProps {
  animeId: number;
  episodeNum: number;
  animeTitle: string;
}

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
];

export default function CommentSection({
  animeId,
  episodeNum,
  animeTitle,
}: CommentSectionProps) {
  const storageKey = `animehub_comments_${animeId}`;
  const [mounted, setMounted] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("OtakuViewer");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setComments(JSON.parse(raw));
      } else {
        // Initial default comments for lively experience
        const initial: CommentItem[] = [
          {
            id: "1",
            animeId,
            episodeNum,
            username: "KiritoGamer",
            avatarUrl: DEFAULT_AVATARS[0],
            content: `Animasi episode ${episodeNum} ini bener-bener keren banget! Studio-nya totalitas banget di scene pertarungan tadi 🔥`,
            isSpoiler: false,
            likes: 24,
            createdAt: Date.now() - 3600000 * 3,
          },
          {
            id: "2",
            animeId,
            episodeNum,
            username: "AnimeLovers99",
            avatarUrl: DEFAULT_AVATARS[1],
            content: `Plot twist di menit ke-18 gila banget! Gak nyangka karakternya bakal ngambil keputusan itu.`,
            isSpoiler: true,
            likes: 12,
            createdAt: Date.now() - 3600000 * 7,
          },
          {
            id: "3",
            animeId,
            episodeNum,
            username: "ShadowBlade",
            avatarUrl: DEFAULT_AVATARS[2],
            content: `Soundtrack pas bagian ending bikin merinding. Wajib masuk playlist Spotify nih!`,
            isSpoiler: false,
            likes: 8,
            createdAt: Date.now() - 3600000 * 14,
          },
        ];
        setComments(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch (e) {
      console.error("Failed to load comments", e);
    }
  }, [animeId, episodeNum, storageKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
    const item: CommentItem = {
      id: Date.now().toString(),
      animeId,
      episodeNum,
      username: authorName.trim() || "Anonim",
      avatarUrl: randomAvatar,
      content: newComment.trim(),
      isSpoiler,
      likes: 0,
      createdAt: Date.now(),
    };

    const updated = [item, ...comments];
    setComments(updated);
    setNewComment("");
    setIsSpoiler(false);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save comment", e);
      }
    }
  };

  const handleLike = (id: string) => {
    const isLiked = likedComments[id];
    setLikedComments((prev) => ({ ...prev, [id]: !isLiked }));

    const updated = comments.map((c) => {
      if (c.id === id) {
        return { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 };
      }
      return c;
    });

    setComments(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save like", e);
      }
    }
  };

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Baru saja";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit yang lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari yang lalu`;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl backdrop-blur-md" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5" style={{ color: "var(--accent)" }} />
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Diskusi Komunitas ({mounted ? comments.length : 0})
          </h3>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Episode {episodeNum} · {animeTitle}
        </span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md"
                 style={{ background: "linear-gradient(135deg, var(--accent), #6d28d9)" }}>
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Nama kamu..."
              className="w-full max-w-xs px-3 py-1.5 text-xs rounded-lg transition-all focus:outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Tulis pendapatmu tentang Episode ${episodeNum}...`}
              className="w-full p-3 text-xs sm:text-sm rounded-xl resize-none transition-all focus:outline-none"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pl-13">
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: "var(--text-muted)" }}>
            <input
              type="checkbox"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              className="rounded accent-violet-600"
            />
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Tandai komentar sebagai spoiler
            </span>
          </label>

          <button
            type="submit"
            disabled={!newComment.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-md shadow-violet-500/20 cursor-pointer"
            style={{ background: "linear-gradient(135deg, var(--accent), #6d28d9)" }}
          >
            <Send className="w-3.5 h-3.5" /> Kirim Komentar
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-xs" style={{ color: "var(--text-muted)" }}>
            Belum ada komentar di episode ini. Jadilah yang pertama berkomentar!
          </div>
        ) : (
          comments.map((comment) => {
            const isLiked = !!likedComments[comment.id];
            const isRevealed = revealedSpoilers[comment.id];

            return (
              <div
                key={comment.id}
                className="p-4 rounded-xl transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, hsl(${
                          (comment.username.charCodeAt(0) * 47) % 360
                        }, 70%, 50%), hsl(${
                          (comment.username.charCodeAt(0) * 47 + 60) % 360
                        }, 70%, 35%))`,
                      }}
                    >
                      {comment.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                          {comment.username}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-semibold">
                          EP {comment.episodeNum}
                        </span>
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isLiked ? "bg-rose-500/20 text-rose-400" : "hover:bg-white/5 text-white/50"
                    }`}
                    title="Sukai komentar ini"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-400" : ""}`} />
                    <span>{comment.likes}</span>
                  </button>
                </div>

                {/* Comment Content (with Spoiler Shield) */}
                {comment.isSpoiler && !isRevealed ? (
                  <div
                    onClick={() => toggleSpoiler(comment.id)}
                    className="p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-amber-500/10"
                    style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px dashed rgba(245, 158, 11, 0.4)" }}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Komentar ini mengandung spoiler episode.</span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-amber-300 hover:underline">
                      <Eye className="w-3.5 h-3.5" /> Buka Spoiler
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {comment.content}
                    </p>
                    {comment.isSpoiler && (
                      <button
                        onClick={() => toggleSpoiler(comment.id)}
                        className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-2 hover:underline"
                      >
                        <EyeOff className="w-3 h-3" /> Tutup kembali spoiler
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
