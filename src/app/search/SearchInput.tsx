"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  initialQuery: string;
}

export default function SearchInput({ initialQuery }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl">
      <div className="flex items-center rounded-xl overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-violet-500/40"
           style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <Search className="w-5 h-5 ml-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Cari judul anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent px-4 py-3.5 text-base outline-none placeholder:text-slate-500"
          style={{ color: 'var(--text-primary)' }}
          id="search-page-input"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mr-2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
        <button
          type="submit"
          className="shrink-0 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          Cari
        </button>
      </div>
    </form>
  );
}
