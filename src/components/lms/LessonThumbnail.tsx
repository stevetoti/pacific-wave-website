import Image from "next/image";
import { LockKeyhole, PlayCircle } from "lucide-react";
export default function LessonThumbnail({
  url,
  cover = false,
  locked = false,
}: {
  url?: string;
  cover?: boolean;
  locked?: boolean;
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
      {locked && <span className="lms-recording-lock"><LockKeyhole aria-hidden="true" size={cover ? 36 : 18}/>{cover && <span>Recording coming after training</span>}</span>}
    </span>
  );
}
