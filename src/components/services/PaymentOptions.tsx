import Image from 'next/image';
import Link from 'next/link';

const providers = [
  { name: 'Stripe', image: '/images/payments/stripe.svg', note: 'Cards and hosted checkout', description: 'Checkout and payment links for eligible merchant accounts. Vanuatu is not currently a direct Stripe onboarding country; a supported-country account and business eligibility are required.', href: 'https://stripe.com/global' },
  { name: 'MyCash', image: '/images/payments/mycash.webp', note: 'Local mobile money', description: 'Merchant QR and payment-instruction workflows for Vanuatu customers, with order references and confirmation steps. Automated integration depends on approved merchant facilities.', href: 'https://www.digicelpacific.com/mobile/vu/apps/mycashton' },
  { name: 'M-Vatu', image: '/images/payments/mvatu.webp', note: 'Local mobile money', description: 'Mobile-money payment workflows using approved M-Vatu merchant facilities. We confirm QR, payment instructions and any available automated connection with your provider.', href: 'https://vodafone.com.vu/pages/m-vatu' },
  { name: 'PayPal', image: '/images/payments/paypal.webp', note: 'Eligible wallet checkout', description: 'PayPal checkout for eligible business accounts. Receiving, withdrawal and bank settlement depend on account country and provider approval; we confirm these before implementation.', href: 'https://www.paypal.com/vu/home' },
];

export default function PaymentOptions({ compact = false }: { compact?: boolean }) {
  return <section id={compact ? 'payment-overview' : 'payment-options'} className="section-padding bg-slate-50" aria-labelledby={compact ? 'payment-options-preview' : 'payment-options-heading'}>
    <div className="container-max">
      <div className="mb-9 max-w-3xl"><p className="mb-3 text-sm font-semibold uppercase tracking-wider text-vibrant-orange">Online payment integration</p><h2 id={compact ? 'payment-options-preview' : 'payment-options-heading'} className="mb-4 font-heading text-3xl font-bold text-deep-blue md:text-4xl">Give customers a clearer way to pay</h2><p className="leading-relaxed text-slate-600">Connect card checkout and local mobile-money workflows to your website or app. We assess the provider, merchant account and confirmation process for your Vanuatu business.</p></div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {providers.map(provider => <article key={provider.name} className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6" data-payment-provider={provider.name}>
          <div className="relative mx-auto mb-6 h-20 w-full max-w-[200px]"><Image src={provider.image} alt={`${provider.name} logo`} fill sizes="(max-width: 639px) 80vw, (max-width: 1023px) 35vw, 18vw" className="object-contain" /></div>
          <h3 className="mb-2 text-xl font-bold text-deep-blue">{provider.name}</h3><p className="text-sm font-semibold text-vibrant-orange">{provider.note}</p>
          {!compact && <><p className="mb-5 mt-4 flex-1 text-sm leading-relaxed text-slate-600">{provider.description}</p><a href={provider.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-deep-blue underline underline-offset-4">Provider information <span aria-hidden="true">↗</span><span className="sr-only"> for {provider.name} (opens in a new tab)</span></a></>}
        </article>)}
      </div>
      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-600">Options depend on merchant eligibility and provider approval. We confirm the supported account, currency and settlement route before implementation. Provider logos identify the options discussed; they do not imply a partnership.</p>
      <div className="mt-7 flex flex-wrap gap-4"><Link href="/contact#enquiry-form" className="btn-primary">Contact us about payments</Link>{compact && <Link href="/services/online-payment-integration" className="btn-secondary">Explore payment integration</Link>}</div>
    </div>
  </section>;
}
