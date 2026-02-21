'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-deep-blue font-medium transition-colors duration-200 text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/get-started" className="btn-primary text-sm !px-6 !py-2.5">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
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
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="py-4 px-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 text-gray-600 hover:text-deep-blue hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
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
