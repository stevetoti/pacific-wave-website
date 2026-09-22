import Image from "next/image";
import { PlayCircle } from "lucide-react";
export default function LessonThumbnail({
  url,
  cover = false,
}: {
  url?: string;
  cover?: boolean;
}) {
  return (
    <span className={cover ? "lms-lesson-cover" : "lms-lesson-thumb"}>
      {url ? (
        <Image
          src={url}
          alt=""
          fill
          sizes={cover ? "(max-width: 700px) 100vw, 720px" : "88px"}
          unoptimized
          className="lms-lesson-image"
        />
      ) : (
        <PlayCircle aria-hidden="true" size={26} />
      )}
    </span>
  );
}
