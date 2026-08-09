import { NextRequest, NextResponse } from "next/server";
import { searchAnime } from "@/lib/api";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  if (!q.trim()) {
    return NextResponse.json({ data: [], pagination: null });
  }

  try {
    const res = await searchAnime(q.trim(), page, limit);
    return NextResponse.json(res, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { data: [], error: "Gagal mengambil data pencarian" },
      { status: 200 } // Always return 200 to prevent SWR errors
    );
  }
}
