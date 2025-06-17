/**
 * Help & Documentation Page
 * Comprehensive help center with guides, FAQs, and support information
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  content: string;
}

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpenIcon,
      description: 'Learn the basics of using WhatsApp CRM',
      articles: [
        {
          id: 'login',
          title: 'How to Login',
          description: 'Step-by-step guide to accessing your account',
          content: `
            <h3>Logging into WhatsApp CRM</h3>
            <ol>
              <li>Navigate to the login page</li>
              <li>Enter your email address and password</li>
              <li>Click "Sign in" to access your dashboard</li>
              <li>Use "Remember me" to stay logged in</li>
            </ol>
            <p><strong>Default Admin Credentials:</strong></p>
            <ul>
              <li>Email: admin@whatsappcrm.com</li>
              <li>Password: Admin@123</li>
            </ul>
          `
        },
        {
          id: 'dashboard',
          title: 'Understanding the Dashboard',
          description: 'Overview of the main dashboard features',
          content: `
            <h3>Dashboard Overview</h3>
            <p>The dashboard provides a comprehensive view of your WhatsApp CRM performance:</p>
            <ul>
              <li><strong>Message Statistics:</strong> Total messages sent, received, and pending</li>
              <li><strong>Contact Metrics:</strong> Number of contacts and active conversations</li>
              <li><strong>Performance Indicators:</strong> Response times and success rates</li>
              <li><strong>Quick Actions:</strong> Direct access to key features</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'conversations',
      title: 'Conversations',
      icon: ChatBubbleLeftRightIcon,
      description: 'Managing WhatsApp conversations and messages',
      articles: [
        {
          id: 'send-message',
          title: 'Sending Messages',
          description: 'How to send messages to contacts',
          content: `
            <h3>Sending Messages</h3>
            <ol>
              <li>Go to the Conversations page</li>
              <li>Select a contact or start a new conversation</li>
              <li>Type your message in the text area</li>
              <li>Click Send or press Enter</li>
            </ol>
            <p><strong>Message Types Supported:</strong></p>
            <ul>
              <li>Text messages</li>
              <li>Images and media files</li>
              <li>Documents</li>
              <li>Template messages</li>
            </ul>
          `
        },
        {
          id: 'message-status',
          title: 'Message Status Tracking',
          description: 'Understanding message delivery status',
          content: `
            <h3>Message Status Indicators</h3>
            <ul>
              <li><strong>Pending:</strong> Message is queued for delivery</li>
              <li><strong>Sent:</strong> Message has been delivered to WhatsApp</li>
              <li><strong>Delivered:</strong> Message reached the recipient's device</li>
              <li><strong>Read:</strong> Recipient has read the message</li>
              <li><strong>Failed:</strong> Message delivery failed</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'contacts',
      title: 'Contact Management',
      icon: UserGroupIcon,
      description: 'Adding, organizing, and managing contacts',
      articles: [
        {
          id: 'add-contact',
          title: 'Adding New Contacts',
          description: 'How to add contacts to your CRM',
          content: `
            <h3>Adding Contacts</h3>
            <ol>
              <li>Navigate to the Contacts page</li>
              <li>Click "Add Contact" button</li>
              <li>Fill in the contact information</li>
              <li>Save the contact</li>
            </ol>
            <p><strong>Required Information:</strong></p>
            <ul>
              <li>Phone number (with country code)</li>
              <li>Name</li>
              <li>Optional: Email, company, tags</li>
            </ul>
          `
        },
        {
          id: 'import-contacts',
          title: 'Importing Contacts',
          description: 'Bulk import contacts from CSV files',
          content: `
            <h3>Bulk Contact Import</h3>
            <ol>
              <li>Prepare a CSV file with contact information</li>
              <li>Go to Contacts > Import</li>
              <li>Upload your CSV file</li>
              <li>Map the columns to contact fields</li>
              <li>Review and confirm the import</li>
            </ol>
          `
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: ChartBarIcon,
      description: 'Understanding your performance metrics',
      articles: [
        {
          id: 'dashboard-metrics',
          title: 'Dashboard Metrics',
          description: 'Understanding key performance indicators',
          content: `
            <h3>Key Metrics Explained</h3>
            <ul>
              <li><strong>Total Messages:</strong> All messages sent through the system</li>
              <li><strong>Success Rate:</strong> Percentage of successfully delivered messages</li>
              <li><strong>Response Time:</strong> Average time to respond to incoming messages</li>
              <li><strong>Active Conversations:</strong> Currently ongoing conversations</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'admin',
      title: 'Administration',
      icon: CogIcon,
      description: 'User management and system settings',
      articles: [
        {
          id: 'user-management',
          title: 'Managing Users',
          description: 'Adding and managing team members',
          content: `
            <h3>User Management (Admin Only)</h3>
            <ol>
              <li>Go to Admin > Users</li>
              <li>Click "Add User" to create new accounts</li>
              <li>Assign roles: Admin or Team Member</li>
              <li>Set user permissions and access levels</li>
            </ol>
            <p><strong>User Roles:</strong></p>
            <ul>
              <li><strong>Admin:</strong> Full system access</li>
              <li><strong>Team Member:</strong> Limited access to conversations and contacts</li>
            </ul>
          `
        }
      ]
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleBackToSections = () => {
    setSelectedArticle(null);
    setSelectedSection(null);
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBackToArticles}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedArticle.title}</h1>
              <p className="text-gray-600 mt-1">{selectedArticle.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (selectedSection) {
    const section = helpSections.find(s => s.id === selectedSection);
    if (!section) return null;

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleBackToSections}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <section.icon className="h-8 w-8 text-whatsapp-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{section.title}</h1>
                <p className="text-gray-600 mt-1">{section.description}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {section.articles.map((article) => (
              <div
                key={article.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedArticle(article)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600">{article.description}</p>
                <div className="mt-4 text-whatsapp-600 text-sm font-medium">
                  Read more →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to your questions and learn how to use WhatsApp CRM effectively
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-whatsapp-500 focus:border-whatsapp-500"
            />
          </div>
        </div>

        {/* Help Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredSections.map((section) => (
            <div
              key={section.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSection(section.id)}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-whatsapp-100 rounded-lg">
                  <section.icon className="h-6 w-6 text-whatsapp-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{section.description}</p>
              <div className="text-sm text-gray-500">
                {section.articles.length} article{section.articles.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <QuestionMarkCircleIcon className="h-12 w-12 text-whatsapp-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@whatsappcrm.com"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-whatsapp-600 hover:bg-whatsapp-700 transition-colors"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Email Support
              </a>
              <a
                href="tel:+1234567890"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <PhoneIcon className="h-5 w-5 mr-2" />
                Call Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
