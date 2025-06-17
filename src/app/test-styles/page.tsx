/**
 * Test Styles Page
 * Simple page to test if Tailwind CSS is working
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-whatsapp-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-whatsapp-800 mb-8">
          Tailwind CSS Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Colors Test</h2>
            <div className="space-y-2">
              <div className="w-full h-4 bg-whatsapp-500 rounded"></div>
              <div className="w-full h-4 bg-blue-500 rounded"></div>
              <div className="w-full h-4 bg-green-500 rounded"></div>
              <div className="w-full h-4 bg-red-500 rounded"></div>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Typography Test</h2>
            <p className="text-sm text-gray-600 mb-2">Small text</p>
            <p className="text-base text-gray-700 mb-2">Base text</p>
            <p className="text-lg text-gray-800 mb-2">Large text</p>
            <p className="text-xl font-bold text-whatsapp-600">Bold WhatsApp text</p>
          </div>
          
          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Spacing Test</h2>
            <div className="space-y-4">
              <div className="p-2 bg-gray-100 rounded">Padding 2</div>
              <div className="p-4 bg-gray-200 rounded">Padding 4</div>
              <div className="p-6 bg-gray-300 rounded">Padding 6</div>
            </div>
          </div>
        </div>
        
        {/* Buttons Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Buttons Test</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-whatsapp-500 text-white rounded-md hover:bg-whatsapp-600 transition-colors">
              WhatsApp Button
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Blue Button
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors">
              Gray Button
            </button>
            <button className="px-4 py-2 border border-whatsapp-500 text-whatsapp-500 rounded-md hover:bg-whatsapp-50 transition-colors">
              Outline Button
            </button>
          </div>
        </div>
        
        {/* Responsive Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Responsive Test</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-red-100 p-4 rounded text-center">1 col on mobile</div>
            <div className="bg-green-100 p-4 rounded text-center">2 cols on sm+</div>
            <div className="bg-blue-100 p-4 rounded text-center">3 cols on md+</div>
            <div className="bg-yellow-100 p-4 rounded text-center">4 cols on lg+</div>
          </div>
        </div>
        
        {/* Animation Test */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Animation Test</h2>
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-whatsapp-500 rounded-full animate-pulse"></div>
            <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-16 h-16 bg-green-500 rounded-full animate-spin"></div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="text-center">
          <Link 
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 transition-colors font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
