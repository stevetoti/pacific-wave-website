import { novemberCourseSlug } from "../training/config";

export const octoberCourseSlug = "vanuatu-october-2026";
export const octoberCourseId = "21cb833b-6e9b-4ec2-9aca-a7629dffda8a";
export function isCompletedOctoberCourse(key: string | undefined) {
  return key === octoberCourseSlug || key === octoberCourseId;
}
// Keep student lesson/dashboard URLs intact; only public enrolment links move on.
export function replacementRegistration(path: string[], course?: string, mode?: string, verify?: string) {
  if (path[0] === "programs" && isCompletedOctoberCourse(path[1])) return "/vanuatu-training";
  if (!["account", "checkout"].includes(path[0]) || !isCompletedOctoberCourse(course)) return null;
  if (verify || ["reset", "update"].includes(mode || "")) return null;
  const destination = path[0] === "checkout" ? "checkout" : "account";
  const query = new URLSearchParams({course: novemberCourseSlug});
  if (mode) query.set("mode", mode);
  return `/training-center/${destination}?${query}`;
}
