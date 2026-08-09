import * as cheerio from "cheerio";

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
    const $ = cheerio.load(html);

    // Otakudesu menaruh hasil pencarian di elemen <li> di dalam <ul> class chivsrc
    const firstResult = $(".chivsrc li").first();
    if (firstResult.length === 0) return null;

    const animeUrl = firstResult.find("h2 a").attr("href");
    return animeUrl || null;
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
    const $ = cheerio.load(html);

    let episodeUrl: string | null = null;
    
    // List episode Otakudesu biasanya ada di .episodelist ul li
    $(".episodelist ul li").each((i, el) => {
      const link = $(el).find("span a").attr("href");
      const titleText = $(el).find("span a").text().toLowerCase();
      
      // Deteksi teks yang mengandung "episode X" atau "ep X" atau berakhir dengan angka tersebut
      const epMatch = new RegExp(`\\b(?:episode|ep)\\s*0?${targetEpisode}\\b|\\s0?${targetEpisode}$`, "i");
      
      if (link && epMatch.test(titleText)) {
        episodeUrl = link;
      }
    });

    // Fallback: Jika RegExp tidak cocok tapi ada episode, mungkin urutannya dari atas
    if (!episodeUrl) {
       // Coba tangkap otomatis dari pola umum jika tidak match dengan akurat
       const fallbackEl = $(".episodelist ul li").filter((i, el) => $(el).find("span a").text().includes(` ${targetEpisode} `));
       if (fallbackEl.length > 0) {
         episodeUrl = fallbackEl.first().find("span a").attr("href") || null;
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
    const $ = cheerio.load(html);

    // Player video Otakudesu biasanya disembunyikan di elemen #lightsVideo atau memiliki class responsive-embed
    const iframeUrl = $("#lightsVideo iframe").attr("src") || $(".responsive-embed iframe").attr("src");
    
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
