import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Pacific Wave Digital Terms of Service — the terms and conditions governing the use of our website and services.',
};

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-blue"></div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">Terms of Service</h1>
          <p className="text-blue-100 text-lg">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="space-y-8 text-gray-600 leading-relaxed">
              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the Pacific Wave Digital website (pacificwavedigital.com) and our services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">2. Services</h2>
                <p>
                  Pacific Wave Digital provides digital services including but not limited to web development, mobile application development, AI solutions, digital marketing, business automation, and cloud hosting. The specific scope, deliverables, and timeline for each project will be outlined in a separate agreement or proposal.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">3. Intellectual Property</h2>
                <p className="mb-4">
                  All content on this website — including text, graphics, logos, icons, images, and software — is the property of Pacific Wave Digital and is protected by intellectual property laws.
                </p>
                <p>
                  Upon full payment for services rendered, clients receive ownership of custom-developed deliverables as specified in the project agreement, unless otherwise stated.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">4. User Obligations</h2>
                <p className="mb-4">When using our website and services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Not use our services for any unlawful purpose</li>
                  <li>Not attempt to gain unauthorized access to our systems</li>
                  <li>Not reproduce, duplicate, or exploit any portion of our website without express permission</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">5. Payment Terms</h2>
                <p>
                  Payment terms for our services are outlined in individual project agreements. Unless otherwise specified, invoices are due within 14 days of issuance. Late payments may incur interest at a rate of 1.5% per month.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">6. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, Pacific Wave Digital shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services, regardless of the theory of liability.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">7. Warranties and Disclaimers</h2>
                <p>
                  Our website and services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, either express or implied. We do not warrant that our website will be uninterrupted, error-free, or free of viruses or other harmful components.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">8. Termination</h2>
                <p>
                  We reserve the right to terminate or suspend access to our services at any time, with or without cause, with or without notice. Upon termination, your right to use our services will immediately cease.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">9. Governing Law</h2>
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of the Republic of Vanuatu, without regard to its conflict of law provisions.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to this page. Your continued use of our website and services after any changes constitutes acceptance of the modified terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">11. Contact Information</h2>
                <p>For any questions regarding these Terms of Service, please contact us:</p>
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Email: <a href="mailto:info@pacificwavedigital.com" className="text-vibrant-orange hover:underline">info@pacificwavedigital.com</a></li>
                  <li>Phone: +678 777 4567</li>
                  <li>Address: Lini Highway, Port Vila, Vanuatu</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
