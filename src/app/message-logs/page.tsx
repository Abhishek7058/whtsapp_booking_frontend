/**
 * Message Logs Page
 * Message history and search functionality matching static HTML
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface MessageLog {
  id: number;
  phoneNumber: string;
  messageContent: string;
  templateName?: string;
  templateId?: number;
  status: 'SENT' | 'FAILED' | 'PENDING';
  sentAt: string;
  errorMessage?: string;
  whatsappMessageId?: string;
  batchId?: string;
}

interface SearchFilters {
  phoneNumber: string;
  status: string;
  templateId: string;
  dateFrom: string;
  dateTo: string;
  batchId: string;
}

export default function MessageLogsPage() {
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  
  // Search filters
  const [filters, setFilters] = useState<SearchFilters>({
    phoneNumber: '',
    status: '',
    templateId: '',
    dateFrom: '',
    dateTo: '',
    batchId: ''
  });

  useEffect(() => {
    loadTemplates();
    searchMessageLogs();
  }, [currentPage]);

  const loadTemplates = async () => {
    try {
      // Import API helpers
      const { templatesApi } = await import('@/lib/api');

      const data = await templatesApi.getActive();
      if (data.success && data.data) {
        setTemplates(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const searchMessageLogs = async () => {
    setLoading(true);

    try {
      // Import API helpers
      const { dashboardApi } = await import('@/lib/api');

      const data = await dashboardApi.getRecentMessages(currentPage, pageSize);

      if (data.success && data.data) {
        // Handle both array and paginated response
        const messagesList = Array.isArray(data.data) ? data.data : ((data.data as any)?.content || []);
        setMessageLogs(messagesList);
        setTotalCount((data.data as any)?.totalElements || messagesList.length);
      }
    } catch (error) {
      console.error('Failed to load message logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setCurrentPage(0);
    searchMessageLogs();
  };

  const clearFilters = () => {
    setFilters({
      phoneNumber: '',
      status: '',
      templateId: '',
      dateFrom: '',
      dateTo: '',
      batchId: ''
    });
    setCurrentPage(0);
    setTimeout(searchMessageLogs, 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ExclamationCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Message Logs</h1>
              <p className="text-gray-600">Search and view WhatsApp message history</p>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FunnelIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Search Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="text"
                value={filters.phoneNumber}
                onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                Template
              </label>
              <select
                value={filters.templateId}
                onChange={(e) => handleFilterChange('templateId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="">All Templates</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch ID
              </label>
              <input
                type="text"
                value={filters.batchId}
                onChange={(e) => handleFilterChange('batchId', e.target.value)}
                placeholder="Enter batch ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSearch}
              className="flex-1 bg-whatsapp-600 text-white py-3 px-6 rounded-lg hover:bg-whatsapp-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Search Messages</span>
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Message Logs */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Message History ({totalCount} messages)
            </h2>
            <button
              onClick={searchMessageLogs}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-whatsapp-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading message logs...</p>
            </div>
          ) : messageLogs.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {messageLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-6 rounded-xl border-l-4 ${
                      log.status === 'SENT' ? 'border-green-500 bg-green-50' :
                      log.status === 'FAILED' ? 'border-red-500 bg-red-50' :
                      'border-yellow-500 bg-yellow-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(log.status)}
                          <div className="flex items-center space-x-2">
                            <PhoneIcon className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">{log.phoneNumber}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>{formatTime(log.sentAt)}</span>
                          </div>
                          {log.templateName && (
                            <div className="flex items-center space-x-1">
                              <DocumentTextIcon className="h-4 w-4" />
                              <span>Template: {log.templateName}</span>
                            </div>
                          )}
                          {log.batchId && (
                            <div className="flex items-center space-x-1">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                Batch: {log.batchId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Message Content:</h5>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">
                        {log.messageContent}
                      </div>
                    </div>

                    {log.errorMessage && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                          <h5 className="text-sm font-medium text-red-800">Error Details:</h5>
                        </div>
                        <div className="text-sm text-red-700">
                          {log.errorMessage}
                        </div>
                      </div>
                    )}

                    {log.whatsappMessageId && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">WhatsApp Message ID:</span>
                          <code className="text-xs text-blue-700 bg-white px-2 py-1 rounded">
                            {log.whatsappMessageId}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-gray-600">
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} messages
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
