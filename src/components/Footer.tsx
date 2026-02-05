import Link from 'next/link';

const footerLinks = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/products', label: 'Products' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  services: [
    { href: '/services#web-development', label: 'Web Development' },
    { href: '/services#mobile-apps', label: 'Mobile Apps' },
    { href: '/services#ai-solutions', label: 'AI Solutions' },
    { href: '/services#digital-marketing', label: 'Digital Marketing' },
    { href: '/services#business-automation', label: 'Business Automation' },
    { href: '/services#cloud-hosting', label: 'Cloud & Hosting' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

const globalNetwork = [
  {
    flag: '🇻🇺',
    name: 'Pacific Wave Digital',
    location: 'Vanuatu',
    url: 'https://pacificwavedigital.com',
    tagline: 'Digital Innovation for the Pacific',
  },
  {
    flag: '🌐',
    name: 'Global Digital Prime',
    location: 'USA & Indonesia',
    url: 'https://globaldigitalprime.com',
    tagline: 'Enterprise Digital Solutions Worldwide',
  },
  {
    flag: '🇬🇭',
    name: 'Rapid Entrepreneurs',
    location: 'Ghana',
    url: 'https://rapidentrepreneurs.com',
    tagline: 'Empowering African Business Growth',
  },
  {
    flag: '🇬🇭',
    name: 'Akwaaba AI',
    location: 'Ghana',
    url: 'https://akwaabaai.com',
    tagline: 'AI-Powered Business Communication for Africa',
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-navy text-white">
      {/* Global Network Section */}
      <div className="border-b border-white/10">
        <div className="container-max section-padding !py-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold font-heading mb-3">Our Global Network</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A connected ecosystem of digital innovation companies spanning the Pacific, Americas, Southeast Asia, and Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {globalNetwork.map((company) => (
              <a
                key={company.name}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-vibrant-orange/30"
              >
                <div className="text-3xl mb-3">{company.flag}</div>
                <h4 className="font-bold text-lg mb-1 group-hover:text-vibrant-orange transition-colors">
                  {company.name}
                </h4>
                <p className="text-gray-400 text-sm mb-2">{company.location}</p>
                <p className="text-gray-500 text-xs italic">{company.tagline}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-max section-padding !py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-vibrant-orange flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold font-heading">Pacific Wave</span>
                <span className="text-xl font-bold text-vibrant-orange font-heading"> Digital</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Empowering Pacific Island businesses with cutting-edge AI solutions, web development, and digital transformation services.
            </p>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-vibrant-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Port Vila, Vanuatu</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-vibrant-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:info@pacificwavedigital.com" className="hover:text-vibrant-orange transition-colors">
                  info@pacificwavedigital.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-vibrant-orange flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+6787774567" className="hover:text-vibrant-orange transition-colors">
                  +678 777 4567
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-heading">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-vibrant-orange transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-heading">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-vibrant-orange transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="font-bold text-lg mb-6 font-heading">Legal</h4>
            <ul className="space-y-3 mb-8">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-vibrant-orange transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-bold text-lg mb-4 font-heading">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/company/pacific-wave-digital" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-vibrant-orange transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.facebook.com/pacificwavedigital" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-vibrant-orange transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://twitter.com/pacificwavedigital" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-vibrant-orange transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-max px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Pacific Wave Digital. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Crafted with innovation in Port Vila, Vanuatu 🇻🇺</p>
        </div>
      </div>
    </footer>
  );
}
