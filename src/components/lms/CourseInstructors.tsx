"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
type PublicInstructor = { name: string; title: string; expertise: string; bio: string; avatar_url: string };
// "Your instructors" cards for public course pages. Renders nothing until instructors are assigned.
export default function CourseInstructors({ slug, className = "" }: { slug: string; className?: string }) {
  const [list, setList] = useState<PublicInstructor[]>([]);
  useEffect(() => {
    fetch(`/api/lms-instructors?scope=public&course=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : { instructors: [] }))
      .then((d) => setList(d.instructors || []))
      .catch(() => {});
  }, [slug]);
  if (!list.length) return null;
  return (
    <section className={`mx-auto w-full max-w-6xl px-4 py-14 ${className}`}>
      <p className="text-xs font-bold tracking-widest text-[#b73d19]">LEARN FROM PRACTITIONERS</p>
      <h2 className="mt-2 text-3xl font-bold text-[#233C6F]">Your instructors</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {list.map((i) => (
          <article key={i.name} className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-[#233C6F]">
              {i.avatar_url ? (
                <Image src={i.avatar_url} alt={i.name} width={96} height={96} unoptimized className="h-24 w-24 object-cover" />
              ) : (
                <span className="grid h-24 w-24 place-items-center text-3xl font-bold text-white">{i.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[#233C6F]">{i.name}</h3>
              {i.title && <p className="mt-1 text-sm font-bold text-[#EF5E33]">{i.title}</p>}
              {i.expertise && <p className="mt-2 text-sm font-semibold text-[#233C6F]">{i.expertise}</p>}
              {i.bio && <p className="mt-2 text-sm leading-relaxed text-slate-600">{i.bio}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
