import initial from "./cohort.json";
export type Cohort = Omit<typeof initial, "registrationState"> & {
  registrationState: "open" | "closed";
};
export const initialCohort = initial as Cohort;
export const locations = {
  port_vila: "Port Vila (Efate)",
  efate: "Elsewhere on Efate",
  luganville: "Luganville (Santo)",
  santo: "Elsewhere on Santo",
  pentecost: "Pentecost",
  tanna: "Tanna",
  malekula: "Malekula",
  ambae: "Ambae",
  ambrym: "Ambrym",
  epi: "Epi",
  maewo: "Maewo",
  banks: "Banks Islands",
  torres: "Torres Islands",
  other: "Other location in Vanuatu",
  outside: "Outside Vanuatu",
} as const;
export const attendance = {
  in_person: "In person at Yumiwork",
  online: "Online",
  mixed: "A mix of both",
} as const;
export const directions = {
  digital: "Digital agency/services",
  ecommerce: "Ecommerce",
  tourism: "Tourism & travel",
  service: "Another service business",
  existing: "Existing business",
  unsure: "Not sure yet",
} as const;
export const statuses = [
  "received",
  "contacted",
  "payment_pending",
  "enrolled",
  "cancelled",
] as const;
export function isOpen(c: Cohort, now = new Date()) {
  return (
    c.registrationState === "open" && now.getTime() <= Date.parse(c.teachingEnd)
  );
}
export function feeLabel(c: Cohort) {
  return `${c.currency} ${c.fee.toLocaleString("en-US")}`;
}
export function dateLabel(date: string, long = false) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Pacific/Efate",
    weekday: long ? "long" : "short",
    day: "numeric",
    month: long ? "long" : "short",
    ...(long ? { year: "numeric" as const } : {}),
  }).format(new Date(date.includes("T") ? date : `${date}T15:00:00+11:00`));
}

export function monthLabel(c: Cohort, year = false) {
  return new Intl.DateTimeFormat('en-GB', {timeZone:c.timezone,month:'long',...(year?{year:'numeric' as const}:{})}).format(new Date(c.start));
}
export function dayMonth(date: string) {
  return new Intl.DateTimeFormat('en-GB',{timeZone:'Pacific/Efate',day:'numeric',month:'long'}).format(new Date(date.includes('T')?date:`${date}T15:00:00+11:00`));
}
