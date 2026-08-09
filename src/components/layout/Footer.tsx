import Link from "next/link";
import { Sparkles } from "lucide-react";

const footerLinks = {
  Navigasi: [
    { label: "Jelajahi Anime", href: "/" },
    { label: "Kategori & Genre", href: "/genres" },
    { label: "Anime Populer", href: "/ongoing" },
    { label: "Anime Tamat (Completed)", href: "/completed" },
    { label: "Jadwal Rilis Mingguan", href: "/jadwal" },
  ],
  Koleksi: [
    { label: "Daftar Tonton Saya", href: "/watchlist" },
    { label: "Riwayat Tontonan", href: "/history" },
    { label: "Pencarian Katalog", href: "/search" },
  ],
  Genre: [
    { label: "Action", href: "/genres?genre=Action" },
    { label: "Adventure", href: "/genres?genre=Adventure" },
    { label: "Fantasy", href: "/genres?genre=Fantasy" },
    { label: "Romance", href: "/genres?genre=Romance" },
    { label: "Sci-Fi", href: "/genres?genre=Sci-Fi" },
  ],
  Komunitas: [
    { label: "Discord RafQ Dev", href: "https://discord.com" },
    { label: "Telegram Anime", href: "https://telegram.org" },
    { label: "Instagram", href: "https://instagram.com" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#0c0d10]">
      <div className="container-main py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#F47521] text-black">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93c-2.95-.49-5-3.05-5-6.05 0-3.39 2.76-6.14 6.15-6.14 2.87 0 5.29 2 5.86 4.71-1.39-1.35-3.32-2.19-5.44-2.19-4.14 0-7.5 3.36-7.5 7.5 0 2.21.96 4.2 2.49 5.58-.29-.75-.46-1.57-.46-2.43 0-3.31 2.69-6 6-6 1.49 0 2.86.55 3.91 1.45-.69 2.05-2.64 3.55-4.91 3.57z" />
                </svg>
              </div>
              <div className="flex items-center tracking-tight text-base font-black">
                <span className="text-white font-extrabold tracking-wider">RafQ</span>
                <span className="text-[#F47521] ml-1 tracking-wider">Dev</span>
              </div>
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Platform streaming anime Subtitle Indonesia berkecepatan tinggi dengan resolusi FHD 1080p, bebas buffering, dan panduan episode terlengkap.
            </p>
            <p className="text-[10px] text-zinc-400">
              RafQ Dev does not host or store any video files on its server. All contents are provided by independent third parties.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[11px] font-black mb-3 uppercase tracking-wider text-white">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-zinc-400 hover:text-[#F47521] transition-colors font-medium"
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
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} RafQ Dev • Crunchyroll Inspired Anime Experience.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#F47521]" />
            Didedikasikan untuk Komunitas Anime Sub Indo
          </p>
        </div>
      </div>
    </footer>
  );
}
