/**
 * Dashboard Layout Component
 * Main layout for authenticated users with sidebar navigation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChartPieIcon,
  CogIcon,
  DocumentTextIcon,
  ListBulletIcon,
  PaperAirplaneIcon,
  UsersIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// Types
// ============================================================================

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  adminOnly?: boolean;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// ============================================================================
// Navigation Configuration
// ============================================================================

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: ChartBarIcon,
  },
  {
    name: 'Conversations',
    href: '/conversations',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Contacts',
    href: '/contacts',
    icon: UserGroupIcon,
  },
  {
    name: 'Send Messages',
    href: '/messages',
    icon: PaperAirplaneIcon,
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: DocumentTextIcon,
  },
  {
    name: 'Auto-Reply Bot',
    href: '/chatbot',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Bulk Messaging',
    href: '/bulk-messaging',
    icon: UsersIcon,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: ChartPieIcon,
  },
  {
    name: 'Message Logs',
    href: '/message-logs',
    icon: ListBulletIcon,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: CogIcon,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: UsersIcon,
    adminOnly: true,
  },
];

// ============================================================================
// Component
// ============================================================================

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock data
  const { user, logout, isAdmin, updateOnlineStatus } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Update online status on mount
  useEffect(() => {
    updateOnlineStatus(true);
    
    // Update offline status on unmount
    return () => {
      updateOnlineStatus(false);
    };
  }, [updateOnlineStatus]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || isAdmin()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <SidebarContent 
            navigation={filteredNavigation} 
            pathname={pathname}
            onClose={() => setSidebarOpen(false)}
            isMobile
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent 
          navigation={filteredNavigation} 
          pathname={pathname}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </Button>

          {/* Search */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
              <input
                type="search"
                placeholder="Search conversations, contacts..."
                className="block w-full rounded-md border-0 bg-gray-50 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-whatsapp-500 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <BellIcon className="h-6 w-6" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* User menu */}
            <div className="relative">
              <UserMenu user={user} onLogout={handleLogout} />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// Sidebar Content Component
// ============================================================================

interface SidebarContentProps {
  navigation: NavigationItem[];
  pathname: string;
  onClose?: () => void;
  isMobile?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ 
  navigation, 
  pathname, 
  onClose,
  isMobile = false 
}) => {
  const { user } = useAuth();

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
      {/* Logo and close button */}
      <div className="flex h-16 shrink-0 items-center justify-between">
        <div className="flex items-center gap-x-3">
          <div className="h-8 w-8 rounded-lg bg-whatsapp-500 flex items-center justify-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900">
            WhatsApp CRM
          </span>
        </div>
        {isMobile && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XMarkIcon className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* User info */}
      <div className="flex items-center gap-x-3 rounded-lg bg-gray-50 p-3">
        <Avatar
          src={user?.profilePictureUrl}
          alt={user?.firstName}
          fallback={`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.role === 'ADMIN' ? 'Administrator' : 'Team Member'}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                        isActive
                          ? 'bg-whatsapp-50 text-whatsapp-700'
                          : 'text-gray-700 hover:text-whatsapp-700 hover:bg-gray-50'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-6 w-6 shrink-0',
                          isActive ? 'text-whatsapp-700' : 'text-gray-400 group-hover:text-whatsapp-700'
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge variant="secondary" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// ============================================================================
// User Menu Component
// ============================================================================

interface UserMenuProps {
  user: any;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-x-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar
          src={user?.profilePictureUrl}
          alt={user?.firstName}
          fallback={`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
          size="sm"
        />
        <span className="hidden lg:block text-sm font-medium text-gray-700">
          {user?.firstName} {user?.lastName}
        </span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <UserCircleIcon className="h-4 w-4 mr-3" />
                Profile
              </Link>

              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <CogIcon className="h-4 w-4 mr-3" />
                Settings
              </Link>

              <hr className="my-1" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardLayout;
