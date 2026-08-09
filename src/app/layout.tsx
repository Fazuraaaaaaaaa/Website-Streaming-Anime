import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RafQ Dev — Nonton Anime Subtitle Indonesia",
    template: "%s | RafQ Dev",
  },
  description:
    "RafQ Dev adalah platform streaming anime modern gratis dengan Subtitle Indonesia, multi-server super cepat, skip opening/ending otomatis, jadwal rilis update, dan tanpa iklan mengganggu.",
  keywords: [
    "RafQ Dev",
    "anime sub indo",
    "streaming anime",
    "nonton anime sub indo",
    "anime ongoing",
    "anime terlengkap",
    "download anime sub indo",
    "yomi anime",
  ],
  authors: [{ name: "RafQ Dev" }],
  creator: "RafQ Dev",
  publisher: "RafQ Dev",
  openGraph: {
    title: "RafQ Dev — Nonton Anime Subtitle Indonesia",
    description: "Streaming anime sub Indo resolusi tinggi 1080p FHD, 720p HD dengan pemutar modern anti lag.",
    type: "website",
    locale: "id_ID",
    siteName: "RafQ Dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "RafQ Dev — Nonton Anime Subtitle Indonesia",
    description: "Streaming anime sub Indo resolusi tinggi 1080p FHD, 720p HD.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full dark`} suppressHydrationWarning>
      <body
        className="min-h-full flex flex-col bg-[#090d16] text-[#f1f5f9] antialiased pb-16 md:pb-0"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
