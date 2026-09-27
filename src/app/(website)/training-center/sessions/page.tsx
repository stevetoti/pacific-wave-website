import {Suspense} from "react";
import CoachSessions from "@/components/lms/coach/CoachSessions";
export const metadata={title:"My coaching sessions | Pacific Wave Digital",robots:{index:false,follow:false}};
export default function Page(){return <Suspense fallback={<p>Loading your sessions…</p>}><CoachSessions/></Suspense>;}
