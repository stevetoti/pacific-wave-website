"use client";

import { usePathname } from "next/navigation";
import ChatWidget from "./ChatWidget";
import VoiceWidget from "./VoiceWidget";

export default function ContactWidgets() {
  const pathname = usePathname();
  if (
    pathname.replace(/\/$/, "") === "/training-center/account" ||
    pathname.startsWith("/training-center/course/") ||
    pathname.replace(/\/$/, "") === "/training-center/dashboard"
  )
    return null;
  return (
    <>
      <VoiceWidget />
      <ChatWidget />
    </>
  );
}
