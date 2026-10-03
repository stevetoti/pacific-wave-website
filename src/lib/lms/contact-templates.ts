// Ready-made outreach messages for the admin Students tab. {placeholders} are filled per student.
export type ContactVars = {
  first_name: string;
  course: string;
  amount: string;
  reference: string;
  link: string;
};
export type ContactTemplate = {
  id: string;
  label: string;
  subject: string;
  email: string;
  sms: string;
  action: string;
};
export const contactTemplates: ContactTemplate[] = [
  {
    id: "payment_reminder",
    label: "Payment reminder",
    subject: "Your place in {course} is waiting",
    email:
      "Hi {first_name},\n\nThank you for registering for {course}. Your registration is saved, but we haven't received your payment of {amount} yet.\n\nYou can pay by bank transfer to our ANZ or BRED account, or by Visa or Mastercard. Please use your payment reference {reference} so we can match your payment quickly.\n\nIf you need any help, simply reply to this email or WhatsApp us on +678 528 8141.",
    sms: "Hi {first_name}, your place in {course} is saved but payment of {amount} is still pending. Pay by bank (ref {reference}) or card: {link} Help: +678 5288141 - Pacific Wave Digital",
    action: "Complete my payment",
  },
  {
    id: "class_reminder",
    label: "Class reminder",
    subject: "Reminder: your next {course} class",
    email:
      "Hi {first_name},\n\nThis is a friendly reminder that your next {course} class is coming up. Please check your dashboard for the time, joining details and any materials to prepare.\n\nWe look forward to seeing you there.",
    sms: "Hi {first_name}, reminder: your next {course} class is coming up. See the time and joining details in your dashboard: {link} - Pacific Wave Digital",
    action: "Open my dashboard",
  },
  {
    id: "enrolled_next_steps",
    label: "You're enrolled — next steps",
    subject: "Welcome to {course}",
    email:
      "Hi {first_name},\n\nYou're enrolled in {course}. Welcome!\n\nSign in to your dashboard to see your schedule, lessons and course community, and to meet your AI coaches.\n\nIf you have any questions, just reply to this email.",
    sms: "Hi {first_name}, you're enrolled in {course}! Sign in to see your schedule and lessons: {link} - Pacific Wave Digital",
    action: "Open my dashboard",
  },
  {
    id: "choose_course",
    label: "Help choosing a course",
    subject: "Can we help you choose a course?",
    email:
      "Hi {first_name},\n\nThank you for creating your Pacific Wave Digital Training Centre account. We noticed you haven't chosen a course yet.\n\nTake a look at our courses, or reply to this email and we'll help you pick the right one for your goals.",
    sms: "Hi {first_name}, thanks for joining Pacific Wave Digital Training Centre! Need help choosing a course? See {link} or WhatsApp +678 5288141",
    action: "Explore courses",
  },
  { id: "custom", label: "Write my own", subject: "A message from Pacific Wave Digital Training Centre", email: "Hi {first_name},\n\n", sms: "Hi {first_name}, ", action: "Open my dashboard" },
];
export function fillTemplate(text: string, v: ContactVars) {
  return text.replace(/\{(first_name|course|amount|reference|link)\}/g, (_, k: keyof ContactVars) => v[k] || "");
}
// SMS segments: 160 characters for one message, 153 per part after that.
export const smsParts = (text: string) => (text.length <= 160 ? 1 : Math.ceil(text.length / 153));
// Vanuatu numbers are often saved as 7 digits without +678.
export function normalizePhone(raw: string) {
  const trimmed = (raw || "").trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) return "";
  if (trimmed.startsWith("+")) return "+" + digits;
  if (digits.length === 7) return "+678" + digits;
  return "+" + digits;
}
