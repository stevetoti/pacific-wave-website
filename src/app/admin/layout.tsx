'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { supabase, AdminUser, getAdminUserByEmail, updateLastLogin, requestPasswordReset } from '@/lib/supabase';
import { canAccess, AdminPage, roleLabels } from '@/lib/permissions';
import { User } from '@supabase/supabase-js';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  page: AdminPage;
}

const adminNav: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊', page: 'dashboard' },
  { href: '/admin/blog', label: 'Blog Posts', icon: '📝', page: 'blog' },
  { href: '/admin/seo', label: 'SEO Settings', icon: '🔍', page: 'seo' },
  { href: '/admin/media', label: 'Media Library', icon: '🖼️', page: 'media' },
  { href: '/admin/transcripts', label: 'Transcripts', icon: '💬', page: 'transcripts' },
  { href: '/admin/users', label: 'User Management', icon: '👥', page: 'users' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️', page: 'settings' },
];

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated' | 'error';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Auth state
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) {
            setAuthStatus('unauthenticated');
            setAuthUser(null);
            setAdminUser(null);
          }
          return;
        }

        // Get admin user profile
        const profile = await getAdminUserByEmail(session.user.email!);

        if (!profile) {
          if (mounted) {
            setAuthStatus('error');
            setAuthUser(session.user);
            setAdminUser(null);
            setAuthError('Your email is not registered as an admin. Please contact a super admin.');
          }
          return;
        }

        if (!profile.is_active) {
          if (mounted) {
            setAuthStatus('error');
            setAuthUser(session.user);
            setAdminUser(profile);
            setAuthError('Your account has been deactivated. Please contact a super admin.');
          }
          return;
        }

        // Update last login
        await updateLastLogin(session.user.email!);

        if (mounted) {
          setAuthStatus('authenticated');
          setAuthUser(session.user);
          setAdminUser(profile);
          setAuthError(null);
        }
      } catch (error) {
        console.error('Auth error:', error);
        if (mounted) {
          setAuthStatus('error');
          setAuthError('Failed to check authentication. Please refresh the page.');
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        initAuth();
      } else {
        if (mounted) {
          setAuthStatus('unauthenticated');
          setAuthUser(null);
          setAdminUser(null);
          setAuthError(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (!data.user) {
        setLoginError('Login failed. Please try again.');
        return;
      }

      // Check if user is in admin_users table
      const profile = await getAdminUserByEmail(data.user.email!);
      if (!profile) {
        await supabase.auth.signOut();
        setLoginError('You do not have admin access.');
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setLoginError('Your account has been deactivated.');
        return;
      }

      // Success - auth state change will handle the rest
    } catch (err) {
      console.error('Login error:', err);
      setLoginError('An unexpected error occurred.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const { error } = await requestPasswordReset(email);
      if (error) {
        setLoginError(error.message);
      } else {
        setResetEmailSent(true);
      }
    } catch (err) {
      console.error('Reset error:', err);
      setLoginError('Failed to send reset email.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin');
  };

  // Filter nav items based on user role
  const filteredNav = adminNav.filter(item => 
    adminUser ? canAccess(adminUser.role, item.page) : false
  );

  // Loading state
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state (user authenticated but no access)
  if (authStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-navy to-deep-blue">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{authError}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-vibrant-orange text-white font-bold rounded-lg hover:bg-soft-orange transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Login form
  if (authStatus === 'unauthenticated') {
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

          {showForgotPassword ? (
            // Forgot Password Form
            <form onSubmit={handleForgotPassword}>
              {resetEmailSent ? (
                <div className="text-center py-6">
                  <div className="text-green-500 text-4xl mb-4">✉️</div>
                  <h3 className="font-bold text-gray-800 mb-2">Check Your Email</h3>
                  <p className="text-gray-600 mb-6">
                    If an account exists for {email}, you&apos;ll receive a password reset link.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                      setEmail('');
                    }}
                    className="text-deep-blue hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter your email and we&apos;ll send you a link to reset your password.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  {loginError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {loginError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-vibrant-orange text-white font-bold py-3 rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingIn ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setLoginError('');
                      }}
                      className="text-gray-500 text-sm hover:text-deep-blue"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            // Login Form
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-deep-blue/20 focus:border-deep-blue"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-vibrant-orange text-white font-bold py-3 rounded-lg hover:bg-soft-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </button>
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setLoginError('');
                  }}
                  className="text-deep-blue text-sm hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <Link href="/" className="text-gray-500 text-sm hover:text-deep-blue">
              ← Back to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated - render admin layout
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-dark-navy text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
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
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {filteredNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
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

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-vibrant-orange flex items-center justify-center font-bold">
                {adminUser?.name?.[0] || authUser?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {adminUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {roleLabels[adminUser?.role || 'viewer']}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 w-full transition-colors text-left"
          >
            <span className="text-xl">🚪</span>
            <span>Sign Out</span>
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white shadow-sm p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-deep-blue">PWD Admin</span>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
