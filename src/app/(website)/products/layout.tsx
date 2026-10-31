import type { Metadata } from "next";
import type { ReactNode } from "react";
import { socialMetadata } from "@/lib/seo/social-metadata";
export const metadata: Metadata = {title:"Products & Platforms",...socialMetadata("/products"),alternates:{canonical:"/products"}};
export default function Layout({children}:{children:ReactNode}){return children;}
