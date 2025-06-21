/**
 * Conversations Page
 * Main conversations management interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
// import { useAuth } from '@/store/auth.store';
import { formatRelativeTime } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface Conversation {
  id: number;
  contact: {
    id: number;
    name: string;
    phoneNumber: string;
    profilePictureUrl?: string;
  };
  status: 'OPEN' | 'ASSIGNED' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  subject?: string;
  lastMessage: {
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'document' | 'audio';
  };
  unreadCount: number;
  assignedAgent?: {
    id: number;
    name: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Mock Data
// ============================================================================



// ============================================================================
// Component
// ============================================================================

export default function ConversationsPage() {
  // const { user, isAdmin } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  useEffect(() => {
    loadConversations();
  }, [currentPage]);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Import API helpers
      const { conversationsApi } = await import('@/lib/api');

      const filters = {
        search: searchQuery,
        status: statusFilter === 'all' ? '' : statusFilter,
        priority: priorityFilter === 'all' ? '' : priorityFilter,
      };

      const data = await conversationsApi.getAll(currentPage, pageSize, filters);

      if (data.success && data.data) {
        // Handle both array and paginated response
        const conversationsList = Array.isArray(data.data) ? data.data : ((data.data as any)?.content || []);
        setConversations(conversationsList);
        setTotalCount((data.data as any)?.totalElements || conversationsList.length);
      }
    } catch (error: any) {
      console.error('Failed to load conversations:', error);
      setError(error.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadConversations();
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

  const handleConversationClick = (conversationId: number) => {
    setSelectedConversation(conversationId);
    // TODO: Navigate to conversation detail or open in sidebar
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
                <p className="text-gray-600">Manage WhatsApp conversations and customer interactions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadConversations}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Conversations</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadConversations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FunnelIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search conversations, contacts, or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="all">All Priority</option>
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSearch}
              className="flex-1 bg-whatsapp-600 text-white py-3 px-6 rounded-lg hover:bg-whatsapp-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Search Conversations</span>
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCurrentPage(0);
                setTimeout(loadConversations, 100);
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Conversations ({totalCount})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-whatsapp-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start a new conversation to get started'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors cursor-pointer ${
                      selectedConversation === conversation.id ? 'ring-2 ring-whatsapp-500' : ''
                    }`}
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Contact Avatar */}
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>

                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {conversation.contact.name}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {conversation.unreadCount} unread
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-gray-600 mb-1">
                              {conversation.contact.phoneNumber}
                            </p>

                            {conversation.subject && (
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {conversation.subject}
                              </p>
                            )}

                            <p className="text-sm text-gray-800 truncate mb-3">
                              {conversation.lastMessage.content}
                            </p>
                          </div>

                          {/* Actions */}
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <span className="text-lg">⋮</span>
                          </button>
                        </div>

                        {/* Status and Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                              {conversation.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                              {conversation.priority}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {conversation.assignedAgent && (
                              <div className="flex items-center space-x-1">
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-gray-600">
                                    {conversation.assignedAgent.name.charAt(0)}
                                  </span>
                                </div>
                                <span>{conversation.assignedAgent.name}</span>
                              </div>
                            )}
                            <span>•</span>
                            <span>{formatRelativeTime(conversation.lastMessage.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600">
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} conversations
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm bg-whatsapp-100 text-whatsapp-800 rounded-lg">
                      Page {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
