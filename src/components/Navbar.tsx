'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const serviceLinks = [
  { href: '/services/web-design', label: 'Web Design' },
  { href: '/services/web-development', label: 'Web Development' },
  { href: '/services/software-development', label: 'Software Development' },
  { href: '/services/digital-marketing', label: 'Digital Marketing' },
  { href: '/services/seo', label: 'SEO Services' },
  { href: '/services/ecommerce', label: 'E-commerce' },
  { href: '/services/mobile-apps', label: 'Mobile Apps' },
];

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/training-center', label: 'Training' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container-max">
        <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo-icon.jpg"
              alt="Pacific Wave Digital"
              width={44}
              height={44}
              className="rounded-lg"
            />
            <div>
              <span className="text-xl font-bold text-deep-blue font-heading">Pacific Wave</span>
              <span className="text-xl font-bold text-vibrant-orange font-heading"> Digital</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center space-x-5">
            {navLinks.map((link) =>
              link.href === '/services' ? (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className="inline-flex items-center text-gray-600 hover:text-deep-blue font-medium transition-colors duration-200 text-sm py-2"
                  >
                    {link.label}
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>
                  {/* Dropdown */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200">
                    <div className="w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                      {serviceLinks.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-deep-blue hover:bg-gray-50 transition-colors"
                        >
                          {service.label}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <Link
                          href="/services"
                          className="block px-4 py-2.5 text-sm font-semibold text-vibrant-orange hover:bg-gray-50 transition-colors"
                        >
                          All Services →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-deep-blue font-medium transition-colors duration-200 text-sm"
                >
                  {link.label}
                </Link>
              )
            )}
            <Link href="/get-started" className="btn-primary text-sm !px-6 !py-2.5">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6 text-deep-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="xl:hidden border-t border-gray-100 bg-white">
            <div className="py-4 px-4 space-y-1">
              {navLinks.map((link) =>
                link.href === '/services' ? (
                  <div key={link.href}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-3 px-4 text-gray-600 hover:text-deep-blue hover:bg-gray-50 rounded-lg font-medium transition-colors"
                      >
                        {link.label}
                      </Link>
                      <button
                        onClick={() => setServicesOpen(!servicesOpen)}
                        className="p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        aria-label="Toggle services menu"
                        aria-expanded={servicesOpen}
                      >
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    {servicesOpen && (
                      <div className="pl-4 space-y-1">
                        {serviceLinks.map((service) => (
                          <Link
                            key={service.href}
                            href={service.href}
                            onClick={() => setIsOpen(false)}
                            className="block py-2.5 px-4 text-sm text-gray-500 hover:text-deep-blue hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {service.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block py-3 px-4 text-gray-600 hover:text-deep-blue hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-3">
                <Link href="/get-started" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center text-sm">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
