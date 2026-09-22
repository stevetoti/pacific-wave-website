import type { Registration } from "./schema";
// Neutralise spreadsheet formulas even when preceded by whitespace or control characters.
export function csvCell(value: unknown) {
  let text = String(value ?? "").replace(/\u0000/g, "");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
export function registrationCSV(rows: Registration[]) {
  const keys = [
    "reference",
    "cohort_id",
    "full_name",
    "email",
    "phone_normalized",
    "location_code",
    "location_other",
    "area_optional",
    "attendance_preference",
    "business_direction",
    "question",
    "status",
    "future_training_opt_in",
    "acknowledged_at",
    "privacy_version",
    "student_email_state",
    "internal_email_state",
    "created_at",
  ] as const;
  return (
    "\uFEFF" +
    [
      keys.join(","),
      ...rows.map((row) => keys.map((key) => csvCell(row[key])).join(",")),
    ].join("\r\n")
  );
}
