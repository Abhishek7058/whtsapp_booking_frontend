/**
 * Send Messages Page
 * Matches the static HTML messaging functionality exactly
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  PaperAirplaneIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  parameters: string[];
}

interface MessageResult {
  status: 'success' | 'error' | 'sending';
  message: string;
  timestamp: string;
}

export default function MessagesPage() {
  const [quickPhone, setQuickPhone] = useState('');
  const [quickMessage, setQuickMessage] = useState('');
  const [templatePhone, setTemplatePhone] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateParams, setTemplateParams] = useState('');
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [useJsonMode, setUseJsonMode] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [messageResult, setMessageResult] = useState<MessageResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // Import API helpers
      const { templatesApi } = await import('@/lib/api');

      const data = await templatesApi.getActive();
      if (data.success && data.data) {
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      showResult('error', 'Failed to load templates from server');
    }
  };

  const validatePhoneNumber = (phone: string) => {
    return /^\d{10,15}$/.test(phone);
  };

  const showResult = (status: 'success' | 'error' | 'sending', message: string) => {
    setMessageResult({
      status,
      message,
      timestamp: new Date().toISOString()
    });

    if (status !== 'sending') {
      setTimeout(() => setMessageResult(null), 5000);
    }
  };

  const sendQuickMessage = async () => {
    if (!quickPhone || !quickMessage) {
      showResult('error', 'Please fill in phone number and message');
      return;
    }

    if (!validatePhoneNumber(quickPhone)) {
      showResult('error', 'Phone number must be 10-15 digits only');
      return;
    }

    setLoading(true);
    showResult('sending', 'Sending message...');

    try {
      // Import API helpers
      const { messagesApi } = await import('@/lib/api');

      const data = await messagesApi.sendText(quickPhone, quickMessage);

      if (data.success) {
        showResult('success', 'Message sent successfully!');
        setQuickPhone('');
        setQuickMessage('');
      } else {
        showResult('error', `Failed to send message: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTemplateMessage = async () => {
    if (!templatePhone || !selectedTemplate) {
      showResult('error', 'Please fill in phone number and select template');
      return;
    }

    if (!validatePhoneNumber(templatePhone)) {
      showResult('error', 'Phone number must be 10-15 digits only');
      return;
    }

    let parameters = {};

    if (useJsonMode) {
      // Use JSON mode
      if (templateParams.trim()) {
        try {
          parameters = JSON.parse(templateParams);
        } catch (e) {
          showResult('error', 'Invalid JSON in template parameters');
          return;
        }
      }
    } else {
      // Use individual parameter fields
      const selectedTemplateObj = getSelectedTemplate();
      if (selectedTemplateObj && selectedTemplateObj.parameters.length > 0) {
        parameters = { ...parameterValues };

        // Validate all required parameters are filled
        for (const param of selectedTemplateObj.parameters) {
          if (!parameters[param] || parameters[param].trim() === '') {
            showResult('error', `Please fill in the "${param}" parameter`);
            return;
          }
        }
      }
    }

    setLoading(true);
    showResult('sending', 'Sending template message...');

    try {
      // Import API helpers
      const { messagesApi } = await import('@/lib/api');

      const data = await messagesApi.sendTemplate(templatePhone, parseInt(selectedTemplate));

      if (data.success) {
        showResult('success', 'Template message sent successfully!');
        setTemplatePhone('');
        setTemplateParams('');
        setParameterValues({});
      } else {
        showResult('error', `Failed to send template message: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.id.toString() === selectedTemplate);
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameterValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setParameterValues({}); // Clear parameter values when template changes
    setTemplateParams(''); // Clear JSON params
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-whatsapp-100 rounded-xl flex items-center justify-center">
              <PaperAirplaneIcon className="h-6 w-6 text-whatsapp-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Send Messages</h1>
              <p className="text-gray-600">Send WhatsApp messages to your customers</p>
            </div>
          </div>
        </div>

        {/* Message Result */}
        {messageResult && (
          <div className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 ${
            messageResult.status === 'success' ? 'border-green-200' : 
            messageResult.status === 'error' ? 'border-red-200' : 'border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              {messageResult.status === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
              {messageResult.status === 'error' && <ExclamationCircleIcon className="h-6 w-6 text-red-600" />}
              {messageResult.status === 'sending' && <div className="animate-spin h-6 w-6 border-2 border-yellow-600 border-t-transparent rounded-full" />}
              <div>
                <p className={`font-medium ${
                  messageResult.status === 'success' ? 'text-green-800' :
                  messageResult.status === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {messageResult.message}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTime(messageResult.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Message */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Quick Message</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  placeholder="1234567890 (10-15 digits)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={quickMessage}
                  onChange={(e) => setQuickMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none"
                />
              </div>

              <button
                onClick={sendQuickMessage}
                disabled={loading}
                className="w-full bg-whatsapp-600 text-white py-3 px-6 rounded-lg hover:bg-whatsapp-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </div>

          {/* Template Message */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Template Message</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={templatePhone}
                  onChange={(e) => setTemplatePhone(e.target.value)}
                  placeholder="1234567890 (10-15 digits)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
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

              {/* Template Preview */}
              {getSelectedTemplate() && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Template Preview:</h4>
                  <p className="text-sm text-gray-600">{getSelectedTemplate()?.content}</p>
                  {getSelectedTemplate()?.parameters.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Parameters: {getSelectedTemplate()?.parameters.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Template Parameters */}
              {getSelectedTemplate()?.parameters.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Template Parameters
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Mode:</span>
                      <button
                        type="button"
                        onClick={() => setUseJsonMode(false)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          !useJsonMode
                            ? 'bg-whatsapp-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Individual Fields
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseJsonMode(true)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors ${
                          useJsonMode
                            ? 'bg-whatsapp-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        JSON
                      </button>
                    </div>
                  </div>

                  {useJsonMode ? (
                    <div>
                      <textarea
                        value={templateParams}
                        onChange={(e) => setTemplateParams(e.target.value)}
                        placeholder={`{\n  "${getSelectedTemplate()?.parameters[0] || 'parameter'}": "value",\n  "${getSelectedTemplate()?.parameters[1] || 'parameter2'}": "value2"\n}`}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter parameters as JSON object. Required parameters: {getSelectedTemplate()?.parameters.join(', ')}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getSelectedTemplate()?.parameters.map((param) => (
                        <div key={param}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {param} *
                          </label>
                          <input
                            type="text"
                            value={parameterValues[param] || ''}
                            onChange={(e) => handleParameterChange(param, e.target.value)}
                            placeholder={`Enter ${param}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={sendTemplateMessage}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>{loading ? 'Sending...' : 'Send Template'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
