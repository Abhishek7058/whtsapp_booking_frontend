/**
 * Dashboard Page
 * Main dashboard with real API integration and comprehensive metrics
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/store/auth.store';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatNumber, formatRelativeTime } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface DashboardStats {
  totalConversations: number;
  openConversations: number;
  totalContacts: number;
  averageResponseTime: number;
  onlineAgents: number;
  totalAgents: number;
  messagesLast24h: number;
  assignedConversations: number;
}

interface RecentConversation {
  id: number;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  status: string;
  priority: string;
  assignedAgent?: {
    name: string;
    avatar?: string;
  };
}

// ============================================================================
// Component
// ============================================================================

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Import API helpers
      const { dashboardApi } = await import('@/lib/api');

      // Load dashboard stats
      const statsResponse = await dashboardApi.getStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data as DashboardStats);
      }

      // Load recent conversations/messages
      const conversationsResponse = await dashboardApi.getRecentMessages(0, 5);
      if (conversationsResponse.success && conversationsResponse.data) {
        // Transform message data to conversation format
        const messages = Array.isArray(conversationsResponse.data)
          ? conversationsResponse.data
          : (conversationsResponse.data as any)?.content || [];

        const conversations = messages.map((msg: any, index: number) => ({
          id: msg.id || index,
          contactName: msg.contactName || `Contact ${msg.phoneNumber}`,
          contactPhone: msg.phoneNumber,
          lastMessage: msg.messageContent || msg.content,
          lastMessageAt: msg.sentAt || msg.createdAt,
          status: msg.status === 'SENT' ? 'OPEN' : msg.status,
          priority: 'NORMAL',
        }));

        setRecentConversations(conversations);
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'ASSIGNED': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'NORMAL': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening with your WhatsApp conversations today.
              </p>
            </div>
            <Button onClick={loadDashboardData} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Conversations */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalConversations || 0)}</p>
                </div>
                <div className="w-12 h-12 bg-whatsapp-100 rounded-xl flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-whatsapp-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% from last week</span>
              </div>
            </div>

            {/* Open Conversations */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Conversations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.openConversations || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-3 from yesterday</span>
              </div>
            </div>

            {/* Total Contacts */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                  <p className="text-3xl font-bold text-gray-900">{formatNumber(stats.totalContacts || 0)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% from last month</span>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.averageResponseTime || 0}m</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-15% improvement</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboard data available</h3>
            <p className="text-gray-600">Unable to load dashboard statistics from the server.</p>
          </div>
        )}

      {/* Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Conversations</h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {recentConversations.map((conversation) => (
              <div key={conversation.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar
                  fallback={conversation.contactName.split(' ').map(n => n[0]).join('')}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.contactName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(conversation.priority)} size="sm">
                        {conversation.priority}
                      </Badge>
                      <Badge className={getStatusColor(conversation.status)} size="sm">
                        {conversation.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(conversation.lastMessageAt)}
                    </p>
                    {conversation.assignedAgent && (
                      <div className="flex items-center space-x-1">
                        <Avatar
                          src={conversation.assignedAgent.avatar || ''}
                          fallback={conversation.assignedAgent.name.split(' ').map(n => n[0]).join('')}
                          size="xs"
                        />
                        <span className="text-xs text-gray-500">
                          {conversation.assignedAgent.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Status */}
        {isAdmin() && stats && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Team Status</h3>
              <Button variant="ghost" size="sm">
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Online Agents</span>
                <span className="text-sm font-medium text-gray-900">
                  {stats.onlineAgents || 0} / {stats.totalAgents || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.totalAgents ? (stats.onlineAgents / stats.totalAgents) * 100 : 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.messagesLast24h || 0}</p>
                  <p className="text-sm text-gray-600">Messages Today</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stats.assignedConversations || 0}</p>
                  <p className="text-sm text-gray-600">Assigned</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
