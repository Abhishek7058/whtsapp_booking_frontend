/**
 * Home Page
 * Landing page that redirects to appropriate route based on authentication
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth.store';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading screen while checking authentication
  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-500 to-whatsapp-700 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mx-auto h-16 w-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
          <ChatBubbleLeftRightIcon className="h-10 w-10 text-white" />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">
          WhatsApp CRM
        </h1>
        
        {/* Subtitle */}
        <p className="text-whatsapp-100 mb-8">
          Professional Customer Relationship Management
        </p>
        
        {/* Loading Spinner */}
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
          <span className="text-white/80 text-sm">Loading...</span>
        </div>
      </div>
    </div>
  );
}
