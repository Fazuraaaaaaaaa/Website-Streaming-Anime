"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Flame, Calendar, Bookmark, Tv } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const pathname = usePathname();
  const { watchlist, isLoaded } = useWatchlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/", label: "Jelajahi", icon: Compass },
    { href: "/ongoing", label: "Populer", icon: Flame },
    { href: "/genres", label: "Kategori", icon: Tv },
    { href: "/jadwal", label: "Jadwal", icon: Calendar },
    {
      href: "/watchlist",
      label: "Daftar Tonton",
      icon: Bookmark,
      badge: mounted && isLoaded && watchlist.length > 0 ? watchlist.length : null,
    },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 text-[11px] font-bold tracking-wider uppercase transition-colors relative ${
              isActive ? "text-[#F47521]" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? "text-[#F47521]" : "text-zinc-400"}`} />
              {item.badge !== null && (
                <span className="absolute -top-1 -right-2 px-1 min-w-3.5 h-3.5 rounded-full text-[9px] font-black bg-[#F47521] text-black flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
