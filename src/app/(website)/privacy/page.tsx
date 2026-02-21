import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Pacific Wave Digital Privacy Policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-blue"></div>
        <div className="relative container-max px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">Privacy Policy</h1>
          <p className="text-blue-100 text-lg">Last updated: January 1, 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <div className="space-y-8 text-gray-600 leading-relaxed">
              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">1. Introduction</h2>
                <p>
                  Pacific Wave Digital (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website pacificwavedigital.com or use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">2. Information We Collect</h2>
                <p className="mb-4">We may collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, company name, and other details you provide through our contact form or when engaging our services.</li>
                  <li><strong>Usage Data:</strong> Browser type, operating system, pages visited, time spent on pages, and other analytics data collected through cookies and similar technologies.</li>
                  <li><strong>Communication Data:</strong> Messages you send through our chat widget, email, or other communication channels.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To deliver and improve our products and services</li>
                  <li>To send periodic emails regarding our services (with your consent)</li>
                  <li>To analyze website usage and improve user experience</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">4. Data Sharing and Disclosure</h2>
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and services, provided they agree to keep your information confidential.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">5. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">6. Cookies</h2>
                <p>
                  Our website uses cookies to enhance your browsing experience. You can set your browser to refuse all cookies or to indicate when a cookie is being sent. However, some features of our website may not function properly without cookies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">7. Third-Party Links</h2>
                <p>
                  Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">8. Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt out of marketing communications</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">9. Children&apos;s Privacy</h2>
                <p>
                  Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">10. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-blue font-heading mb-4">11. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
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
