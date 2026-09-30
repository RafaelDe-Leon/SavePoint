import { readAvatarFile } from "@/lib/profile";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/**
 * Serves an uploaded avatar from `.data/avatars`. File names are random and
 * change on every upload, so a response never goes stale and can be cached
 * for good. Anything that isn't a stored avatar's name is a 404.
 */
export async function GET(_req: Request, ctx: RouteContext<"/api/avatar/[file]">) {
  const { file } = await ctx.params;
  const bytes = await readAvatarFile(file);
  if (!bytes) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": TYPES[file.split(".").pop()!],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
