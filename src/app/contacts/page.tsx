/**
 * Contacts Page
 * Contact management interface
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface Contact {
  id: number;
  name: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  profilePictureUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  source?: string;
  tags: string[];
  lastMessageAt?: string;
  assignedAgent?: {
    id: number;
    name: string;
    profilePictureUrl?: string;
  };
  leadScore?: number;
  createdAt: string;
  updatedAt: string;
}



// ============================================================================
// Component
// ============================================================================

interface ContactResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Form states for adding/editing contacts
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContactId, setEditingContactId] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    loadContacts();
  }, [currentPage]);

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

  const loadContacts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Import API helpers
      const { contactsApi } = await import('@/lib/api');

      const filters = {
        search: searchQuery,
        status: statusFilter === 'all' ? '' : statusFilter,
        source: sourceFilter === 'all' ? '' : sourceFilter,
      };

      const data = await contactsApi.getAll(currentPage, pageSize, filters);

      if (data.success && data.data) {
        // Handle both array and paginated response
        const contactsList = Array.isArray(data.data) ? data.data : ((data.data as any)?.content || []);
        setContacts(contactsList);
        setTotalCount((data.data as any)?.totalElements || contactsList.length);
      }
    } catch (error: any) {
      console.error('Failed to load contacts:', error);
      setError(error.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadContacts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSourceFilter('all');
    setCurrentPage(0);
    setTimeout(loadContacts, 100);
  };

  const createOrUpdateContact = async () => {
    if (!contactName || !contactPhone) {
      showResult('error', 'Please fill in contact name and phone number');
      return;
    }

    if (contactName.length < 2) {
      showResult('error', 'Contact name must be at least 2 characters');
      return;
    }

    const action = editingContactId ? 'Updating' : 'Creating';
    showResult('loading', `${action} contact...`);

    try {
      // Import API helpers
      const { contactsApi } = await import('@/lib/api');

      const contactData = {
        name: contactName,
        phoneNumber: contactPhone,
        email: contactEmail || undefined
      };

      let data;
      if (editingContactId) {
        data = await contactsApi.update(editingContactId, contactData);
      } else {
        data = await contactsApi.create(contactData);
      }

      if (data.success) {
        showResult('success', `Contact ${editingContactId ? 'updated' : 'created'} successfully!`);
        clearForm();
        loadContacts();
      } else {
        showResult('error', `Failed to ${editingContactId ? 'update' : 'create'} contact: ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      showResult('error', `Network error occurred: ${error.message}`);
    }
  };

  const editContact = (contact: Contact) => {
    setContactName(contact.name);
    setContactPhone(contact.phoneNumber);
    setContactEmail(contact.email || '');
    setEditingContactId(contact.id);
    setShowAddForm(true);
    showResult('success', 'Contact loaded for editing.');
  };

  const deleteContact = async (contactId: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    showResult('loading', 'Deleting contact...');

    try {
      // Import API helpers
      const { contactsApi } = await import('@/lib/api');

      const data = await contactsApi.delete(contactId);

      if (data.success) {
        showResult('success', 'Contact deleted successfully!');
        loadContacts();
      } else {
        showResult('error', `Failed to delete contact: ${data.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      showResult('error', `Network error occurred: ${error.message}`);
    }
  };

  const clearForm = () => {
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setEditingContactId(null);
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'BLOCKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
                <p className="text-gray-600">Manage WhatsApp contacts and customer information</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadContacts}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-whatsapp-600 text-white rounded-lg hover:bg-whatsapp-700 transition-colors flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Contact</span>
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Contacts</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadContacts}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Add/Edit Contact Form */}
        {showAddForm && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              {editingContactId ? (
                <PencilIcon className="h-6 w-6 text-blue-600" />
              ) : (
                <PlusIcon className="h-6 w-6 text-green-600" />
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                {editingContactId ? 'Edit Contact' : 'Add New Contact'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Enter contact name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={createOrUpdateContact}
                disabled={loading}
                className={`flex-1 text-white py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                  editingContactId
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-whatsapp-600 hover:bg-whatsapp-700'
                }`}
              >
                {editingContactId ? (
                  <PencilIcon className="h-5 w-5" />
                ) : (
                  <PlusIcon className="h-5 w-5" />
                )}
                <span>
                  {loading
                    ? (editingContactId ? 'Updating...' : 'Creating...')
                    : (editingContactId ? 'Update Contact' : 'Create Contact')
                  }
                </span>
              </button>
              <button
                onClick={clearForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {editingContactId ? 'Cancel Edit' : 'Clear'}
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FunnelIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Search & Filter</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search contacts by name, phone, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              />
            </div>

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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="all">All Sources</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Direct">Direct</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSearch}
              className="flex-1 bg-whatsapp-600 text-white py-3 px-6 rounded-lg hover:bg-whatsapp-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Search Contacts</span>
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Contacts List */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Contacts ({totalCount})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-whatsapp-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Add your first contact to get started'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {contact.name}
                              </h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
                                {contact.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => editContact(contact)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit Contact"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteContact(contact.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete Contact"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <PhoneIcon className="h-4 w-4 mr-2" />
                              {contact.phoneNumber}
                            </div>
                            {contact.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            Created: {formatTime(contact.createdAt)}
                            {contact.updatedAt && contact.updatedAt !== contact.createdAt && (
                              <span className="ml-4">Updated: {formatTime(contact.updatedAt)}</span>
                            )}
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
                    Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} contacts
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
