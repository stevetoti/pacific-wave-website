import { socialMetadata } from "@/lib/seo/social-metadata";
import { publicTrainingCourses, registrationCourse } from "@/lib/server/lms-catalog";
import { programs } from "@/lib/lms/programs";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrainingCenter from "@/components/lms/TrainingCenter";
import "../training-center.css";
export async function generateMetadata({params, searchParams}: {
  params: Promise<{path?: string[]}>;
  searchParams: Promise<Record<string,string|string[]|undefined>>;
}): Promise<Metadata> {
  const {path=[]}=await params;
  const search=await searchParams;
  const key=path[0]==="programs"?path[1]:path[0]==="course"?path[1]:typeof search.course==="string"?search.course:undefined;
  const course=key?await registrationCourse(key):null;
  const program=course&&!course.is_private?programs[course.slug]:undefined;
  if(course&&!course.is_private){
    const canonical=course.slug==="vanuatu-october-2026"?"/training-center":`/training-center/programs/${course.slug}`;
    const description=course.description || program?.headline || "Practical business and AI training from Pacific Wave Digital.";
    return {title:{absolute:`${course.title} | Pacific Wave Digital`},description,
      alternates:{canonical:path[0]==="programs"?canonical:null},
      ...socialMetadata(`/training-center/programs/${course.slug}`,{title:course.title,description}),
      robots:path[0]==="programs"?{index:true,follow:true}:{index:false,follow:false}};
  }
  return {title:{absolute:"Training Centre | Pacific Wave Digital"},description:"Build practical business and AI skills with Pacific Wave Digital.",
    ...socialMetadata("/training-center"),alternates:{canonical:path.length?null:"/training-center"},
    robots:path.length?{index:false,follow:false}:{index:true,follow:true}};
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
  const directKey = path[0] === "programs" ? path[1] : ["account", "checkout"].includes(path[0]) ? query.course : undefined;
  const direct = directKey ? await registrationCourse(directKey) : null;
  if (path[0] === "programs" && !direct) notFound();
  const initialCourses = direct ? [direct] : publicPage ? await publicTrainingCourses().catch(() => undefined) : undefined;
  return <TrainingCenter path={path} query={query} initialCourses={initialCourses} />;
}
