import { affiliateTerms } from "@/lib/lms/affiliate-terms";

export default function AffiliateTermsContent({ accordion = false }: { accordion?: boolean }) {
  if (accordion)
    return (
      <div className="af-legal-accordion">
        {affiliateTerms.map(({ title, body }, i) => (
          <details key={title} open={i === 0}>
            <summary>
              <span className="af-legal-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <span className="af-legal-toggle" aria-hidden="true" />
            </summary>
            <p>{body}</p>
          </details>
        ))}
      </div>
    );
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
