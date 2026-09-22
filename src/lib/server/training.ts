import "server-only";
import { getSupabaseAdmin } from "./clients";
import { initialCohort, type Cohort } from "../training/config";
export async function getTrainingCohort(): Promise<Cohort> {
  const { data, error } = await getSupabaseAdmin()
    .from("pwd_training_cohorts")
    .select("config")
    .eq("id", initialCohort.id)
    .single();
  if (error || !data?.config)
    throw new Error("Training configuration unavailable");
  return data.config as Cohort;
}
