import type { Metadata } from "next";
import type { ReactNode } from "react";
import { socialMetadata } from "@/lib/seo/social-metadata";
export const metadata: Metadata = {title:"Contact Us",...socialMetadata("/contact"),alternates:{canonical:"/contact"}};
export default function Layout({children}:{children:ReactNode}){return children;}
