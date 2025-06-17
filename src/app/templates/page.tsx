/**
 * Templates Management Page
 * Complete template management functionality matching static HTML
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Template {
  id: number;
  name: string;
  content: string;
  description?: string;
  templateType: string;
  status: 'ACTIVE' | 'INACTIVE';
  parameters: string[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TemplateResult | null>(null);
  
  // Form states
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateType, setTemplateType] = useState('CUSTOM');
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Preview states
  const [previewTemplateId, setPreviewTemplateId] = useState('');
  const [previewParams, setPreviewParams] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadTemplates();
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

  const loadTemplates = async () => {
    try {
      setLoading(true);
      // Import API helpers
      const { templatesApi } = await import('@/lib/api');

      const data = await templatesApi.getAll();
      if (data.success && data.data) {
        // Handle both array and paginated response
        const templateList = Array.isArray(data.data) ? data.data : (data.data.content || []);
        setTemplates(templateList);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      showResult('error', 'Failed to load templates from server');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateTemplate = async () => {
    if (!templateName || !templateContent) {
      showResult('error', 'Please fill in template name and content');
      return;
    }

    if (templateName.length < 3) {
      showResult('error', 'Template name must be at least 3 characters');
      return;
    }

    const action = isEditMode ? 'Updating' : 'Creating';
    showResult('loading', `${action} template...`);

    try {
      // Import API helpers
      const { templatesApi } = await import('@/lib/api');

      const templateData = {
        name: templateName,
        content: templateContent,
        templateType: templateType,
        description: templateDescription || 'Created from dashboard'
      };

      let data;
      if (isEditMode && editingTemplateId) {
        data = await templatesApi.update(editingTemplateId, templateData);
      } else {
        data = await templatesApi.create(templateData);
      }

      if (data.success) {
        showResult('success', `Template ${isEditMode ? 'updated' : 'created'} successfully!`);
        clearForm();
        loadTemplates();
      } else {
        showResult('error', `Failed to ${isEditMode ? 'update' : 'create'} template: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const previewTemplate = async () => {
    if (!previewTemplateId) {
      showResult('error', 'Please select a template to preview');
      return;
    }

    let parameters = {};
    if (previewParams.trim()) {
      try {
        parameters = JSON.parse(previewParams);
      } catch (e) {
        showResult('error', 'Invalid JSON in parameters');
        return;
      }
    }

    try {
      // Import API helpers
      const { templatesApi } = await import('@/lib/api');

      const data = await templatesApi.preview(parseInt(previewTemplateId), parameters);

      if (data.success) {
        setPreviewContent(data.data);
        setShowPreview(true);
        showResult('success', 'Template preview generated!');
      } else {
        showResult('error', `Failed to generate preview: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const deleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      // Import API helpers
      const { templatesApi } = await import('@/lib/api');

      const data = await templatesApi.delete(templateId);

      if (data.success) {
        showResult('success', 'Template deleted successfully!');
        loadTemplates();
      } else {
        showResult('error', `Failed to delete template: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const editTemplate = (template: Template) => {
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setTemplateContent(template.content);
    setTemplateType(template.templateType);
    setEditingTemplateId(template.id);
    setIsEditMode(true);
    showResult('success', 'Template loaded for editing. Modify and click "Update Template" to save changes.');
  };

  const clearForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setTemplateContent('');
    setTemplateType('CUSTOM');
    setEditingTemplateId(null);
    setIsEditMode(false);
  };

  const extractVariables = (content: string) => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.id.toString() === previewTemplateId);
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
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Templates Management</h1>
              <p className="text-gray-600">Create and manage WhatsApp message templates</p>
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
          {/* Create Template */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              {isEditMode ? (
                <PencilIcon className="h-6 w-6 text-blue-600" />
              ) : (
                <PlusIcon className="h-6 w-6 text-green-600" />
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Template' : 'Create Template'}
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of the template"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  value={templateType}
                  onChange={(e) => setTemplateType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                >
                  <option value="CUSTOM">Custom</option>
                  <option value="WELCOME">Welcome Message</option>
                  <option value="TRANSACTIONAL">Transactional</option>
                  <option value="PROMOTIONAL">Promotional</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Content
                </label>
                <textarea
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  placeholder="Enter your template content. Use {{variable}} for dynamic content."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none"
                />
                {templateContent && extractVariables(templateContent).length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-1">Detected Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {extractVariables(templateContent).map((variable) => (
                        <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={createOrUpdateTemplate}
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
                      : (isEditMode ? 'Update Template' : 'Create Template')
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

          {/* Template Preview */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <EyeIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Template Preview</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Template
                </label>
                <select
                  value={previewTemplateId}
                  onChange={(e) => setPreviewTemplateId(e.target.value)}
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

              {getSelectedTemplate() && getSelectedTemplate()?.parameters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Parameters (JSON)
                  </label>
                  <textarea
                    value={previewParams}
                    onChange={(e) => setPreviewParams(e.target.value)}
                    placeholder={`{"${getSelectedTemplate()?.parameters.join('": "value", "')}"}: "value"}`}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors resize-none font-mono text-sm"
                  />
                </div>
              )}

              <button
                onClick={previewTemplate}
                disabled={!previewTemplateId}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <EyeIcon className="h-5 w-5" />
                <span>Generate Preview</span>
              </button>

              {showPreview && previewContent && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Preview Result:</h4>
                  <div className="bg-white p-3 rounded border text-sm text-gray-800 whitespace-pre-wrap">
                    {previewContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Templates</h2>
            <button
              onClick={loadTemplates}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-whatsapp-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">Create your first template to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-6 rounded-xl border-l-4 ${
                    template.status === 'ACTIVE' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{template.description || 'No description'}</p>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {template.templateType}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          template.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {template.status}
                        </span>
                        {template.parameters.length > 0 && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {template.parameters.length} Parameters
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Template"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Template"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Template Content:</h5>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {template.content}
                    </div>
                  </div>

                  {template.parameters.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-800 mb-2">Required Parameters:</h5>
                      <div className="flex flex-wrap gap-2">
                        {template.parameters.map((param) => (
                          <span key={param} className="px-2 py-1 bg-white text-blue-800 rounded border text-xs font-mono">
                            {`{{${param}}}`}
                          </span>
                        ))}
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
