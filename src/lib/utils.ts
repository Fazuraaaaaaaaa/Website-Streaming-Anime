// ============================================
// Utility Functions
// ============================================

/**
 * Format a number with compact notation (e.g., 1.2K, 3.4M)
 */
export function formatNumber(num: number | null | undefined): string {
  if (num == null) return "N/A";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

/**
 * Format score to 1 decimal place
 */
export function formatScore(score: number | null | undefined): string {
  if (score == null) return "N/A";
  return score.toFixed(1);
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

/**
 * Get status color class
 */
export function getStatusColor(status: string | null): string {
  switch (status) {
    case "Currently Airing":
      return "text-emerald-400";
    case "Finished Airing":
      return "text-blue-400";
    case "Not yet aired":
      return "text-amber-400";
    default:
      return "text-slate-400";
  }
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: string | null): string {
  switch (status) {
    case "Currently Airing":
      return "Sedang Tayang";
    case "Finished Airing":
      return "Selesai";
    case "Not yet aired":
      return "Belum Tayang";
    default:
      return status ?? "Unknown";
  }
}

/**
 * Format aired date
 */
export function formatAiredDate(dateString: string | null): string {
  if (!dateString) return "?";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "?";
  }
}

/**
 * Get score color based on score value
 */
export function getScoreColor(score: number | null): string {
  if (score == null) return "bg-slate-600";
  if (score >= 8) return "bg-emerald-500";
  if (score >= 7) return "bg-blue-500";
  if (score >= 6) return "bg-amber-500";
  return "bg-red-500";
}

/**
 * Generate genre colors (consistent hash-based)
 */
const genreColors: Record<string, string> = {
  Action: "from-red-500/20 to-orange-500/20 text-red-300 border-red-500/30",
  Adventure: "from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30",
  Comedy: "from-yellow-500/20 to-lime-500/20 text-yellow-300 border-yellow-500/30",
  Drama: "from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30",
  Fantasy: "from-violet-500/20 to-indigo-500/20 text-violet-300 border-violet-500/30",
  Horror: "from-gray-500/20 to-red-900/20 text-gray-300 border-gray-500/30",
  Mystery: "from-indigo-500/20 to-blue-500/20 text-indigo-300 border-indigo-500/30",
  Romance: "from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30",
  "Sci-Fi": "from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/30",
  "Slice of Life": "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30",
  Sports: "from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30",
  Supernatural: "from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 border-fuchsia-500/30",
  Suspense: "from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-500/30",
  Ecchi: "from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/30",
  Mecha: "from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/30",
};

export function getGenreColor(genreName: string): string {
  return genreColors[genreName] || "from-slate-500/20 to-gray-500/20 text-slate-300 border-slate-500/30";
}

/**
 * Delay utility for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * cn() - simple class name joiner
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
