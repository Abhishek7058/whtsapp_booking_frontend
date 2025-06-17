/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { authService } from '@/services/auth.service';
import { tokenManager } from '@/services/api/client';
import { UserInfo, LoginRequest, ChangePasswordRequest } from '@/types/api';

// ============================================================================
// Types
// ============================================================================

export interface AuthState {
  // State
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  sessionTimeout: number;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  changePassword: (request: ChangePasswordRequest) => Promise<void>;
  updateOnlineStatus: (isOnline: boolean) => Promise<void>;
  clearError: () => void;
  updateLastActivity: () => void;
  checkSession: () => Promise<boolean>;
  
  // Computed
  isAdmin: () => boolean;
  isTeamMember: () => boolean;
  hasRole: (role: string) => boolean;
  isSessionExpired: () => boolean;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        lastActivity: Date.now(),
        sessionTimeout: 30 * 60 * 1000, // 30 minutes

        // Actions
        login: async (credentials: LoginRequest) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await authService.login(credentials);
            
            if (response.success && response.data) {
              set((state) => {
                state.user = response.data!.user;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.lastActivity = Date.now();
              });

              // Setup auto-refresh and listeners
              authService.setupAutoRefresh();
              authService.setupStorageListener();
              authService.setupVisibilityListener();
            } else {
              throw new Error(response.message || 'Login failed');
            }
          } catch (error: any) {
            set((state) => {
              state.isLoading = false;
              state.error = error.message || 'Login failed';
              state.isAuthenticated = false;
              state.user = null;
            });
            throw error;
          }
        },

        logout: async () => {
          set((state) => {
            state.isLoading = true;
          });

          try {
            // Call backend logout endpoint
            await authService.logout();
          } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if backend call fails
          } finally {
            // Clear all auth state
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.isLoading = false;
              state.error = null;
              state.lastActivity = Date.now();
            });

            // Clear any stored tokens
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth-token');
              localStorage.removeItem('refresh-token');
              sessionStorage.clear();
            }
          }
        },

        refreshToken: async () => {
          const refreshToken = authService.getStoredRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          try {
            const response = await authService.refreshToken(refreshToken);
            
            if (response.success && response.data) {
              set((state) => {
                state.user = response.data!.user;
                state.isAuthenticated = true;
                state.lastActivity = Date.now();
              });
            } else {
              throw new Error(response.message || 'Token refresh failed');
            }
          } catch (error: any) {
            set((state) => {
              state.user = null;
              state.isAuthenticated = false;
              state.error = error.message || 'Token refresh failed';
            });
            throw error;
          }
        },

        getCurrentUser: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await authService.getCurrentUser();
            
            if (response.success && response.data) {
              set((state) => {
                state.user = response.data!;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.lastActivity = Date.now();
              });
            } else {
              throw new Error(response.message || 'Failed to get user info');
            }
          } catch (error: any) {
            set((state) => {
              state.isLoading = false;
              state.error = error.message || 'Failed to get user info';
            });
            throw error;
          }
        },

        changePassword: async (request: ChangePasswordRequest) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const response = await authService.changePassword(request);
            
            if (response.success) {
              set((state) => {
                state.isLoading = false;
              });
            } else {
              throw new Error(response.message || 'Password change failed');
            }
          } catch (error: any) {
            set((state) => {
              state.isLoading = false;
              state.error = error.message || 'Password change failed';
            });
            throw error;
          }
        },

        updateOnlineStatus: async (isOnline: boolean) => {
          try {
            const response = await authService.updateOnlineStatus({ isOnline });
            
            if (response.success) {
              set((state) => {
                if (state.user) {
                  state.user.isOnline = isOnline;
                }
                state.lastActivity = Date.now();
              });
            }
          } catch (error: any) {
            console.error('Update online status failed:', error);
            set((state) => {
              state.error = error.message || 'Failed to update online status';
            });
          }
        },

        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        updateLastActivity: () => {
          set((state) => {
            state.lastActivity = Date.now();
          });
        },

        checkSession: async (): Promise<boolean> => {
          const { isAuthenticated, isSessionExpired } = get();
          
          if (!isAuthenticated) {
            return false;
          }

          if (isSessionExpired()) {
            try {
              await get().refreshToken();
              return true;
            } catch (error) {
              await get().logout();
              return false;
            }
          }

          return true;
        },

        // Computed Properties
        isAdmin: () => {
          const { user } = get();
          return user?.role === 'ADMIN';
        },

        isTeamMember: () => {
          const { user } = get();
          return user?.role === 'TEAM_MEMBER';
        },

        hasRole: (role: string) => {
          const { user } = get();
          return user?.role === role;
        },

        isSessionExpired: () => {
          const { lastActivity, sessionTimeout } = get();
          return Date.now() - lastActivity > sessionTimeout;
        },
      })),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          lastActivity: state.lastActivity,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// ============================================================================
// Hooks for easier usage
// ============================================================================

export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    getCurrentUser: store.getCurrentUser,
    changePassword: store.changePassword,
    updateOnlineStatus: store.updateOnlineStatus,
    clearError: store.clearError,
    updateLastActivity: store.updateLastActivity,
    checkSession: store.checkSession,
    isAdmin: store.isAdmin,
    isTeamMember: store.isTeamMember,
    hasRole: store.hasRole,
    isSessionExpired: store.isSessionExpired,
  };
};

// ============================================================================
// Session Management
// ============================================================================

// Auto-update last activity on user interactions
if (typeof window !== 'undefined') {
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  const updateActivity = () => {
    useAuthStore.getState().updateLastActivity();
  };

  events.forEach((event) => {
    document.addEventListener(event, updateActivity, true);
  });

  // Check session periodically
  setInterval(async () => {
    const { isAuthenticated, checkSession } = useAuthStore.getState();
    
    if (isAuthenticated) {
      const isValid = await checkSession();
      if (!isValid) {
        window.location.href = '/auth/login';
      }
    }
  }, 60000); // Check every minute
}

// ============================================================================
// Initialize store on app start
// ============================================================================

export const initializeAuth = async () => {
  const { isAuthenticated, getCurrentUser, logout } = useAuthStore.getState();
  
  // Check if user is authenticated from stored data
  if (isAuthenticated && authService.isAuthenticated()) {
    try {
      await getCurrentUser();
      authService.setupAutoRefresh();
      authService.setupStorageListener();
      authService.setupVisibilityListener();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await logout();
    }
  } else if (isAuthenticated) {
    // Clear invalid authentication state
    await logout();
  }
};

export default useAuthStore;
