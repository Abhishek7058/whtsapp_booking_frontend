/**
 * Bulk Messaging Page
 * Mass messaging functionality matching static HTML
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  UsersIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: number;
  name: string;
  content: string;
  parameters: string[];
}

interface BulkMessageResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
  details?: any;
}

interface BulkCampaign {
  id: number;
  name: string;
  templateName: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export default function BulkMessagingPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [campaigns, setCampaigns] = useState<BulkCampaign[]>([]);
  const [loading] = useState(false);
  const [result, setResult] = useState<BulkMessageResult | null>(null);
  
  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [templateParams, setTemplateParams] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [messageType, setMessageType] = useState<'template' | 'custom'>('template');

  useEffect(() => {
    loadTemplates();
    loadCampaigns();
  }, []);

  const showResult = (status: 'success' | 'error' | 'loading', message: string, details?: any) => {
    setResult({
      status,
      message,
      timestamp: new Date().toISOString(),
      details
    });

    if (status !== 'loading') {
      setTimeout(() => setResult(null), 8000);
    }
  };

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
      showResult('error', 'Failed to load templates from server');
    }
  };

  const loadCampaigns = async () => {
    try {
      // Import API helpers
      const { messagesApi } = await import('@/lib/api');

      const data = await messagesApi.getBulkCampaigns();
      if (data.success && data.data) {
        setCampaigns(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      showResult('error', 'Failed to load campaigns from server');
    }
  };

  const validatePhoneNumbers = (numbers: string) => {
    const phoneList = numbers.split('\n').map(n => n.trim()).filter(n => n);
    const invalidNumbers = phoneList.filter(n => !/^\d{10,15}$/.test(n));
    return { phoneList, invalidNumbers };
  };

  const sendBulkMessages = async () => {
    if (!campaignName) {
      showResult('error', 'Please enter a campaign name');
      return;
    }

    if (!phoneNumbers.trim()) {
      showResult('error', 'Please enter phone numbers');
      return;
    }

    const { phoneList, invalidNumbers } = validatePhoneNumbers(phoneNumbers);
    
    if (invalidNumbers.length > 0) {
      showResult('error', `Invalid phone numbers found: ${invalidNumbers.join(', ')}`);
      return;
    }

    if (messageType === 'template' && !selectedTemplate) {
      showResult('error', 'Please select a template');
      return;
    }

    if (messageType === 'custom' && !customMessage.trim()) {
      showResult('error', 'Please enter a custom message');
      return;
    }

    showResult('loading', 'Starting bulk message campaign...');

    let requestData;
    
    if (messageType === 'template') {
      let templateParameters = {};
      if (templateParams.trim()) {
        try {
          templateParameters = JSON.parse(templateParams);
        } catch (e) {
          showResult('error', 'Invalid JSON in template parameters');
          return;
        }
      }

      requestData = {
        phoneNumbers: phoneList,
        messageType: 'TEMPLATE',
        templateId: parseInt(selectedTemplate),
        templateParameters,
        batchName: campaignName
      };
    } else {
      requestData = {
        phoneNumbers: phoneList,
        messageType: 'CUSTOM_TEXT',
        customMessage,
        batchName: campaignName
      };
    }

    try {
      // Import API helpers
      const { messagesApi } = await import('@/lib/api');

      const data = await messagesApi.sendBulk(requestData);

      if (data.success) {
        showResult('success', `Bulk campaign started successfully! Processing ${phoneList.length} messages.`, data.data);
        clearForm();
        loadCampaigns();
      } else {
        showResult('error', `Failed to start bulk campaign: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const clearForm = () => {
    setCampaignName('');
    setSelectedTemplate('');
    setPhoneNumbers('');
    setTemplateParams('');
    setCustomMessage('');
    setMessageType('template');
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.id.toString() === selectedTemplate);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRate = (campaign: BulkCampaign) => {
    if (campaign.totalRecipients === 0) return 0;
    return Math.round((campaign.sentCount / campaign.totalRecipients) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bulk Messaging</h1>
              <p className="text-gray-600">Send WhatsApp messages to multiple recipients</p>
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
              <div className="flex-1">
                <p className={`font-medium ${
                  result.status === 'success' ? 'text-green-800' :
                  result.status === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {result.message}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(result.timestamp)}
                </p>
                {result.details && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Batch ID: {result.details.batchId}</p>
                    <p>Total Recipients: {result.details.totalRecipients}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Messaging Form */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <PaperAirplaneIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Bulk Campaign</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Enter campaign name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Numbers
              </label>
              <textarea
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(e.target.value)}
                placeholder="Enter phone numbers (one per line)&#10;1234567890&#10;9876543210&#10;5555555555"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter one phone number per line (10-15 digits only)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Message Type
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="template"
                    name="messageType"
                    value="template"
                    checked={messageType === 'template'}
                    onChange={(e) => setMessageType(e.target.value as 'template' | 'custom')}
                    className="text-whatsapp-600 focus:ring-whatsapp-500"
                  />
                  <label htmlFor="template" className="ml-2 text-sm text-gray-700">
                    Use Template
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="custom"
                    name="messageType"
                    value="custom"
                    checked={messageType === 'custom'}
                    onChange={(e) => setMessageType(e.target.value as 'template' | 'custom')}
                    className="text-whatsapp-600 focus:ring-whatsapp-500"
                  />
                  <label htmlFor="custom" className="ml-2 text-sm text-gray-700">
                    Custom Message
                  </label>
                </div>
              </div>
            </div>

            {messageType === 'template' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Template
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                  >
                    <option value="">Select a template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {getSelectedTemplate() && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Template Preview:</h4>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap mb-3">
                      {getSelectedTemplate()?.content}
                    </div>
                    {(() => {
                      const selectedTemplate = getSelectedTemplate();
                      return selectedTemplate?.parameters && selectedTemplate.parameters.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">
                            Parameters: {selectedTemplate.parameters.join(', ')}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {(() => {
                  const selectedTemplate = getSelectedTemplate();
                  return selectedTemplate?.parameters && selectedTemplate.parameters.length > 0;
                })() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Parameters (JSON)
                    </label>
                    <textarea
                      value={templateParams}
                      onChange={(e) => setTemplateParams(e.target.value)}
                      placeholder={`{"${getSelectedTemplate()?.parameters.join('": "value", "')}"": "value"}`}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none font-mono text-sm"
                    />
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter your custom message here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none"
                />
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={sendBulkMessages}
                disabled={loading}
                className="flex-1 bg-whatsapp-600 text-white py-3 px-6 rounded-lg hover:bg-whatsapp-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>{loading ? 'Sending...' : 'Send Bulk Messages'}</span>
              </button>
              <button
                onClick={clearForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Campaign History */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Campaign History</h2>
            <button
              onClick={loadCampaigns}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600">Create your first bulk campaign to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{campaign.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">Template: {campaign.templateName}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {formatTime(campaign.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{campaign.totalRecipients}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{campaign.sentCount}</div>
                      <div className="text-sm text-gray-600">Sent</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{campaign.failedCount}</div>
                      <div className="text-sm text-gray-600">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{getSuccessRate(campaign)}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                  </div>

                  {campaign.status === 'PROCESSING' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(campaign.sentCount / campaign.totalRecipients) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
