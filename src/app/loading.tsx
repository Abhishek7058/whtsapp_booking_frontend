/**
 * Global Loading Component
 * Displayed while pages are loading
 */

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="mx-auto h-12 w-12 rounded-xl bg-whatsapp-500 flex items-center justify-center mb-4">
          <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
        </div>
        
        {/* Loading Spinner */}
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-whatsapp-500 mx-auto mb-4"></div>
        
        {/* Loading Text */}
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
