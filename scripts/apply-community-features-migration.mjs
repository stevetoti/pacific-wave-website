import { readFile } from "node:fs/promises";
const ref = "rndegttgwtpkbjtvjgnc";
if (
  new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname !==
  `${ref}.supabase.co`
)
  throw Error("Wrong project");
const query = (
  await Promise.all(
    [
      "20260923_community_features.sql",
      "20260923_mentorship_communication.sql",
    ].map((name) => readFile("supabase/migrations/" + name, "utf8")),
  )
).join("\n");
const r = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(60000),
  },
);
if (!r.ok) throw Error(`Community migration ${r.status}`);
console.log("Private advanced course community migration applied.");
