import { NextRequest, NextResponse } from "next/server";
import { VideoServer } from "@/lib/types";
import { getOtakudesuStream } from "@/lib/otakudesu";

// Native YouTube scraper to replace yt-search which crashes Vercel Edge functions
async function simpleYtSearch(query: string) {
  try {
    const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      }
    });
    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/);
    if (!match) return { videos: [] };
    
    const data = JSON.parse(match[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents || [];
    
    const videos = [];
    for (const item of contents) {
      if (item.videoRenderer) {
        const lengthText = item.videoRenderer.lengthText?.simpleText || "0:00";
        const parts = lengthText.split(':').map(Number);
        let seconds = 0;
        if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
        
        videos.push({
          videoId: item.videoRenderer.videoId,
          seconds: seconds
        });
      }
    }
    return { videos };
  } catch (e) {
    console.error("Native ytSearch error:", e);
    return { videos: [] };
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const animeId = parseInt(id, 10);
  const searchParams = request.nextUrl.searchParams;
  const ep = parseInt(searchParams.get("ep") || "1", 10);
  const title = searchParams.get("title") || "Anime";

  let otakudesuUrl: string | null = null;
  let server1Url = "";
  let server2Url = "";
  let server3Url = "";

  // Helper untuk membatasi waktu eksekusi fungsi agar tidak terkena Timeout 504 di Vercel
  const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((resolve) => {
      timeoutId = setTimeout(() => resolve(fallback), ms);
    });
    return Promise.race([
      promise.then(res => {
        clearTimeout(timeoutId);
        return res;
      }).catch(err => {
        clearTimeout(timeoutId);
        console.error("Task failed:", err);
        return fallback;
      }), 
      timeoutPromise
    ]);
  };

  try {
    // 1. Coba fetch Otakudesu (Server Utama) - Maksimal 4 detik
    otakudesuUrl = await withTimeout(getOtakudesuStream(title, ep), 4000, null);

    // 2. Jalankan pencarian YouTube sebagai fallback (Server Cadangan) - Maksimal 4 detik
    const queries = [
      `${title} episode ${ep} sub indo`,
      `${title} episode ${ep} muse indonesia`,
      `${title} episode ${ep} english sub`,
    ];

    const fallbackYt = { videos: [] } as any;
    const [res1, res2, res3] = await Promise.all([
      withTimeout(simpleYtSearch(queries[0]), 4000, fallbackYt),
      withTimeout(simpleYtSearch(queries[1]), 4000, fallbackYt),
      withTimeout(simpleYtSearch(queries[2]), 4000, fallbackYt)
    ]);
    
    const filterEpisode = (videos: any[]) => {
      if (!videos || !Array.isArray(videos)) return null;
      const fullEp = videos.find(v => v.seconds >= 1200 && v.seconds <= 2400);
      return fullEp || (videos.length > 0 ? videos[0] : null);
    };

    const formatYtUrl = (video: any) => 
      video ? `https://www.youtube.com/embed/${video.videoId}?enablejsapi=1&wmode=opaque&autoplay=1&modestbranding=1&rel=0&vq=hd1080&cc_load_policy=0&iv_load_policy=3&showinfo=0` : "";

    server1Url = formatYtUrl(filterEpisode(res1.videos));
    server2Url = formatYtUrl(filterEpisode(res2.videos));
    server3Url = formatYtUrl(filterEpisode(res3.videos));
  } catch (error) {
    console.error("Video search error:", error);
  }

  const servers: VideoServer[] = [];

  // Server 1 (Utama): Otakudesu Asli
  if (otakudesuUrl) {
    servers.push({
      id: "srv-ota-1",
      name: "Server 1 • Otakudesu (Sub Indo Asli)",
      quality: "HD",
      type: "embed",
      url: otakudesuUrl,
      tag: "Paling Stabil",
    });
  }

  // Fallback ke YouTube jika Otakudesu gagal/diblokir ISP lokal, 
  // atau tambahkan sebagai opsi tambahan (VIP Direct)
  if (server1Url) {
    servers.push({
      id: "srv-yt-1",
      name: otakudesuUrl ? "Server 2 • VIP Direct (Alternatif 1)" : "Server 1 • VIP Direct (Sub Indo Utama)",
      quality: "1080p FHD",
      type: "embed",
      url: server1Url,
      tag: "Full Episode",
    });
  }

  if (server2Url) {
    servers.push({
      id: "srv-yt-2",
      name: otakudesuUrl ? "Server 3 • Premium (Alternatif 2)" : "Server 2 • Premium (Alternatif 1)",
      quality: "1080p FHD",
      type: "embed",
      url: server2Url,
      tag: "Resolusi Tinggi",
    });
  }

  if (server3Url && !otakudesuUrl) {
    // Tampilkan server 3 hanya jika Otakudesu gagal (agar list tidak terlalu panjang)
    servers.push({
      id: "srv-yt-3",
      name: "Server 3 • Global (Alternatif 2)",
      quality: "1080p FHD",
      type: "embed",
      url: server3Url,
      tag: "Server Stabil",
    });
  }

  return NextResponse.json({
    animeId,
    episode: ep,
    title,
    subtitle: "Bahasa Indonesia (Sub Indo)",
    servers,
  });
}
