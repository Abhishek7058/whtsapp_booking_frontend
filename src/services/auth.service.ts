/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { api, tokenManager } from './api/client';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ChangePasswordRequest,
  OnlineStatusRequest,
  UserInfo,
} from '@/types/api';

// ============================================================================
// Authentication Service Class
// ============================================================================

class AuthService {
  private readonly baseUrl = '/auth';

  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/login`, credentials);

      // The response.data contains the ApiResponse structure
      const apiResponse = response.data;

      // Store tokens in localStorage
      if (apiResponse.success && apiResponse.data) {
        this.storeTokens(apiResponse.data.accessToken, apiResponse.data.refreshToken);
        this.storeUserInfo(apiResponse.data.user);
      }

      return apiResponse;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>(`${this.baseUrl}/logout`);

      // Clear stored tokens and user info
      this.clearStoredData();

      return response.data;
    } catch (error) {
      // Even if logout fails on server, clear local data
      this.clearStoredData();
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const request: RefreshTokenRequest = { refreshToken };
      const response = await api.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/refresh`, request);

      const apiResponse = response.data;

      // Update stored tokens
      if (apiResponse.success && apiResponse.data) {
        this.storeTokens(apiResponse.data.accessToken, apiResponse.data.refreshToken);
        this.storeUserInfo(apiResponse.data.user);
      }

      return apiResponse;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearStoredData();
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    try {
      const response = await api.get<ApiResponse<UserInfo>>(`${this.baseUrl}/me`);
      return response.data;
    } catch (error) {
      console.error('Get current user failed:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>(`${this.baseUrl}/change-password`, request);
      return response.data;
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<string>> {
    try {
      const response = await api.post<ApiResponse<string>>(`${this.baseUrl}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      console.error('Request password reset failed:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string, confirmPassword: string): Promise<ApiResponse<string>> {
    try {
      const response = await api.post<ApiResponse<string>>(`${this.baseUrl}/reset-password`, {
        token,
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }

  /**
   * Update online status
   */
  async updateOnlineStatus(request: OnlineStatusRequest): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<ApiResponse<void>>(`${this.baseUrl}/online-status`, request);
      return response.data;
    } catch (error) {
      console.error('Update online status failed:', error);
      throw error;
    }
  }

  /**
   * Validate current session
   */
  async validateSession(): Promise<boolean> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return false;
      }

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        const refreshToken = this.getStoredRefreshToken();
        if (refreshToken) {
          await this.refreshToken(refreshToken);
          return true;
        }
        return false;
      }

      // Validate with server
      const response = await this.getCurrentUser();
      return response.success;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  /**
   * Store authentication tokens
   */
  private storeTokens(accessToken: string, refreshToken: string): void {
    tokenManager.setTokens(accessToken, refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tokenTimestamp', Date.now().toString());
    }
  }

  /**
   * Store user information
   */
  private storeUserInfo(user: UserInfo): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('userInfo', JSON.stringify(user));
  }

  /**
   * Get stored access token
   */
  getStoredToken(): string | null {
    return tokenManager.getAccessToken();
  }

  /**
   * Get stored refresh token
   */
  getStoredRefreshToken(): string | null {
    return tokenManager.getRefreshToken();
  }

  /**
   * Get stored user information
   */
  getStoredUserInfo(): UserInfo | null {
    if (typeof window === 'undefined') return null;
    
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Clear all stored authentication data
   */
  private clearStoredData(): void {
    tokenManager.clearTokens();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userInfo');
      localStorage.removeItem('tokenTimestamp');
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    return tokenManager.isTokenExpired(token);
  }

  // ============================================================================
  // Authentication State Helpers
  // ============================================================================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return token !== null && !this.isTokenExpired(token);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userInfo = this.getStoredUserInfo();
    return userInfo?.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Check if user is team member
   */
  isTeamMember(): boolean {
    return this.hasRole('TEAM_MEMBER');
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): string | null {
    const userInfo = this.getStoredUserInfo();
    return userInfo?.role || null;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    const userInfo = this.getStoredUserInfo();
    return userInfo?.id || null;
  }

  /**
   * Get current username
   */
  getCurrentUsername(): string | null {
    const userInfo = this.getStoredUserInfo();
    return userInfo?.username || null;
  }

  // ============================================================================
  // Auto-refresh Token Setup
  // ============================================================================

  /**
   * Setup automatic token refresh
   */
  setupAutoRefresh(): void {
    const refreshInterval = 15 * 60 * 1000; // 15 minutes
    
    setInterval(async () => {
      const token = this.getStoredToken();
      const refreshToken = this.getStoredRefreshToken();
      
      if (token && refreshToken && this.isTokenExpired(token)) {
        try {
          await this.refreshToken(refreshToken);
          console.log('Token refreshed automatically');
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          this.clearStoredData();
          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }
    }, refreshInterval);
  }

  // ============================================================================
  // Event Listeners
  // ============================================================================

  /**
   * Listen for storage changes (multi-tab support)
   */
  setupStorageListener(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('storage', (event) => {
      if (event.key === 'accessToken' && !event.newValue) {
        // Token was removed in another tab, redirect to login
        window.location.href = '/auth/login';
      }
    });
  }

  /**
   * Listen for page visibility changes
   */
  setupVisibilityListener(): void {
    if (typeof window === 'undefined') return;
    
    document.addEventListener('visibilitychange', async () => {
      if (!document.hidden && this.isAuthenticated()) {
        // Page became visible, validate session
        const isValid = await this.validateSession();
        if (!isValid) {
          window.location.href = '/auth/login';
        }
      }
    });
  }
}

// ============================================================================
// Export Service Instance
// ============================================================================

export const authService = new AuthService();
export default authService;
