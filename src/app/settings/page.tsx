/**
 * Settings Page
 * System configuration and health monitoring matching static HTML
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  CogIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SignalIcon,
  PhoneIcon,
  KeyIcon,
  ServerIcon,
  ClockIcon,
  UserIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface SystemSettings {
  whatsappApiUrl: string;
  whatsappApiKey: string;
  whatsappPhoneNumber: string;
  webhookUrl: string;
  maxRetryAttempts: number;
  retryDelaySeconds: number;
  businessHoursEnabled: boolean;
  businessStartTime: string;
  businessEndTime: string;
  businessDays: string[];
  autoReplyEnabled: boolean;
  defaultAutoReply: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface SystemHealth {
  whatsappConnection: 'connected' | 'disconnected' | 'error';
  databaseConnection: 'connected' | 'disconnected' | 'error';
  webhookStatus: 'active' | 'inactive' | 'error';
  lastHealthCheck: string;
  uptime: string;
  totalMessages: number;
  failedMessages: number;
  queueSize: number;
}

interface SettingsResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SettingsResult | null>(null);
  
  // Form states
  const [formSettings, setFormSettings] = useState<SystemSettings>({
    whatsappApiUrl: '',
    whatsappApiKey: '',
    whatsappPhoneNumber: '',
    webhookUrl: '',
    maxRetryAttempts: 3,
    retryDelaySeconds: 30,
    businessHoursEnabled: false,
    businessStartTime: '09:00',
    businessEndTime: '18:00',
    businessDays: [],
    autoReplyEnabled: false,
    defaultAutoReply: '',
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    loadSettings();
    loadSystemHealth();
    // Auto-refresh health every 30 seconds
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const loadSettings = async () => {
    try {
      // Import API helpers
      const { settingsApi } = await import('@/lib/api');

      const data = await settingsApi.get();
      if (data.success && data.data) {
        setSettings(data.data);
        setFormSettings(data.data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadSystemHealth = async () => {
    try {
      // Import API helpers
      const { settingsApi } = await import('@/lib/api');

      const data = await settingsApi.getHealth();
      if (data.success && data.data) {
        setHealth(data.data);
      }
    } catch (error) {
      console.error('Failed to load system health:', error);
    }
  };

  const saveSettings = async () => {
    showResult('loading', 'Saving settings...');

    try {
      // Import API helpers
      const { settingsApi } = await import('@/lib/api');

      const data = await settingsApi.update(formSettings);

      if (data.success) {
        showResult('success', 'Settings saved successfully!');
        setSettings(formSettings);
      } else {
        showResult('error', `Failed to save settings: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const testConnection = async () => {
    showResult('loading', 'Testing WhatsApp connection...');

    try {
      const response = await fetch('/api/v1/settings/test-connection', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        showResult('success', 'WhatsApp connection test successful!');
        loadSystemHealth();
      } else {
        showResult('error', `Connection test failed: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const handleBusinessDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setFormSettings(prev => ({
        ...prev,
        businessDays: [...prev.businessDays, day]
      }));
    } else {
      setFormSettings(prev => ({
        ...prev,
        businessDays: prev.businessDays.filter(d => d !== day)
      }));
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
      case 'inactive':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <CogIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
              <p className="text-gray-600">Configure WhatsApp CRM system settings and monitor health</p>
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
              {result.status === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
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

        {/* System Health */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <ServerIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
            </div>
            <button
              onClick={loadSystemHealth}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          {health && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getHealthStatusColor(health.whatsappConnection)}`}>
                  <SignalIcon className="h-4 w-4 mr-1" />
                  {health.whatsappConnection}
                </div>
                <div className="text-sm text-gray-600">WhatsApp API</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getHealthStatusColor(health.databaseConnection)}`}>
                  <ServerIcon className="h-4 w-4 mr-1" />
                  {health.databaseConnection}
                </div>
                <div className="text-sm text-gray-600">Database</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getHealthStatusColor(health.webhookStatus)}`}>
                  <KeyIcon className="h-4 w-4 mr-1" />
                  {health.webhookStatus}
                </div>
                <div className="text-sm text-gray-600">Webhook</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="text-lg font-bold text-gray-900 mb-1">{health.uptime}</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-4">
            <button
              onClick={testConnection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Connection
            </button>
            {health && (
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                Last check: {formatTime(health.lastHealthCheck)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp Configuration */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <PhoneIcon className="h-6 w-6 text-whatsapp-600" />
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp Configuration</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API URL
                </label>
                <input
                  type="text"
                  value={formSettings.whatsappApiUrl}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, whatsappApiUrl: e.target.value }))}
                  placeholder="https://graph.facebook.com/v18.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={formSettings.whatsappApiKey}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, whatsappApiKey: e.target.value }))}
                  placeholder="Enter your WhatsApp API key"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formSettings.whatsappPhoneNumber}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, whatsappPhoneNumber: e.target.value }))}
                  placeholder="1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={formSettings.webhookUrl}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://your-domain.com/webhook"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <CogIcon className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Configuration</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Retry Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formSettings.maxRetryAttempts}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, maxRetryAttempts: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retry Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={formSettings.retryDelaySeconds}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, retryDelaySeconds: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="autoReply"
                    checked={formSettings.autoReplyEnabled}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, autoReplyEnabled: e.target.checked }))}
                    className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500"
                  />
                  <label htmlFor="autoReply" className="text-sm font-medium text-gray-700">
                    Enable Auto Reply
                  </label>
                </div>

                {formSettings.autoReplyEnabled && (
                  <textarea
                    value={formSettings.defaultAutoReply}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, defaultAutoReply: e.target.value }))}
                    placeholder="Enter default auto-reply message"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="businessHours"
                    checked={formSettings.businessHoursEnabled}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, businessHoursEnabled: e.target.checked }))}
                    className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500"
                  />
                  <label htmlFor="businessHours" className="text-sm font-medium text-gray-700">
                    Enable Business Hours
                  </label>
                </div>

                {formSettings.businessHoursEnabled && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formSettings.businessStartTime}
                          onChange={(e) => setFormSettings(prev => ({ ...prev, businessStartTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formSettings.businessEndTime}
                          onChange={(e) => setFormSettings(prev => ({ ...prev, businessEndTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Days
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                          <div key={day} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`day-${day}`}
                              checked={formSettings.businessDays.includes(day)}
                              onChange={(e) => handleBusinessDayChange(day, e.target.checked)}
                              className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500"
                            />
                            <label htmlFor={`day-${day}`} className="text-sm text-gray-700">
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BellIcon className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="notifications"
                checked={formSettings.notificationsEnabled}
                onChange={(e) => setFormSettings(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500"
              />
              <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={formSettings.emailNotifications}
                onChange={(e) => setFormSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                disabled={!formSettings.notificationsEnabled}
                className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500 disabled:opacity-50"
              />
              <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
                Email Notifications
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="smsNotifications"
                checked={formSettings.smsNotifications}
                onChange={(e) => setFormSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                disabled={!formSettings.notificationsEnabled}
                className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500 disabled:opacity-50"
              />
              <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-700">
                SMS Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Save Settings */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Save Configuration</h3>
              <p className="text-gray-600">Apply all changes to the system settings</p>
            </div>
            <button
              onClick={saveSettings}
              disabled={loading}
              className="px-8 py-3 bg-whatsapp-600 text-white rounded-lg hover:bg-whatsapp-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
