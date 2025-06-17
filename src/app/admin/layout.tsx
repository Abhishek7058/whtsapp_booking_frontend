/**
 * Admin Layout
 * Layout for admin-only pages with role protection
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth.store';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import Loading from '../loading';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
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

  // Show access denied if not admin
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Warning Icon */}
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
          
          {/* Access Denied Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          
          {/* Access Denied Message */}
          <p className="text-gray-600 mb-6">
            You don't have permission to access this area. This section is restricted to administrators only.
          </p>
          
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Current user:</span> {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Role:</span> {user?.role}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
          
          {/* Contact Admin */}
          <p className="text-sm text-gray-500 mt-6">
            Need admin access?{' '}
            <a 
              href="mailto:admin@whatsappcrm.com" 
              className="text-whatsapp-600 hover:text-whatsapp-500"
            >
              Contact your administrator
            </a>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
