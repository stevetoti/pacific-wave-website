"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
export default function WebsiteFooter() {
  const path = usePathname();
  return path.replace(/\/$/, "") === "/training-center/dashboard" ||
    path.startsWith("/training-center/course/") ||
    path.replace(/\/$/, "") === "/training-center/sessions" ||
    path.replace(/\/$/, "") === "/training-center/teach" ? null : (
    <Footer />
  );
}
