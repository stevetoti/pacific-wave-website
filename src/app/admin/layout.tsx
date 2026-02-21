'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/blog', label: 'Blog Posts', icon: '📝' },
  { href: '/admin/seo', label: 'SEO Settings', icon: '🔍' },
  { href: '/admin/media', label: 'Media Library', icon: '🖼️' },
  { href: '/admin/transcripts', label: 'Transcripts', icon: '💬' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if admin is authenticated (using localStorage for simplicity)
    const adminAuth = localStorage.getItem('pwd_admin_auth');
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, use Supabase Auth
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'PacificWave2026!') {
      localStorage.setItem('pwd_admin_auth', 'authenticated');
      setIsAuthenticated(true);
    } else {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pwd_admin_auth');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-navy to-deep-blue">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/images/logo-icon.jpg"
              alt="Pacific Wave Digital"
              width={60}
              height={60}
              className="mx-auto rounded-xl mb-4"
            />
            <h1 className="text-2xl font-bold text-deep-blue font-heading">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-2">Pacific Wave Digital CMS</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-vibrant-orange text-white font-bold py-3 rounded-lg hover:bg-soft-orange transition-colors"
            >
              Login to Admin
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 text-sm hover:text-deep-blue">
              ← Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-navy text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/images/logo-icon.jpg"
              alt="Pacific Wave Digital"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <div>
              <span className="font-bold text-lg">PWD</span>
              <span className="text-vibrant-orange font-bold"> Admin</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {adminNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-vibrant-orange text-white'
                      : 'hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 w-full transition-colors text-left"
          >
            <span className="text-xl">🚪</span>
            <span>Logout</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 w-full transition-colors text-left mt-2"
          >
            <span className="text-xl">🌐</span>
            <span>View Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
