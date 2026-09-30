import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checked } from "./lms";
export type Person = {
  user_id: string;
  full_name: string;
  headline: string;
  city: string;
  avatar_url: string;
};
// Public-to-classmates person cards. Never includes email or phone.
export async function people(db: SupabaseClient, ids: string[]) {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (!unique.length) return new Map<string, Person>();
  const rows =
    checked(
      await db
        .from("pwd_lms_profiles")
        .select("user_id,full_name,occupation,organization,city,avatar_path")
        .in("user_id", unique),
    ) || [];
  const paths = rows.map((r) => r.avatar_path).filter(Boolean) as string[];
  const signed = paths.length
    ? checked(
        await db.storage
          .from("pwd-student-avatars")
          .createSignedUrls(paths, 3600),
      ) || []
    : [];
  const urls = new Map(signed.map((s) => [s.path, s.signedUrl]));
  // Students who never saved a profile fall back to the name on their enrolment.
  const missing = unique.filter((id) => !rows.find((x) => x.user_id === id)?.full_name);
  const orderNames = missing.length
    ? checked(
        await db
          .from("pwd_lms_orders")
          .select("user_id,name")
          .in("user_id", missing)
          .order("created_at", { ascending: false }),
      ) || []
    : [];
  const map = new Map<string, Person>();
  for (const id of unique) {
    const r = rows.find((x) => x.user_id === id);
    map.set(id, {
      user_id: id,
      full_name:
        r?.full_name ||
        orderNames.find((o) => o.user_id === id)?.name ||
        "Pacific Wave Digital",
      headline: [r?.occupation, r?.organization].filter(Boolean).join(" · "),
      city: r?.city || "",
      avatar_url: (r?.avatar_path && urls.get(r.avatar_path)) || "",
    });
  }
  return map;
}
