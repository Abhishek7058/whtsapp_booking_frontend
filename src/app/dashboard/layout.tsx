/**
 * Dashboard Layout
 * Layout for authenticated dashboard pages
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, initializeAuth } from '@/store/auth.store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import Loading from '../loading';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  // Show loading if not authenticated (while redirecting)
  if (!isAuthenticated) {
    return <Loading />;
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
