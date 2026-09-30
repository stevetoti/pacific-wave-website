import type { Metadata } from "next";
import TeachingGate from "@/components/lms/TeachingGate";
import "../training-center.css";
export const metadata: Metadata = {
  title: "Teaching workspace | Pacific Wave Digital",
  robots: { index: false, follow: false },
};
export default function TeachPage() {
  return <TeachingGate />;
}
