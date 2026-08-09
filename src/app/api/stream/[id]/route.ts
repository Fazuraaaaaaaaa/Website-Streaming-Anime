import { NextRequest, NextResponse } from "next/server";
import { VideoServer } from "@/lib/types";
import ytSearch from "yt-search";
import { getOtakudesuStream } from "@/lib/otakudesu";

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

  try {
    // 1. Coba fetch Otakudesu (Server Utama)
    otakudesuUrl = await getOtakudesuStream(title, ep);

    // 2. Jalankan pencarian YouTube sebagai fallback (Server Cadangan)
    const queries = [
      `${title} episode ${ep} sub indo`,
      `${title} episode ${ep} muse indonesia`,
      `${title} episode ${ep} english sub`,
    ];

    const [res1, res2, res3] = await Promise.all(queries.map(q => ytSearch(q)));
    
    const filterEpisode = (videos: any[]) => {
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
