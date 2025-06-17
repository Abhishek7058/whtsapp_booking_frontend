/**
 * Admin Users Page
 * User management interface with real API data
 */

'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// Types
// ============================================================================

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEAM_MEMBER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';
  profilePictureUrl?: string;
  department?: string;
  jobTitle?: string;
  phoneNumber?: string;
  isOnline: boolean;
  lastLoginAt?: string;
  maxConcurrentChats: number;
  skills?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserResult {
  status: 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<UserResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
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

  const loadUsers = async () => {
    setLoading(true);
    showResult('loading', 'Loading users...');

    try {
      // Import API helpers
      const { usersApi } = await import('@/lib/api');

      const data = await usersApi.getAll();
      if (data.success && data.data) {
        // Handle both paginated and direct array responses
        const usersList = data.data.content || data.data;
        setUsers(Array.isArray(usersList) ? usersList : []);
        showResult('success', `Loaded ${usersList.length} users successfully!`);
      } else {
        throw new Error(data.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      showResult('error', 'Failed to load users from server');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'TEAM_MEMBER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'LOCKED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUserAction = async (action: string, userId: number) => {
    showResult('loading', `Processing ${action} action...`);

    try {
      // Import API helpers
      const { usersApi } = await import('@/lib/api');

      let data;
      switch (action) {
        case 'toggle':
          data = await usersApi.toggleStatus(userId);
          break;
        case 'delete':
          if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            setResult(null);
            return;
          }
          data = await usersApi.delete(userId);
          break;
        case 'reset':
          data = await usersApi.resetPassword(userId);
          break;
        default:
          showResult('error', `Action ${action} not implemented yet`);
          return;
      }

      if (data.success) {
        showResult('success', `User ${action} completed successfully!`);
        loadUsers(); // Reload users
      } else {
        showResult('error', `Failed to ${action} user: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      showResult('error', `Network error occurred: ${error}`);
    }
  };

  const formatRelativeTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">Manage system users, roles, and permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4" />
                <span>Export Users</span>
              </button>
              <button className="px-6 py-2 bg-whatsapp-600 text-white rounded-lg hover:bg-whatsapp-700 transition-colors flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Add User</span>
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
                  {formatRelativeTime(result.timestamp)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FunnelIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="TEAM_MEMBER">Team Member</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 transition-colors"
              >
                <option value="all">All Departments</option>
                <option value="IT">IT</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.isOnline).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'ADMIN').length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'TEAM_MEMBER').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
            <button
              onClick={loadUsers}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-whatsapp-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or add new users.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      {/* Online Indicator */}
                      <div className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                        user.isOnline ? 'bg-green-400' : 'bg-gray-400'
                      }`} />
                    </div>

                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'ADMIN' ? 'Administrator' : 'Team Member'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 mb-2">@{user.username}</p>

                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <EnvelopeIcon className="h-4 w-4 mr-2" />
                              {user.email}
                            </div>

                            {user.phoneNumber && (
                              <div className="flex items-center text-sm text-gray-600">
                                <PhoneIcon className="h-4 w-4 mr-2" />
                                {user.phoneNumber}
                              </div>
                            )}

                            {user.department && (
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium mr-2">Department:</span>
                                {user.department}
                                {user.jobTitle && ` • ${user.jobTitle}`}
                              </div>
                            )}

                            {user.skills && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium mr-2">Skills:</span>
                                {user.skills}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUserAction('toggle', user.id)}
                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                              user.status === 'ACTIVE'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleUserAction('reset', user.id)}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleUserAction('delete', user.id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Max chats: {user.maxConcurrentChats}</span>
                          {user.lastLoginAt && (
                            <span>Last login: {formatRelativeTime(user.lastLoginAt)}</span>
                          )}
                        </div>

                        <span>Created {formatRelativeTime(user.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
