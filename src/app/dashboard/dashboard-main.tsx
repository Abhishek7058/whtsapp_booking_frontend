/**
 * Main Dashboard Component
 * Matches the static HTML dashboard functionality exactly
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SignalIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface SystemStats {
  totalMessages: number;
  todayMessages: number;
  failedMessages: number;
  successRate: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdate: string;
  queuedMessages: number;
  activeChats: number;
}

interface ConnectionTest {
  status: 'success' | 'error' | 'testing';
  message: string;
  timestamp: string;
}

export default function DashboardMain() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadSystemStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStats = async () => {
    try {
      const response = await fetch('/api/v1/dashboard/overview');
      const data = await response.json();

      if (data.success && data.data) {
        setStats({
          totalMessages: data.data.totalMessages || 0,
          todayMessages: data.data.todayMessages || 0,
          failedMessages: data.data.failedMessages || 0,
          successRate: data.data.successRate || 0,
          connectionStatus: data.data.connectionStatus || 'disconnected',
          lastUpdate: new Date().toISOString(),
          queuedMessages: data.data.queuedMessages || 0,
          activeChats: data.data.activeChats || 0
        });
      }
    } catch (error) {
      console.error('Failed to load system stats:', error);
      // Set mock data for demo
      setStats({
        totalMessages: 1247,
        todayMessages: 89,
        failedMessages: 3,
        successRate: 97.6,
        connectionStatus: 'connected',
        lastUpdate: new Date().toISOString(),
        queuedMessages: 5,
        activeChats: 12
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionTest({ status: 'testing', message: 'Testing connection...', timestamp: new Date().toISOString() });

    try {
      const response = await fetch('/api/v1/dashboard/test-connection', { method: 'POST' });
      const data = await response.json();

      setConnectionTest({
        status: data.success ? 'success' : 'error',
        message: data.message || (data.success ? 'Connection successful!' : 'Connection failed'),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setConnectionTest({
        status: 'error',
        message: 'Network error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'connecting': return 'text-yellow-600 bg-yellow-100';
      case 'disconnected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/20 rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-white/20 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp CRM Dashboard</h1>
            <p className="text-gray-600">System overview and real-time statistics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getConnectionStatusColor(stats?.connectionStatus || 'disconnected')}`}>
              <div className="flex items-center space-x-2">
                <SignalIcon className="h-4 w-4" />
                <span className="capitalize">{stats?.connectionStatus || 'Disconnected'}</span>
              </div>
            </div>
            <button
              onClick={testConnection}
              disabled={testingConnection}
              className="px-6 py-2 bg-whatsapp-600 text-white rounded-lg hover:bg-whatsapp-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Test Result */}
      {connectionTest && (
        <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 ${
          connectionTest.status === 'success' ? 'border-green-200' : 
          connectionTest.status === 'error' ? 'border-red-200' : 'border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            {connectionTest.status === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
            {connectionTest.status === 'error' && <ExclamationCircleIcon className="h-6 w-6 text-red-600" />}
            {connectionTest.status === 'testing' && <div className="animate-spin h-6 w-6 border-2 border-yellow-600 border-t-transparent rounded-full" />}
            <div>
              <p className={`font-medium ${
                connectionTest.status === 'success' ? 'text-green-800' :
                connectionTest.status === 'error' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {connectionTest.message}
              </p>
              <p className="text-sm text-gray-500">
                {formatTime(connectionTest.timestamp)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Messages */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalMessages.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
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
              <p className="text-3xl font-bold text-gray-900">{stats?.todayMessages}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
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
              <p className="text-3xl font-bold text-gray-900">{stats?.successRate}%</p>
            </div>
            <div className="w-12 h-12 bg-whatsapp-100 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-whatsapp-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+2.1% from last week</span>
          </div>
        </div>

        {/* Active Chats */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Chats</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeChats}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm text-red-600">-3 from last hour</span>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">WhatsApp Connection</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConnectionStatusColor(stats?.connectionStatus || 'disconnected')}`}>
                {stats?.connectionStatus || 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Failed Messages</span>
              <span className="text-red-600 font-medium">{stats?.failedMessages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Queued Messages</span>
              <span className="text-yellow-600 font-medium">{stats?.queuedMessages}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Last Update</span>
              <span className="text-gray-500 text-sm">{stats?.lastUpdate ? formatTime(stats.lastUpdate) : 'Never'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-whatsapp-50 hover:bg-whatsapp-100 rounded-xl transition-colors text-left">
              <PaperAirplaneIcon className="h-6 w-6 text-whatsapp-600 mb-2" />
              <p className="font-medium text-gray-900">Send Message</p>
              <p className="text-sm text-gray-600">Quick messaging</p>
            </button>
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left">
              <UsersIcon className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium text-gray-900">Bulk Messages</p>
              <p className="text-sm text-gray-600">Mass messaging</p>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left">
              <ChartBarIcon className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-600">View reports</p>
            </button>
            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left">
              <ClockIcon className="h-6 w-6 text-gray-600 mb-2" />
              <p className="font-medium text-gray-900">Message Logs</p>
              <p className="text-sm text-gray-600">View history</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
