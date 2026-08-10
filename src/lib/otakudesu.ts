// Domain Otakudesu sering berubah. Jika diblokir ISP lokal, ganti ke domain aktif atau biarkan jalan di Vercel
const OTAKUDESU_BASE_URL = "https://otakudesu.cloud";

export async function searchAnime(query: string) {
  try {
    const url = `${OTAKUDESU_BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 } // Cache selama 1 jam
    });
    
    if (!res.ok) return null;

    const html = await res.text();
    
    // Otakudesu menaruh hasil pencarian di elemen <li> di dalam <ul> class chivsrc
    const match = html.match(/<ul[^>]*class="[^"]*chivsrc[^"]*"[^>]*>[\s\S]*?<li[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?<a[^>]*href="([^"]+)"/i);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Otakudesu search error:", error);
    return null;
  }
}

export async function getEpisodeUrl(animeUrl: string, targetEpisode: number) {
  try {
    const res = await fetch(animeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;

    const html = await res.text();
    
    // Ambil bagian episodelist
    const episodelistMatch = html.match(/<div[^>]*class="[^"]*episodelist[^"]*"[^>]*>[\s\S]*?<ul>([\s\S]*?)<\/ul>/i);
    if (!episodelistMatch) return null;
    
    const listHtml = episodelistMatch[1];
    
    let episodeUrl: string | null = null;
    
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let match;
    
    const epMatch = new RegExp(`\\b(?:episode|ep)\\s*0?${targetEpisode}\\b|\\s0?${targetEpisode}$`, "i");
    
    while ((match = linkRegex.exec(listHtml)) !== null) {
      const link = match[1];
      const titleText = match[2].toLowerCase();
      if (epMatch.test(titleText)) {
        episodeUrl = link;
        break;
      }
    }

    if (!episodeUrl) {
      linkRegex.lastIndex = 0; // reset
      while ((match = linkRegex.exec(listHtml)) !== null) {
        if (match[2].includes(` ${targetEpisode} `)) {
          episodeUrl = match[1];
          break;
        }
      }
    }

    return episodeUrl;
  } catch (error) {
    console.error("Otakudesu getEpisode error:", error);
    return null;
  }
}

export async function getEmbedIframe(episodeUrl: string) {
  try {
    const res = await fetch(episodeUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    
    if (!res.ok) return null;

    const html = await res.text();
    const match = html.match(/<div[^>]*class="[^"]*responsive-embed-stream[^"]*"[^>]*>[\s\S]*?<iframe[^>]+src="([^"]+)"/i);
    const iframeUrl = match ? match[1] : "";
    
    return iframeUrl || null;
  } catch (error) {
    console.error("Otakudesu getEmbed error:", error);
    return null;
  }
}

export async function getOtakudesuStream(title: string, episode: number) {
  try {
    const animeUrl = await searchAnime(title);
    if (!animeUrl) return null;

    const episodeUrl = await getEpisodeUrl(animeUrl, episode);
    if (!episodeUrl) return null;

    const iframeUrl = await getEmbedIframe(episodeUrl);
    return iframeUrl;
  } catch (err) {
    console.error("Otakudesu getStream master error:", err);
    return null;
  }
}
