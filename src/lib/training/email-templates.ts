import { trainingTemplate } from "../email/training-template";
import {
  attendance,
  locations,
  directions,
  feeLabel,
  dateLabel,
} from "./config";
import type { Registration } from "./schema";
export function trainingEmails(r: Registration) {
  const c = r.cohort_snapshot;
  const accountUrl = "https://pacificwavedigital.com/training-center/account?course=vanuatu-october-2026";
  const checkoutUrl = "https://pacificwavedigital.com/training-center/checkout?course=vanuatu-october-2026";
  const result = {
    student: {
      subject: "We received your Vanuatu training registration",
      text: `Hello ${r.full_name},

We received your registration for ${c.title}.
Registration reference: ${r.reference}
Course fee: ${feeLabel(c)} for the one-month course.
Starts: ${dateLabel(c.start, true)}
Schedule: ${c.daysLabel}, ${c.timeLabel}. Time zone: ${c.timezone}.
Attendance preference: ${attendance[r.attendance_preference]} (for planning; not a reserved venue seat).
${r.attendance_preference !== "online" ? `Venue: ${c.venue}.\n` : ""}Online joining instructions for Zoom or Google Meet will be supplied separately.

Included: ${c.dates.length} practical live sessions / ${c.hours} teaching hours, recordings of every session for enrolled students to replay after training, ${c.softwareMonths} months free of Digi Assist AI Pro (valued at US$${c.softwareValueUSD}), and ${c.mentorshipMonths} additional free month of mentorship.
Continued Pro use after the three free months requires a paid subscription. Replay access does not depend on maintaining Pro.

Your registration has been received. It does not take payment or confirm a paid place. Complete your enrolment using the links below.

1. Create your student account or sign in with the same email address you used for this registration:
${accountUrl}
If you create a new account, confirm your email using the verification email before continuing.

2. Complete your October course registration and payment:
${checkoutUrl}
Pay securely by card through Stripe, or choose ANZ/BRED bank transfer in VUV and upload your payment proof. A bank transfer is confirmed after our team verifies the deposit.

3. Open your course dashboard after payment confirmation to access published lessons, recordings and your class community. Meeting links will appear when the instructor publishes them:
https://pacificwavedigital.com/training-center/dashboard

Already paid? Sign in to check your existing registration; you do not need to pay again. Reply to this email if you need help.

Pacific Wave Digital
${c.phone} | ${c.email}
${c.whatsapp}`,
    },
    internal: {
      subject: "New Vanuatu training registration — October 2026",
      text: `Registration reference: ${r.reference}
Cohort: ${r.cohort_id}
Name: ${r.full_name}
Email: ${r.email}
Phone: ${r.phone_normalized}
Location: ${locations[r.location_code]} ${r.location_other}
Village/area: ${r.area_optional}
Attendance preference: ${attendance[r.attendance_preference]}
Business direction: ${r.business_direction ? directions[r.business_direction] : "Not supplied"}
Question/idea: ${r.question}
Future PWD training updates opted in: ${r.future_training_opt_in ? "Yes" : "No"}
Submitted: ${r.created_at}
Status: received — payment not collected.

Review privately at https://pacificwavedigital.com/admin/training`,
    },
  };
  const branded = trainingTemplate({
    title: "Your October training registration: next steps",
    intro: `Hello ${r.full_name}. We received your registration for ${c.title}. Complete your account and payment steps to enrol.`,
    action: "Complete enrolment & payment", url: checkoutUrl,
    secondary: { action: "Create an account or sign in", url: accountUrl },
    details: result.student.text.split("\n\n").slice(1),
  });
  return { ...result, student: { ...result.student, html: branded.html } };
}
