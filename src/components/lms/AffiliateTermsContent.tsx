import { affiliateTerms } from "@/lib/lms/affiliate-terms";

export default function AffiliateTermsContent() {
  return (
    <div className="space-y-6">
      {affiliateTerms.map(({ title, body }) => (
        <div key={title}>
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="leading-relaxed">{body}</p>
        </div>
      ))}
    </div>
  );
}
