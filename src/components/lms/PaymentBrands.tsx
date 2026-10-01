import { Landmark } from "lucide-react";
// Simple brand-coloured marks so payers recognise card and bank options at a glance.
export function VisaMark() {
  return (
    <svg className="pay-mark" viewBox="0 0 64 40" role="img" aria-label="Visa">
      <rect width="64" height="40" rx="6" fill="#fff" stroke="#d8dfea" />
      <text x="32" y="26" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="900" fontStyle="italic" fill="#1A1F71">
        VISA
      </text>
    </svg>
  );
}
export function MastercardMark() {
  return (
    <svg className="pay-mark" viewBox="0 0 64 40" role="img" aria-label="Mastercard">
      <rect width="64" height="40" rx="6" fill="#fff" stroke="#d8dfea" />
      <circle cx="26" cy="20" r="11" fill="#EB001B" />
      <circle cx="38" cy="20" r="11" fill="#F79E1B" />
      <path d="M32 10.8a11 11 0 0 1 0 18.4 11 11 0 0 1 0-18.4z" fill="#FF5F00" />
    </svg>
  );
}
const bankColours: Record<string, string> = { ANZ: "#007dba", BRED: "#0b3b8c" };
export function BankBadge({ bank, large = false }: { bank: string; large?: boolean }) {
  return (
    <span className={`pay-bank-badge ${large ? "large" : ""}`} style={{ background: bankColours[bank] || "#233c6f" }}>
      <Landmark size={large ? 18 : 14} aria-hidden="true" />
      {bank}
    </span>
  );
}
