import { readFile, writeFile, mkdir } from "node:fs/promises";
const ref = "rndegttgwtpkbjtvjgnc";
if (
  new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname !==
  `${ref}.supabase.co`
)
  throw new Error("Wrong project");
async function query(query) {
  const r = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      signal: AbortSignal.timeout(60000),
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!r.ok) throw new Error(`Management API status ${r.status}`);
  return r.json();
}
const schema = await query(
  "SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_schema='public' AND table_name LIKE 'pwd_training_%'",
);
await mkdir(".deployment", { recursive: true });
await writeFile(
  `.deployment/training-preflight-${Date.now()}.json`,
  JSON.stringify(schema, null, 2),
);
console.log("Training metadata preflight:", schema.length, "existing columns");
if (!process.argv.includes("--apply")) process.exit(0);
if (schema.length && !process.argv.includes("--reapply"))
  throw new Error(
    "Training tables already exist; review snapshot before explicit --reapply",
  );
await query(
  await readFile("supabase/migrations/20260915_vanuatu_training.sql", "utf8"),
);
const config = JSON.parse(
  await readFile("src/lib/training/cohort.json", "utf8"),
);
const lit = (s) => "'" + s.replaceAll("'", "''") + "'";
await query(
  `INSERT INTO public.pwd_training_cohorts(id,config) VALUES(${lit(config.id)},${lit(JSON.stringify(config))}::jsonb) ON CONFLICT(id) DO NOTHING`,
);
console.log(
  "Training migration and confirmed cohort configuration applied. Existing cohort configuration is never overwritten.",
);
