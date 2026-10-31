import type { Metadata } from "next";
import type { ReactNode } from "react";
import { socialMetadata } from "@/lib/seo/social-metadata";
export const metadata: Metadata = {title:"Start Your Project",...socialMetadata("/get-started"),alternates:{canonical:"/get-started"}};
export default function Layout({children}:{children:ReactNode}){return children;}
