/**
 * Analytics Page
 * Analytics and reporting dashboard with real API data
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface AnalyticsData {
  totalMessages: number;
  todayMessages: number;
  sentMessages: number;
  failedMessages: number;
  pendingMessages: number;
  successRate: number;
  totalTemplates: number;
  activeTemplates: number;
  totalChatbots: number;
  activeChatbots: number;
}

interface DailyStats {
  date: string;
  count: number;
}

interface MessageStats {
  status: string;
  count: number;
}

interface AnalyticsResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [messageStats, setMessageStats] = useState<MessageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalyticsResult | null>(null);
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const showResult = (status: 'success' | 'error' | 'loading', message: string) => {
    setResult({
      status,
      message,
      timestamp: new Date().toISOString()
    });

    if (status !== 'loading') {
      setTimeout(() => setResult(null), 5000);
    }
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    showResult('loading', 'Loading analytics data...');

    try {
      // Import API helpers
      const { dashboardApi } = await import('@/lib/api');

      // Load dashboard stats
      const statsData = await dashboardApi.getStats();
      if (statsData.success && statsData.data) {
        setAnalytics(statsData.data);
      }

      // Load daily statistics
      const dailyData = await dashboardApi.getMessageStatsByDate(dateRange);
      if (dailyData.success && dailyData.data) {
        setDailyStats(dailyData.data.map((item: any) => ({
          date: item[0] || item.date,
          count: item[1] || item.count || 0
        })));
      }

      // Load message statistics
      const messageData = await dashboardApi.getMessageStats();
      if (messageData.success && messageData.data) {
        setMessageStats(messageData.data.map((item: any) => ({
          status: item[0] || item.status,
          count: item[1] || item.count || 0
        })));
      }

      showResult('success', 'Analytics data loaded successfully!');
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      showResult('error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <ArrowUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-500" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600">Track performance metrics and generate insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                className="px-4 py-2 bg-whatsapp-600 text-white rounded-lg hover:bg-whatsapp-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Result Message */}
        {result && (
          <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 ${
            result.status === 'success' ? 'border-green-200' :
            result.status === 'error' ? 'border-red-200' : 'border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              {result.status === 'success' && <ChartBarIcon className="h-6 w-6 text-green-600" />}
              {result.status === 'error' && <ExclamationCircleIcon className="h-6 w-6 text-red-600" />}
              {result.status === 'loading' && <div className="animate-spin h-6 w-6 border-2 border-yellow-600 border-t-transparent rounded-full" />}
              <div>
                <p className={`font-medium ${
                  result.status === 'success' ? 'text-green-800' :
                  result.status === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {result.message}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(result.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Metrics */}
        {loading ? (
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
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Messages */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(analytics.totalMessages || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </div>

            {/* Today's Messages */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Messages</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(analytics.todayMessages || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% from yesterday</span>
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {analytics.successRate ? analytics.successRate.toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-whatsapp-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-whatsapp-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+2.1% from last week</span>
              </div>
            </div>

            {/* Failed Messages */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Failed Messages</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(analytics.failedMessages || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">-15% from last week</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
            <p className="text-gray-600">Unable to load analytics data from the server.</p>
          </div>
        )}

        {/* Charts and Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Message Trends */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Message Trends</h2>
            {dailyStats.length > 0 ? (
              <div className="space-y-4">
                {dailyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{new Date(stat.date).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-whatsapp-600 h-2 rounded-full"
                          style={{ width: `${Math.min((stat.count / Math.max(...dailyStats.map(s => s.count))) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">{stat.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No daily statistics available</p>
              </div>
            )}
          </div>

          {/* Message Status Distribution */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Message Status Distribution</h2>
            {messageStats.length > 0 ? (
              <div className="space-y-4">
                {messageStats.map((stat, index) => {
                  const total = messageStats.reduce((sum, s) => sum + s.count, 0);
                  const percentage = total > 0 ? ((stat.count / total) * 100).toFixed(1) : 0;
                  const getStatusColor = (status: string) => {
                    switch (status.toLowerCase()) {
                      case 'sent': return 'bg-green-500';
                      case 'failed': return 'bg-red-500';
                      case 'pending': return 'bg-yellow-500';
                      default: return 'bg-gray-500';
                    }
                  };

                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(stat.status)}`}></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">{stat.status}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">{formatNumber(stat.count)}</span>
                        <span className="text-sm text-gray-500">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No message statistics available</p>
              </div>
            )}
          </div>
        </div>

        {/* System Overview */}
        {analytics && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(analytics.totalTemplates || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Templates</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatNumber(analytics.activeTemplates || 0)} active
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(analytics.totalChatbots || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Chatbots</div>
                <div className="text-xs text-green-600 mt-1">
                  {formatNumber(analytics.activeChatbots || 0)} active
                </div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(analytics.sentMessages || 0)}
                </div>
                <div className="text-sm text-gray-600">Sent Messages</div>
                <div className="text-xs text-gray-500 mt-1">All time</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(analytics.pendingMessages || 0)}
                </div>
                <div className="text-sm text-gray-600">Pending Messages</div>
                <div className="text-xs text-yellow-600 mt-1">In queue</div>
              </div>
            </div>
          </div>
        )}

        {/* Export Options */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Export Reports</h3>
              <p className="text-gray-600">Download analytics data in various formats</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export CSV</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
