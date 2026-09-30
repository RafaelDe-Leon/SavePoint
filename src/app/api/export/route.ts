import { getLibraryTabOrder } from "@/lib/preferences";
import { exportProfileStore } from "@/lib/profile";
import { today } from "@/lib/profile-shared";
import { getShelfEntries } from "@/lib/sample-library";

/**
 * "Download your data": everything Savepoint stores about you, as one JSON
 * file. Uploaded images are referenced by URL rather than inlined.
 */
export async function GET() {
  const [profile, library, libraryTabOrder] = await Promise.all([
    exportProfileStore(),
    getShelfEntries(),
    getLibraryTabOrder(),
  ]);

  const body = JSON.stringify(
    { exported: new Date().toISOString(), ...profile, library, preferences: { libraryTabOrder } },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="savepoint-${profile.profile.username}-${today()}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
