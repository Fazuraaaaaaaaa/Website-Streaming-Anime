import { NextRequest, NextResponse } from "next/server";
import { getAnimeById, getAnimeEpisodes } from "@/lib/api";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const animeId = Number(id);

  if (!animeId) {
    return NextResponse.json({ error: "Invalid anime ID" }, { status: 400 });
  }

  try {
    const [animeRes, episodeRes] = await Promise.all([
      getAnimeById(animeId),
      getAnimeEpisodes(animeId).catch(() => ({ data: [] })),
    ]);

    return NextResponse.json(
      {
        data: animeRes.data,
        episodes: episodeRes.data || [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch anime data" },
      { status: 500 }
    );
  }
}
