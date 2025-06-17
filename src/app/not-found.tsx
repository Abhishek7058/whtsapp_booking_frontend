/**
 * 404 Not Found Page
 * Displayed when a page is not found
 */

import Link from 'next/link';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mx-auto h-12 w-12 rounded-xl bg-whatsapp-500 flex items-center justify-center mb-6">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
        </div>
        
        {/* 404 */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Page not found
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have entered the wrong URL.
        </p>
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">
              Go back home
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard">
              Go to dashboard
            </Link>
          </Button>
        </div>
        
        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          Need help? Check our{' '}
          <Link 
            href="/help" 
            className="text-whatsapp-600 hover:text-whatsapp-500"
          >
            help center
          </Link>{' '}
          or{' '}
          <a 
            href="mailto:support@whatsappcrm.com" 
            className="text-whatsapp-600 hover:text-whatsapp-500"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
