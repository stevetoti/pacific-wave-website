"use client";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
export default function WebsiteFooter() {
  const path = usePathname();
  return path.replace(/\/$/, "") === "/training-center/dashboard" ? null : (
    <Footer />
  );
}
