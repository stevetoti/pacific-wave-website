import TrainingAdmin from "@/components/lms/TrainingAdmin";
import "@/app/(website)/training-center/training-center.css";
export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <TrainingAdmin key={tab || "students"} initialTab={tab === "payments" || tab === "affiliates" || tab === "instructors" || tab === "courses" ? tab : "students"} />;
}
