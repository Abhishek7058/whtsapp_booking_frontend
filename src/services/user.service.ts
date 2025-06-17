/**
 * User Management Service
 * Handles all user-related API calls
 */

import { api, buildQueryString } from '@/lib/api';
import {
  ApiResponse,
  PaginatedResponse,
  UserInfo,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  UserFilters,
  PaginationParams,
} from '@/types/api';

// ============================================================================
// User Service Class
// ============================================================================

class UserService {
  private readonly baseUrl = '/users';

  /**
   * Get all users with pagination and filters (Admin only)
   */
  async getUsers(
    filters?: UserFilters,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<UserInfo>>> {
    try {
      const params = {
        ...filters,
        ...pagination,
      };

      const queryString = buildQueryString(params);
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      return await api.get<PaginatedResponse<UserInfo>>(url);
    } catch (error) {
      console.error('Get users failed:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<UserInfo>> {
    try {
      return await api.get<UserInfo>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Get user ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * Create new user (Admin only)
   */
  async createUser(request: CreateUserRequest): Promise<ApiResponse<UserInfo>> {
    try {
      return await api.post<UserInfo>(this.baseUrl, request);
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(id: number, request: UpdateUserRequest): Promise<ApiResponse<UserInfo>> {
    try {
      return await api.put<UserInfo>(`${this.baseUrl}/${id}`, request);
    } catch (error) {
      console.error(`Update user ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(id: number, request: UpdateUserRoleRequest): Promise<ApiResponse<UserInfo>> {
    try {
      return await api.put<UserInfo>(`${this.baseUrl}/${id}/role`, request);
    } catch (error) {
      console.error(`Update user ${id} role failed:`, error);
      throw error;
    }
  }

  /**
   * Update user status (Admin only)
   */
  async updateUserStatus(id: number, request: UpdateUserStatusRequest): Promise<ApiResponse<UserInfo>> {
    try {
      return await api.put<UserInfo>(`${this.baseUrl}/${id}/status`, request);
    } catch (error) {
      console.error(`Update user ${id} status failed:`, error);
      throw error;
    }
  }

  /**
   * Delete user (Admin only)
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      return await api.delete<void>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error(`Delete user ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * Reset user password (Admin only)
   */
  async resetUserPassword(id: number): Promise<ApiResponse<{ temporaryPassword: string }>> {
    try {
      return await api.post<{ temporaryPassword: string }>(`${this.baseUrl}/${id}/reset-password`);
    } catch (error) {
      console.error(`Reset password for user ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * Unlock user account (Admin only)
   */
  async unlockUser(id: number): Promise<ApiResponse<UserInfo>> {
    try {
      return await api.post<UserInfo>(`${this.baseUrl}/${id}/unlock`);
    } catch (error) {
      console.error(`Unlock user ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * Get online users
   */
  async getOnlineUsers(): Promise<ApiResponse<UserInfo[]>> {
    try {
      return await api.get<UserInfo[]>(`${this.baseUrl}/online`);
    } catch (error) {
      console.error('Get online users failed:', error);
      throw error;
    }
  }

  /**
   * Get available agents (for conversation assignment)
   */
  async getAvailableAgents(): Promise<ApiResponse<UserInfo[]>> {
    try {
      return await api.get<UserInfo[]>(`${this.baseUrl}/available-agents`);
    } catch (error) {
      console.error('Get available agents failed:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(id: number): Promise<ApiResponse<UserStatistics>> {
    try {
      return await api.get<UserStatistics>(`${this.baseUrl}/${id}/statistics`);
    } catch (error) {
      console.error(`Get user ${id} statistics failed:`, error);
      throw error;
    }
  }

  /**
   * Get user activity log
   */
  async getUserActivityLog(
    id: number,
    pagination?: PaginationParams
  ): Promise<ApiResponse<PaginatedResponse<UserActivity>>> {
    try {
      const params = pagination || {};
      const queryString = buildQueryString(params);
      const url = queryString 
        ? `${this.baseUrl}/${id}/activity?${queryString}` 
        : `${this.baseUrl}/${id}/activity`;

      return await api.get<PaginatedResponse<UserActivity>>(url);
    } catch (error) {
      console.error(`Get user ${id} activity log failed:`, error);
      throw error;
    }
  }

  /**
   * Update user profile picture
   */
  async updateProfilePicture(
    id: number,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ profilePictureUrl: string }>> {
    try {
      return await api.upload<{ profilePictureUrl: string }>(
        `${this.baseUrl}/${id}/profile-picture`,
        file,
        onProgress
      );
    } catch (error) {
      console.error(`Update profile picture for user ${id} failed:`, error);
      throw error;
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(id: number): Promise<ApiResponse<UserPreferences>> {
    try {
      return await api.get<UserPreferences>(`${this.baseUrl}/${id}/preferences`);
    } catch (error) {
      console.error(`Get user ${id} preferences failed:`, error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    id: number,
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    try {
      return await api.put<UserPreferences>(`${this.baseUrl}/${id}/preferences`, preferences);
    } catch (error) {
      console.error(`Update user ${id} preferences failed:`, error);
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<ApiResponse<UserInfo[]>> {
    try {
      const params = { q: query };
      const queryString = buildQueryString(params);
      return await api.get<UserInfo[]>(`${this.baseUrl}/search?${queryString}`);
    } catch (error) {
      console.error('Search users failed:', error);
      throw error;
    }
  }

  /**
   * Get user roles and permissions
   */
  async getUserRoles(): Promise<ApiResponse<UserRole[]>> {
    try {
      return await api.get<UserRole[]>(`${this.baseUrl}/roles`);
    } catch (error) {
      console.error('Get user roles failed:', error);
      throw error;
    }
  }

  /**
   * Get departments
   */
  async getDepartments(): Promise<ApiResponse<string[]>> {
    try {
      return await api.get<string[]>(`${this.baseUrl}/departments`);
    } catch (error) {
      console.error('Get departments failed:', error);
      throw error;
    }
  }

  /**
   * Bulk update users (Admin only)
   */
  async bulkUpdateUsers(
    userIds: number[],
    updates: Partial<UpdateUserRequest>
  ): Promise<ApiResponse<UserInfo[]>> {
    try {
      const request = {
        userIds,
        updates,
      };
      return await api.put<UserInfo[]>(`${this.baseUrl}/bulk-update`, request);
    } catch (error) {
      console.error('Bulk update users failed:', error);
      throw error;
    }
  }

  /**
   * Export users data (Admin only)
   */
  async exportUsers(filters?: UserFilters): Promise<void> {
    try {
      const params = filters || {};
      const queryString = buildQueryString(params);
      const url = queryString ? `${this.baseUrl}/export?${queryString}` : `${this.baseUrl}/export`;
      
      await api.download(url, 'users-export.csv');
    } catch (error) {
      console.error('Export users failed:', error);
      throw error;
    }
  }

  /**
   * Import users from CSV (Admin only)
   */
  async importUsers(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ imported: number; failed: number; errors: string[] }>> {
    try {
      return await api.upload<{ imported: number; failed: number; errors: string[] }>(
        `${this.baseUrl}/import`,
        file,
        onProgress
      );
    } catch (error) {
      console.error('Import users failed:', error);
      throw error;
    }
  }
}

// ============================================================================
// Additional Types
// ============================================================================

export interface UserStatistics {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfactionScore: number;
  messagesHandled: number;
  loginCount: number;
  lastLoginAt: string;
  totalOnlineTime: number;
}

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  dashboard: {
    layout: string;
    widgets: string[];
  };
  chat: {
    autoAssign: boolean;
    maxConcurrentChats: number;
    typingIndicator: boolean;
    readReceipts: boolean;
  };
}

export interface UserRole {
  name: string;
  displayName: string;
  permissions: string[];
  description: string;
}

// ============================================================================
// Export Service Instance
// ============================================================================

export const userService = new UserService();
export default userService;
