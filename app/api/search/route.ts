import { NextRequest, NextResponse } from "next/server";
import { searchNotes } from "@/lib/search-engine";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = searchNotes(query.trim());
  return NextResponse.json({ results });
}
