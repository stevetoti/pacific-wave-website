import {onboardingPath,onboardingPreview} from "../lms/onboarding";
import { trainingTemplate } from "./training-template";
import { getWorkbook } from "../lms/workbook-schema";
type WelcomeCourse = { id: string; title: string; slug: string; private_sessions?: boolean };
type WelcomeSchedule = { start?: string; teachingEnd?: string; daysLabel?: string; timeLabel?: string; timezone?: string; venue?: string };
export function paidWelcomeEmail(name: string, course: WelcomeCourse, schedule?: WelcomeSchedule, now = new Date()) {
  const dashboard = "https://pacificwavedigital.com/training-center/dashboard";
  const url = `https://pacificwavedigital.com/training-center/course/${encodeURIComponent(course.id)}`;
  const date = (value: string) => new Intl.DateTimeFormat("en-GB", {dateStyle:"long",timeZone:schedule?.timezone || "Pacific/Efate"}).format(new Date(value));
  const upcoming = schedule?.start && Date.parse(schedule.start) > now.getTime();
  const details = [
    `Your course: ${course.title}`,
    "1. Sign in with the same email address and password you used to register. You already have an account, so you do not need to register again. If you have forgotten your password, choose Forgot password on the sign-in page.",
    "2. Explore your learning dashboard. Check your enrolment, complete your profile, then open your course to read the introduction, lesson outline and published timetable.",
    ...(schedule?.start ? [`Class timetable: ${date(schedule.start)}${schedule.teachingEnd ? ` to ${date(schedule.teachingEnd)}` : ""}. ${schedule.daysLabel || ""}${schedule.timeLabel ? `, ${schedule.timeLabel}` : ""}. Times are in ${schedule.timezone || "Pacific/Efate"}. ${schedule.venue ? `Venue: ${schedule.venue}. ` : ""}Check your course for joining instructions and updates.`] : []),
    ...(course.private_sessions ? ["Your one-on-one training: arrange your scheduled lesson appointments with Stephen. The course page explains your teaching phase and follow-up mentorship."] : []),
    "3. Start with the Onboarding Tutor in your course, where available, to understand the learning outline and your AI coaches. Use the enabled business, branding, sales, marketing and project-review coaches for guided practice. Follow the consent and usage information shown in your account.",
    ...(getWorkbook(course.slug) ? ["4. Open your interactive workbook in the course. Read the first activities, start writing about your business idea and save your work. You can return to your answers as the classes progress."] : ["4. Prepare your project idea. Write a short description of the business or software you want to build, who it will help, and the questions you want us to cover."]),
    "5. Use your course community and instructor support to introduce yourself and ask questions. Please keep passwords, banking details and other private information out of chats and AI conversations.",
    upcoming ? "Before your first class: bring a charged laptop, a notebook and one business idea or challenge to work on. Test your internet connection if attending online. You can explore the available introduction, workbook and practice tools now; recordings and later lesson resources appear only after your trainer publishes them." : "You can use the materials already published in your course. Recordings and later lesson resources become available after your trainer publishes them.",
    "Your course access is ready. If a lesson or recording is not yet available, that does not mean you need to pay again. Reply to this email if you need help getting started.",
  ];
  return {subject:`Welcome to ${course.title} — your dashboard is ready`, ...trainingTemplate({
    title:"Welcome — your learning starts here",
    intro:`Hello ${name}. Your enrolment in ${course.title} is confirmed and your course access is ready. ${upcoming ? "Here is what you can do while you wait for class to start." : "Here is how to get started in your learning space."}`,
    action:"Open my learning dashboard",url:dashboard,secondary:{action:"Go directly to my course",url},details,
    feature:{title:"Meet your Onboarding Tutor",description:"Watch a short introduction, then speak with your tutor about your motivation, expectations and goals. Your tutor will greet you by name after sign-in and explain how to get the most from the class.",image:`https://pacificwavedigital.com${onboardingPreview}`,url:`https://pacificwavedigital.com${onboardingPath(course.id)}`,action:"Speak with your Onboarding Tutor"},
  })};
}
