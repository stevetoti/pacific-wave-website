import type { Metadata } from "next";
import { siteOrigin, socialCard, socialImage } from "./social-cards";
export function socialMetadata(path: string, overrides: {title?: string; description?: string; image?: string; type?: "website"|"article"} = {}): Pick<Metadata,"openGraph"|"twitter"> {
  const card = socialCard(path);
  const title = overrides.title || card.title;
  const description = overrides.description || card.description;
  const image = overrides.image ? new URL(overrides.image,siteOrigin).href : socialImage(path);
  return {
    openGraph: { type:overrides.type || "website",siteName:"Pacific Wave Digital",locale:"en_US",url:siteOrigin+path,title,description,images:[{url:image,width:1200,height:630,type:"image/jpeg",alt:title}] },
    twitter: { card:"summary_large_image",title,description,images:[{url:image,alt:title}] },
  };
}
