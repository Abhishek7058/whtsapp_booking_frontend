/**
 * Auto-Reply Bot (Chatbot) Management Page
 * Complete chatbot management functionality matching static HTML
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  CogIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface ChatBot {
  id: number;
  name: string;
  description?: string;
  botType: 'WELCOME_MESSAGE' | 'AUTO_REPLY' | 'BUSINESS_HOURS' | 'FAQ_BOT' | 'KEYWORD_BASED';
  triggerKeywords?: string;
  customResponse: string;
  priority: number;
  businessHoursEnabled: boolean;
  businessStartTime?: string;
  businessEndTime?: string;
  businessDays?: string;
  outOfHoursResponse?: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalTriggers?: number;
  createdAt: string;
  updatedAt: string;
}

interface BotResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
}

export default function ChatbotPage() {
  const [chatbots, setChatbots] = useState<ChatBot[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BotResult | null>(null);
  const [editingBotId, setEditingBotId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [botType, setBotType] = useState<ChatBot['botType']>('AUTO_REPLY');
  const [triggerKeywords, setTriggerKeywords] = useState('');
  const [customResponse, setCustomResponse] = useState('');
  const [botPriority, setBotPriority] = useState(1);
  const [businessHoursEnabled, setBusinessHoursEnabled] = useState(false);
  const [businessStartTime, setBusinessStartTime] = useState('09:00');
  const [businessEndTime, setBusinessEndTime] = useState('18:00');
  const [outOfHoursResponse, setOutOfHoursResponse] = useState('');
  const [businessDays, setBusinessDays] = useState<string[]>([]);

  // Test states
  const [testBotId, setTestBotId] = useState('');
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    loadChatBots();
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

  const loadChatBots = async () => {
    try {
      setLoading(true);
      // Import API helpers
      const { chatbotsApi } = await import('@/lib/api');

      const data = await chatbotsApi.getAll();
      if (data.success && data.data) {
        // Handle both array and paginated response
        const botsList = Array.isArray(data.data) ? data.data : (data.data.content || []);
        setChatbots(botsList);
      }
    } catch (error) {
      console.error('Failed to load chatbots:', error);
      showResult('error', 'Failed to load chatbots from server');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateChatBot = async () => {
    if (!botName || !customResponse) {
      showResult('error', 'Please enter bot name and response message');
      return;
    }

    if ((botType === 'KEYWORD_BASED' || botType === 'FAQ_BOT') && !triggerKeywords) {
      showResult('error', 'Please enter trigger keywords for this bot type');
      return;
    }

    const action = isEditMode ? 'Updating' : 'Creating';
    showResult('loading', `${action} chatbot...`);

    const chatBotData = {
      name: botName,
      description: botDescription || 'Auto-reply bot',
      botType: botType,
      triggerKeywords: triggerKeywords || null,
      customResponse: customResponse,
      priority: botPriority,
      businessHoursEnabled: businessHoursEnabled,
      businessStartTime: businessHoursEnabled ? businessStartTime : null,
      businessEndTime: businessHoursEnabled ? businessEndTime : null,
      businessDays: businessHoursEnabled ? businessDays.join(',') : null,
      outOfHoursResponse: businessHoursEnabled ? outOfHoursResponse : null,
      status: 'ACTIVE'
    };

    try {
      // Import API helpers
      const { chatbotsApi } = await import('@/lib/api');

      let data;
      if (isEditMode && editingBotId) {
        data = await chatbotsApi.update(editingBotId, chatBotData);
      } else {
        data = await chatbotsApi.create(chatBotData);
      }

      if (data.success) {
        showResult('success', `Chatbot ${isEditMode ? 'updated' : 'created'} successfully!`);
        clearForm();
        loadChatBots();
      } else {
        showResult('error', `Failed to ${isEditMode ? 'update' : 'create'} chatbot: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const toggleBotStatus = async (botId: number) => {
    try {
      // Import API helpers
      const { chatbotsApi } = await import('@/lib/api');

      const data = await chatbotsApi.toggle(botId);

      if (data.success) {
        showResult('success', 'Bot status updated successfully!');
        loadChatBots();
      } else {
        showResult('error', `Failed to update bot status: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const deleteChatBot = async (botId: number) => {
    if (!confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return;
    }

    try {
      // Import API helpers
      const { chatbotsApi } = await import('@/lib/api');

      const data = await chatbotsApi.delete(botId);

      if (data.success) {
        showResult('success', 'Chatbot deleted successfully!');
        loadChatBots();
      } else {
        showResult('error', `Failed to delete chatbot: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const testChatBot = async () => {
    if (!testBotId || !testPhoneNumber || !testMessage) {
      showResult('error', 'Please fill in all test fields');
      return;
    }

    if (!/^\d{10,15}$/.test(testPhoneNumber)) {
      showResult('error', 'Phone number must be 10-15 digits only');
      return;
    }

    try {
      // Import API helpers
      const { chatbotsApi } = await import('@/lib/api');

      const data = await chatbotsApi.trigger(parseInt(testBotId), testPhoneNumber, testMessage);

      if (data.success) {
        showResult('success', 'Chatbot test completed! Check your WhatsApp for the response.');
      } else {
        showResult('error', `Failed to test chatbot: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const editChatBot = (bot: ChatBot) => {
    setBotName(bot.name);
    setBotDescription(bot.description || '');
    setBotType(bot.botType);
    setTriggerKeywords(bot.triggerKeywords || '');
    setCustomResponse(bot.customResponse);
    setBotPriority(bot.priority);
    setBusinessHoursEnabled(bot.businessHoursEnabled);
    setBusinessStartTime(bot.businessStartTime || '09:00');
    setBusinessEndTime(bot.businessEndTime || '18:00');
    setOutOfHoursResponse(bot.outOfHoursResponse || '');
    setBusinessDays(bot.businessDays ? bot.businessDays.split(',') : []);
    setEditingBotId(bot.id);
    setIsEditMode(true);
    showResult('success', 'Bot data loaded for editing. Modify and click "Update Bot" to save changes.');
  };

  const clearForm = () => {
    setBotName('');
    setBotDescription('');
    setBotType('AUTO_REPLY');
    setTriggerKeywords('');
    setCustomResponse('');
    setBotPriority(1);
    setBusinessHoursEnabled(false);
    setBusinessStartTime('09:00');
    setBusinessEndTime('18:00');
    setOutOfHoursResponse('');
    setBusinessDays([]);
    setEditingBotId(null);
    setIsEditMode(false);
  };

  const handleBusinessDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setBusinessDays([...businessDays, day]);
    } else {
      setBusinessDays(businessDays.filter(d => d !== day));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getBotTypeLabel = (type: string) => {
    switch (type) {
      case 'WELCOME_MESSAGE': return 'Welcome Message';
      case 'AUTO_REPLY': return 'Auto Reply';
      case 'BUSINESS_HOURS': return 'Business Hours';
      case 'FAQ_BOT': return 'FAQ Bot';
      case 'KEYWORD_BASED': return 'Keyword Based';
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Auto-Reply Bot Management</h1>
              <p className="text-gray-600">Create and manage automated WhatsApp chatbots</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create/Edit Bot */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              {isEditMode ? (
                <PencilIcon className="h-6 w-6 text-blue-600" />
              ) : (
                <PlusIcon className="h-6 w-6 text-green-600" />
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Chatbot' : 'Create Chatbot'}
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Enter bot name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={botDescription}
                  onChange={(e) => setBotDescription(e.target.value)}
                  placeholder="Brief description of the bot"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Type
                </label>
                <select
                  value={botType}
                  onChange={(e) => setBotType(e.target.value as ChatBot['botType'])}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                >
                  <option value="AUTO_REPLY">Auto Reply</option>
                  <option value="WELCOME_MESSAGE">Welcome Message</option>
                  <option value="BUSINESS_HOURS">Business Hours</option>
                  <option value="FAQ_BOT">FAQ Bot</option>
                  <option value="KEYWORD_BASED">Keyword Based</option>
                </select>
              </div>

              {(botType === 'KEYWORD_BASED' || botType === 'FAQ_BOT') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trigger Keywords
                  </label>
                  <input
                    type="text"
                    value={triggerKeywords}
                    onChange={(e) => setTriggerKeywords(e.target.value)}
                    placeholder="hello, hi, help, support, faq, question"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                  />
                  <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto Response
                </label>
                <textarea
                  value={customResponse}
                  onChange={(e) => setCustomResponse(e.target.value)}
                  placeholder="Enter the automated response message"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={botPriority}
                  onChange={(e) => setBotPriority(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              {/* Business Hours */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="businessHours"
                    checked={businessHoursEnabled}
                    onChange={(e) => setBusinessHoursEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500"
                  />
                  <label htmlFor="businessHours" className="text-sm font-medium text-gray-700">
                    Enable Business Hours
                  </label>
                </div>

                {businessHoursEnabled && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={businessStartTime}
                          onChange={(e) => setBusinessStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={businessEndTime}
                          onChange={(e) => setBusinessEndTime(e.target.value)}
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
                              id={day}
                              checked={businessDays.includes(day)}
                              onChange={(e) => handleBusinessDayChange(day, e.target.checked)}
                              className="rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500"
                            />
                            <label htmlFor={day} className="text-sm text-gray-700">
                              {day}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Out of Hours Response
                      </label>
                      <textarea
                        value={outOfHoursResponse}
                        onChange={(e) => setOutOfHoursResponse(e.target.value)}
                        placeholder="Message to send outside business hours"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={createOrUpdateChatBot}
                  disabled={loading}
                  className={`flex-1 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                    isEditMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-whatsapp-600 hover:bg-whatsapp-700'
                  }`}
                >
                  {isEditMode ? (
                    <PencilIcon className="h-5 w-5" />
                  ) : (
                    <PlusIcon className="h-5 w-5" />
                  )}
                  <span>
                    {loading
                      ? (isEditMode ? 'Updating...' : 'Creating...')
                      : (isEditMode ? 'Update Bot' : 'Create Bot')
                    }
                  </span>
                </button>
                <button
                  onClick={clearForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isEditMode ? 'Cancel Edit' : 'Clear'}
                </button>
              </div>
            </div>
          </div>

          {/* Test Bot */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <CogIcon className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Test Chatbot</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bot to Test
                </label>
                <select
                  value={testBotId}
                  onChange={(e) => setTestBotId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                >
                  <option value="">Select bot to test</option>
                  {chatbots.map((bot) => (
                    <option key={bot.id} value={bot.id}>
                      {bot.name} ({getBotTypeLabel(bot.botType)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                  Test Phone Number
                </label>
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="1234567890 (10-15 digits)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Message
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type a message to trigger the bot"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none"
                />
              </div>

              <button
                onClick={testChatBot}
                disabled={!testBotId || !testPhoneNumber || !testMessage}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CogIcon className="h-5 w-5" />
                <span>Test Bot</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chatbots List */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Chatbots</h2>
            <button
              onClick={loadChatBots}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-whatsapp-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading chatbots...</p>
            </div>
          ) : chatbots.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chatbots found</h3>
              <p className="text-gray-600">Create your first chatbot to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatbots.map((bot) => (
                <div
                  key={bot.id}
                  className={`p-6 rounded-xl border-l-4 ${
                    bot.status === 'ACTIVE' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
                        <h4 className="text-lg font-semibold text-gray-900">{bot.name}</h4>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{bot.description || 'No description'}</p>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {getBotTypeLabel(bot.botType)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bot.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bot.status}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Priority: {bot.priority}
                        </span>
                        {bot.totalTriggers && bot.totalTriggers > 0 && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                            {bot.totalTriggers} triggers
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleBotStatus(bot.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          bot.status === 'ACTIVE'
                            ? 'text-yellow-600 hover:bg-yellow-100'
                            : 'text-green-600 hover:bg-green-100'
                        }`}
                        title={bot.status === 'ACTIVE' ? 'Pause Bot' : 'Activate Bot'}
                      >
                        {bot.status === 'ACTIVE' ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => editChatBot(bot)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Bot"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteChatBot(bot.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Bot"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Response Message:</h5>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {bot.customResponse}
                    </div>
                  </div>

                  {bot.triggerKeywords && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">Trigger Keywords:</h5>
                      <div className="flex flex-wrap gap-2">
                        {bot.triggerKeywords.split(',').map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-white text-blue-800 rounded border text-xs">
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {bot.businessHoursEnabled && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-yellow-800 mb-2">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        Business Hours:
                      </h5>
                      <div className="text-sm text-yellow-800">
                        {bot.businessStartTime} - {bot.businessEndTime}
                        {bot.businessDays && (
                          <div className="mt-1">
                            Days: {bot.businessDays}
                          </div>
                        )}
                      </div>
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