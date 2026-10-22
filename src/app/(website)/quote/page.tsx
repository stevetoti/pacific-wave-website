import type { Metadata } from 'next';
import PrintButton from '@/components/quote/PrintButton';
import {
  formatVuv,
  monthlyRetainer,
  quotePackages,
  quoteTerms,
  runningCosts,
} from '@/lib/quote-packages';

// Unlisted: shared directly with prospects. Not in the navigation or sitemap, and not indexed.
export const metadata: Metadata = {
  title: 'Packages & Pricing',
  description: 'Pacific Wave Digital website and digital system packages, payment schedule and running costs.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: null },
};

const EMAIL = 'steve@pacificwavedigital.com';
const PHONE = '+678 528 8141';
const WHATSAPP = 'https://wa.me/6785288141?text=' + encodeURIComponent('Hello Pacific Wave Digital, I would like a quotation for a website.');
const QUOTE_MAIL = `mailto:${EMAIL}?subject=${encodeURIComponent('Quotation request')}&body=${encodeURIComponent('Organisation:\nPackage of interest:\nWhat you need:\n')}`;

const assistantModes = [
  {
    title: 'Every organisation',
    points: [
      'Answers questions about your services, prices, hours and policies',
      'Finds the right page on your website and shares the link',
      'Takes the visitor’s name and contact details when they want a person',
    ],
  },
  {
    title: 'Bookings',
    points: [
      'Shows real free times and books the appointment',
      'Reschedules or cancels using the booking reference and email',
      'Emails a confirmation to the customer and a copy to your team',
    ],
  },
  {
    title: 'Online shops',
    points: [
      'Recommends products and sends the link with price and stock',
      'Checks order status with the order number and email',
      'Never shows one customer’s details to another',
    ],
  },
];

const paidPackages = quotePackages.filter(p => p.id !== 'starter');

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-1 h-4 w-4 flex-none text-vibrant-orange">
      <path fill="currentColor" d="M7.6 14.2 3.8 10.4l1.4-1.4 2.4 2.4 7.2-7.2 1.4 1.4z" />
    </svg>
  );
}

export default function QuotePage() {
  return (
    <div className="pwd-quote bg-white text-gray-700">
      {/* Hero */}
      <section className="relative overflow-hidden print:overflow-visible">
        <div className="absolute inset-0 gradient-blue print:hidden" />
        <div className="relative container-max px-4 sm:px-6 lg:px-8 py-16 md:py-20 print:py-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-soft-orange print:text-vibrant-orange">Pacific Wave Digital · Packages & pricing</p>
          <h1 className="mt-4 max-w-3xl text-3xl md:text-5xl font-bold font-heading leading-tight text-white print:text-deep-blue print:text-2xl">
            Websites and digital systems built to be found, used and trusted
          </h1>
          <p className="mt-5 max-w-2xl text-base md:text-lg leading-relaxed text-blue-100 print:text-gray-600 print:text-xs">
            Every package is delivered end to end by our in-house team: design, build, AI integration, training and support.
            Every website starts with keyword research, so your pages target the searches your customers actually type, and
            from Essential upwards it comes with an AI assistant that serves visitors in any language and hands them to your
            team when they want a person.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <a href={QUOTE_MAIL} className="btn-primary">Request a quotation</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-secondary">WhatsApp us</a>
            <PrintButton className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white underline underline-offset-4 hover:text-soft-orange" />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section aria-labelledby="packages" className="section-padding bg-light-gray print:bg-white print:py-4 print:px-0">
        <div className="container-max">
          <h2 id="packages" className="text-2xl md:text-3xl font-bold font-heading text-deep-blue">Investment options</h2>
          <p className="mt-2 max-w-2xl text-gray-600">Fixed-price packages, so you can choose the level of digital capability that matches your goals and budget.</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3 print:grid-cols-3 print:gap-3">
            {paidPackages.map(pkg => (
              <article
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 print:break-inside-avoid print:shadow-none print:p-3 ${pkg.popular ? 'ring-2 ring-vibrant-orange' : 'ring-gray-200'}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-vibrant-orange px-3 py-1 text-xs font-semibold text-white">Most popular</span>
                )}
                <h3 className="text-xl font-bold font-heading text-deep-blue">{pkg.name}</h3>
                <p className="text-sm font-medium text-vibrant-orange">{pkg.tagline}</p>
                <p className="mt-4 text-3xl font-bold text-deep-blue print:text-xl">{formatVuv(pkg.price)}</p>
                <p className="mt-1 text-sm text-gray-500">One-time · delivered in {pkg.delivery}</p>
                <p className="mt-4 text-sm text-gray-600">{pkg.bestFor}</p>
                <ul className="mt-5 space-y-2.5 text-sm print:space-y-1">
                  {pkg.everythingIn && (
                    <li className="flex gap-2 font-semibold text-deep-blue"><Check />Everything in {pkg.everythingIn}, plus:</li>
                  )}
                  {pkg.includes.map(item => (
                    <li key={item} className="flex gap-2"><Check /><span>{item}</span></li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {quotePackages.filter(p => p.id === 'starter').map(pkg => (
            <article key={pkg.id} className="mt-6 rounded-2xl border-2 border-dashed border-deep-blue/30 bg-white p-6 print:break-inside-avoid print:p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold font-heading text-deep-blue">{pkg.name}</h3>
                  <p className="text-sm font-medium text-vibrant-orange">{pkg.tagline}</p>
                </div>
                <p className="text-2xl font-bold text-deep-blue">{formatVuv(pkg.price)} <span className="text-sm font-normal text-gray-500">· {pkg.delivery}</span></p>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Just getting started? Eligible small businesses, startups and community groups can access a special rate:{' '}
                {pkg.includes.join(' · ')}. {pkg.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* AI assistant */}
      <section aria-labelledby="assistant" className="section-padding print:py-4 print:px-0">
        <div className="container-max">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-vibrant-orange">Included from Essential upwards</p>
          <h2 id="assistant" className="mt-2 text-2xl md:text-3xl font-bold font-heading text-deep-blue">An AI assistant that looks after your visitors</h2>
          <p className="mt-3 max-w-3xl text-gray-600">
            Your website comes with a chat assistant trained on your organisation. It replies in the visitor’s own language, day and
            night, and only states facts you have approved. It never makes up prices, times or promises. Essential includes the
            question-answering assistant; Professional and Enterprise add bookings or shop help, and Enterprise extends it to WhatsApp.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3 print:grid-cols-3 print:gap-3">
            {assistantModes.map(mode => (
              <div key={mode.title} className="rounded-2xl bg-light-gray p-6 print:p-3 print:break-inside-avoid">
                <h3 className="font-bold font-heading text-deep-blue">{mode.title}</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {mode.points.map(point => <li key={point} className="flex gap-2"><Check /><span>{point}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-xl bg-pale-orange p-5 text-sm text-gray-700 print:p-3">
            <strong className="text-deep-blue">Your team can step in at any time.</strong> When a customer asks for a person, you get an
            alert with the conversation and a link. One click and you are chatting with them in the same window, and you can hand
            back to the assistant when you are done.
          </p>
        </div>
      </section>

      {/* Payment schedule */}
      <section aria-labelledby="payment" className="section-padding bg-light-gray print:bg-white print:py-4 print:px-0">
        <div className="container-max">
          <h2 id="payment" className="text-2xl md:text-3xl font-bold font-heading text-deep-blue">Payment schedule</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-deep-blue text-left text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Milestone</th>
                  {paidPackages.map(p => <th key={p.id} scope="col" className="px-4 py-3 text-right font-semibold">{p.name}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <th scope="row" className="px-4 py-3 text-left font-medium">70% on acceptance (deposit to start)</th>
                  {paidPackages.map(p => <td key={p.id} className="px-4 py-3 text-right tabular-nums">{(p.price * 0.7).toLocaleString('en-US')}</td>)}
                </tr>
                <tr>
                  <th scope="row" className="px-4 py-3 text-left font-medium">30% on completion & handover</th>
                  {paidPackages.map(p => <td key={p.id} className="px-4 py-3 text-right tabular-nums">{(p.price * 0.3).toLocaleString('en-US')}</td>)}
                </tr>
                <tr className="bg-light-gray font-bold text-deep-blue">
                  <th scope="row" className="px-4 py-3 text-left">Total (VUV)</th>
                  {paidPackages.map(p => <td key={p.id} className="px-4 py-3 text-right tabular-nums">{p.price.toLocaleString('en-US')}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            For government, institutional and donor-funded engagements, we are happy to align the milestones with your procurement
            framework (for example 30% / 40% / 30%).
          </p>
        </div>
      </section>

      {/* Monthly */}
      <section aria-labelledby="monthly" className="section-padding print:py-4 print:px-0">
        <div className="container-max">
          <div className="grid gap-8 rounded-2xl bg-deep-blue p-8 text-white md:grid-cols-[1fr_auto] md:items-center print:bg-white print:p-3 print:text-gray-700 print:ring-1 print:ring-gray-300">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-soft-orange">Optional</p>
              <h2 id="monthly" className="mt-2 text-2xl font-bold font-heading print:text-deep-blue">Ongoing website & system management</h2>
              <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {monthlyRetainer.includes.map(item => <li key={item} className="flex gap-2"><Check /><span>{item}</span></li>)}
              </ul>
              <p className="mt-4 text-sm text-blue-100 print:text-gray-500">{monthlyRetainer.note}</p>
            </div>
            <p className="text-3xl font-bold whitespace-nowrap print:text-deep-blue">{formatVuv(monthlyRetainer.price)}<span className="text-base font-normal"> / month</span></p>
          </div>
        </div>
      </section>

      {/* Running costs */}
      <section aria-labelledby="running" className="section-padding bg-light-gray print:bg-white print:py-4 print:px-0">
        <div className="container-max">
          <h2 id="running" className="text-2xl md:text-3xl font-bold font-heading text-deep-blue">Running costs you should plan for</h2>
          <p className="mt-3 max-w-3xl text-gray-600">
            These are paid to the service providers, not to us, and are set up in your organisation’s name so you own them. Figures
            are rounded estimates; we confirm them in your formal quotation and tell you before any of them changes.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-200">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-deep-blue text-left text-white">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Item</th>
                  <th scope="col" className="px-4 py-3 font-semibold">What it is for</th>
                  <th scope="col" className="px-4 py-3 font-semibold">When</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Typical cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 align-top">
                {runningCosts.map(row => (
                  <tr key={row.item} className="print:break-inside-avoid">
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-deep-blue">{row.item}</th>
                    <td className="px-4 py-3">{row.purpose}</td>
                    <td className="px-4 py-3 text-gray-500">{row.when}</td>
                    <td className="px-4 py-3 font-medium text-deep-blue">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section aria-labelledby="terms" className="section-padding print:py-4 print:px-0">
        <div className="container-max grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 id="terms" className="text-2xl md:text-3xl font-bold font-heading text-deep-blue">Terms & conditions</h2>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              {quoteTerms.map(term => <li key={term}>{term}</li>)}
            </ol>
          </div>
          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-light-gray p-5">
              <h3 className="font-bold text-deep-blue">You own everything</h3>
              <p className="mt-1">Your website, content, domain, data and every account are in your organisation’s name.</p>
            </div>
            <div className="rounded-2xl bg-light-gray p-5">
              <h3 className="font-bold text-deep-blue">Honest results</h3>
              <p className="mt-1">Nobody can guarantee a Google ranking. Local and specific searches can reach page one within weeks; competitive terms take longer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding gradient-blue text-white print:bg-none print:bg-white print:text-gray-700 print:py-4 print:px-0">
        <div className="container-max text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading print:text-deep-blue">Ready for a formal quotation?</h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100 print:text-gray-600">
            Tell us about your organisation and the package you are interested in. We will send a formal quotation with payment details.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
            <a href={QUOTE_MAIL} className="btn-primary">Request a quotation</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-secondary">WhatsApp {PHONE}</a>
          </div>
          <p className="mt-6 text-sm text-blue-100 print:text-gray-600">
            Pacific Wave Digital Ltd. · Port Vila, Efate, Vanuatu · {EMAIL} · {PHONE} · pacificwavedigital.com
          </p>
        </div>
      </section>
    </div>
  );
}
