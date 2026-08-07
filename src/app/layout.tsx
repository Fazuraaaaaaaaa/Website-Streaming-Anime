import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AnimeHub — Nonton Anime Subtitle Indonesia",
    template: "%s | AnimeHub",
  },
  description:
    "AnimeHub adalah website streaming anime terlengkap dengan database dari MyAnimeList. Temukan dan tonton anime favorit dengan kualitas terbaik.",
  keywords: [
    "anime",
    "streaming anime",
    "nonton anime",
    "anime sub indo",
    "anime terbaru",
    "anime ongoing",
  ],
  openGraph: {
    title: "AnimeHub — Nonton Anime Subtitle Indonesia",
    description: "Website streaming anime terlengkap dengan database dari MyAnimeList.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col"
        style={{ background: "var(--bg-primary)" }}
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
