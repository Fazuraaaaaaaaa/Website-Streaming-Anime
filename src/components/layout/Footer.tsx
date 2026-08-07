import Link from "next/link";
import { Tv, Heart } from "lucide-react";

const footerLinks = {
  Navigasi: [
    { label: "Beranda", href: "/" },
    { label: "Jadwal Rilis", href: "/jadwal" },
    { label: "Daftar Genre", href: "/genres" },
    { label: "Ongoing", href: "/ongoing" },
    { label: "Completed", href: "/completed" },
  ],
  Fitur: [
    { label: "Watchlist Saya", href: "/watchlist" },
    { label: "Riwayat Nonton", href: "/history" },
    { label: "Pencarian Anime", href: "/search" },
  ],
  Komunitas: [
    { label: "Discord Mayonime", href: "https://discord.com" },
    { label: "Telegram Channel", href: "https://telegram.org" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5 bg-[#060814]/80 backdrop-blur-xl">
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/40 shadow-lg shadow-violet-600/20">
                <Tv className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex items-center tracking-tight text-lg font-black">
                <span className="text-white font-extrabold tracking-wider">MAYO</span>
                <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent ml-0.5 tracking-wider">NIME V3</span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Platform streaming anime modern terdepan dengan resolusi tinggi dan pemutar video kustom anti iklan popup.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-black mb-3 uppercase tracking-wider text-slate-300">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-slate-400 hover:text-violet-400 transition-colors"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Mayonime V3. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-slate-500">
            Didesain dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk pecinta Anime di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
