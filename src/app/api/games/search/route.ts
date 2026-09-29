import { suggestGames } from "@/lib/catalog/queries";

/**
 * Typeahead endpoint for the nav search.
 *
 *   GET /api/games/search?q=hollow&limit=6
 *   → { results: [{ slug, title, year, tint, platforms }] }
 *
 * Returns only what the dropdown renders, not whole catalog records.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, 100);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 6, 1), 20);

  const games = await suggestGames(q, limit);
  return Response.json({
    results: games.map(({ slug, title, year, tint, platforms }) => ({
      slug,
      title,
      year,
      tint,
      platforms,
    })),
  });
}
