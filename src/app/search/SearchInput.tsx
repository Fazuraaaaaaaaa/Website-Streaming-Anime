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
      <div className="flex items-center rounded overflow-hidden transition-all duration-200 focus-within:ring-2 focus-within:ring-[#F47521] bg-[#23252b] border border-white/10">
        <Search className="w-5 h-5 ml-4 shrink-0 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari judul anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent px-4 py-3.5 text-sm outline-none text-white placeholder:text-zinc-500 font-bold"
          id="search-page-input"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mr-2 p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
        <button
          type="submit"
          className="shrink-0 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-black bg-[#F47521] hover:bg-[#FF640A] transition-colors cursor-pointer"
        >
          Cari
        </button>
      </div>
    </form>
  );
}
