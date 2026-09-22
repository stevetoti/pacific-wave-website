import { publicTrainingCourses } from "@/lib/server/lms-catalog";
import { programs } from "@/lib/lms/programs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrainingCenter from "@/components/lms/TrainingCenter";
import "../training-center.css";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}): Promise<Metadata> {
  const { path = [] } = await params;
  const program = path[0] === "programs" ? programs[path[1]] : undefined;
  if (program)
    return {
      title: `${path[1] === "one-on-one-mentorship" ? "One on One Mentorship Program" : "How To Start A Profitable Business"} | Pacific Wave Digital`,
      description: program.headline + " " + program.audience,
      alternates: {
        canonical: `https://pacificwavedigital.com/training-center/programs/${path[1]}`,
      },
      openGraph: { images: [program.image] },
      robots: { index: true, follow: true },
    };
  return {
    title: "Training Centre | Pacific Wave Digital",
    description:
      "Build practical business skills with live training in Vanuatu and recorded courses from Pacific Wave Digital.",
    alternates: { canonical: "https://pacificwavedigital.com/training-center" },
    robots: path.length
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { path = [] } = await params;
  if (
    path.length &&
    (!["account", "checkout", "dashboard", "course", "programs"].includes(
      path[0],
    ) ||
      path.length > (["course", "programs"].includes(path[0]) ? 2 : 1))
  )
    notFound();
  if (
    path[0] === "programs" &&
    (!path[1] || !programs[path[1]] || path[1] === "vanuatu-october-2026")
  )
    notFound();
  const search = await searchParams;
  const query = Object.fromEntries(
    Object.entries(search).map(([key, value]) => [
      key,
      typeof value === "string" ? value : undefined,
    ]),
  );
  const publicPage = !path.length || path[0] === "programs" || (path[0] === "account" && Boolean(query.course));
  const initialCourses = publicPage ? await publicTrainingCourses().catch(() => undefined) : undefined;
  return <TrainingCenter path={path} query={query} initialCourses={initialCourses} />;
}
