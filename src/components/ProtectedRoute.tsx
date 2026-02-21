'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, AdminUser, getAdminUserByEmail, updateLastLogin } from '@/lib/supabase';
import { canAccess, getRequiredPermission, AdminPage } from '@/lib/permissions';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPage?: AdminPage;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  authUser: User | null;
  adminUser: AdminUser | null;
  error: string | null;
}

export default function ProtectedRoute({ children, requiredPage }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    authUser: null,
    adminUser: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) {
            setAuthState({
              isLoading: false,
              isAuthenticated: false,
              authUser: null,
              adminUser: null,
              error: null,
            });
          }
          return;
        }

        // Get admin user profile
        const adminUser = await getAdminUserByEmail(session.user.email!);

        if (!adminUser) {
          if (mounted) {
            setAuthState({
              isLoading: false,
              isAuthenticated: false,
              authUser: session.user,
              adminUser: null,
              error: 'You do not have admin access. Please contact an administrator.',
            });
          }
          return;
        }

        if (!adminUser.is_active) {
          if (mounted) {
            setAuthState({
              isLoading: false,
              isAuthenticated: false,
              authUser: session.user,
              adminUser,
              error: 'Your account has been deactivated. Please contact an administrator.',
            });
          }
          return;
        }

        // Update last login
        await updateLastLogin(session.user.email!);

        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            authUser: session.user,
            adminUser,
            error: null,
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            authUser: null,
            adminUser: null,
            error: 'An error occurred while checking authentication.',
          });
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkAuth();
      } else {
        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            authUser: null,
            adminUser: null,
            error: null,
          });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Check page-level access
  const pageToCheck = requiredPage || getRequiredPermission(pathname);
  const hasAccess = authState.adminUser ? canAccess(authState.adminUser.role, pageToCheck!) : false;

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-deep-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (authState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{authState.error}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/admin');
            }}
            className="px-6 py-2 bg-deep-blue text-white rounded-lg hover:bg-dark-navy transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    // Not authenticated - the parent layout will show login form
    return null;
  }

  if (pageToCheck && !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-yellow-500 text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-semibold">{authState.adminUser?.role}</span>
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="px-6 py-2 bg-deep-blue text-white rounded-lg hover:bg-dark-navy transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook to use auth state in components
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    authUser: null,
    adminUser: null,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (mounted) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            authUser: null,
            adminUser: null,
            error: null,
          });
        }
        return;
      }

      const adminUser = await getAdminUserByEmail(session.user.email!);

      if (mounted) {
        setAuthState({
          isLoading: false,
          isAuthenticated: !!adminUser?.is_active,
          authUser: session.user,
          adminUser,
          error: !adminUser ? 'No admin access' : !adminUser.is_active ? 'Account deactivated' : null,
        });
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return authState;
}
