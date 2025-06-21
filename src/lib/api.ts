/**
 * API Client Configuration and Base Setup
 * Axios-based HTTP client with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '@/types/api';

// ============================================================================
// Configuration
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_VERSION = '/api/v1';

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    MESSAGE_STATS: '/dashboard/message-stats',
    MESSAGE_STATS_BY_DATE: '/dashboard/message-stats-by-date',
    BATCH_STATS: '/dashboard/batch-stats',
    RECENT_MESSAGES: '/dashboard/recent-messages',
    DAILY_STATS: '/dashboard/daily-stats',
  },

  // Templates
  TEMPLATES: {
    LIST: '/templates',
    CREATE: '/templates',
    GET: (id: number) => `/templates/${id}`,
    UPDATE: (id: number) => `/templates/${id}`,
    DELETE: (id: number) => `/templates/${id}`,
    ACTIVE: '/templates/active',
    BY_TYPE: (type: string) => `/templates/type/${type}`,
    SEARCH: '/templates/search',
    PREVIEW: (id: number) => `/templates/${id}/preview`,
  },

  // Messages
  MESSAGES: {
    SEND_TEXT: '/messages/send-text',
    SEND_TEMPLATE: '/messages/send-template',
    SEND_BULK: '/messages/send-bulk',
    BULK_CAMPAIGNS: '/messages/bulk-campaigns',
    LOGS: '/messages/logs',
  },

  // Chatbots
  CHATBOTS: {
    LIST: '/chatbots',
    CREATE: '/chatbots',
    GET: (id: number) => `/chatbots/${id}`,
    UPDATE: (id: number) => `/chatbots/${id}`,
    DELETE: (id: number) => `/chatbots/${id}`,
    TOGGLE: (id: number) => `/chatbots/${id}/toggle`,
    TRIGGER: (id: number) => `/chatbots/${id}/trigger`,
    STATISTICS: '/chatbots/statistics',
  },

  // Users (Admin)
  USERS: {
    LIST: '/admin/users',
    CREATE: '/admin/users',
    GET: (id: number) => `/admin/users/${id}`,
    UPDATE: (id: number) => `/admin/users/${id}`,
    DELETE: (id: number) => `/admin/users/${id}`,
    TOGGLE_STATUS: (id: number) => `/admin/users/${id}/toggle-status`,
    RESET_PASSWORD: (id: number) => `/admin/users/${id}/reset-password`,
    STATISTICS: '/admin/users/statistics',
  },

  // Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
    HEALTH: '/settings/health',
  },

  // Health Check
  HEALTH: '/actuator/health',
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}${API_VERSION}`,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor for adding auth token
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage or your auth store
      const token = getAuthToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for debugging
      (config as any).metadata = { startTime: new Date() };
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for handling responses and errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time for debugging
      const endTime = new Date();
      const duration = endTime.getTime() - (response.config as any).metadata?.startTime?.getTime();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
      }

      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - Token expired
      if (error.response?.status === 401 && !(originalRequest as any)?._retry) {
        (originalRequest as any)._retry = true;

        try {
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            const newToken = await refreshAuthToken(refreshToken);
            if (newToken && originalRequest) {
              setAuthToken(newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return client(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          handleAuthFailure();
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      const apiError = transformAxiosError(error);
      return Promise.reject(apiError);
    }
  );

  return client;
};

// ============================================================================
// API Client Instance
// ============================================================================

export const apiClient = createApiClient();

// ============================================================================
// Authentication Helpers
// ============================================================================

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
};

const removeAuthTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const refreshAuthToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}${API_VERSION}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken } = response.data.data;
    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

const handleAuthFailure = (): void => {
  removeAuthTokens();
  
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};

// ============================================================================
// Error Transformation
// ============================================================================

const transformAxiosError = (error: AxiosError): ApiError => {
  const response = error.response;
  
  if (response?.data) {
    // Backend returned structured error
    const backendError = response.data as any;
    return {
      message: backendError.message || 'An error occurred',
      errorCode: backendError.errorCode,
      details: backendError.errors || backendError.details,
      timestamp: backendError.timestamp || new Date().toISOString(),
      path: backendError.path,
      statusCode: response.status,
    };
  }

  // Network or other errors
  return {
    message: error.message || 'Network error occurred',
    errorCode: error.code || 'NETWORK_ERROR',
    timestamp: new Date().toISOString(),
    statusCode: response?.status || 0,
  };
};

// ============================================================================
// Generic API Methods
// ============================================================================

export const api = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  },

  // File upload
  upload: async <T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  // Download file
  download: async (url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> => {
    const response = await apiClient.get(url, {
      ...config,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// ============================================================================
// Request/Response Logging (Development)
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  // Add request logging
  apiClient.interceptors.request.use((config) => {
    console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    if (config.data) {
      console.log('Data:', config.data);
    }
    if (config.params) {
      console.log('Params:', config.params);
    }
    console.groupEnd();
    return config;
  });

  // Add response logging
  apiClient.interceptors.response.use(
    (response) => {
      console.group(`✅ API Response: ${response.status} ${response.config.url}`);
      console.log('Data:', response.data);
      console.groupEnd();
      return response;
    },
    (error) => {
      console.group(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`);
      console.log('Error:', error.response?.data || error.message);
      console.groupEnd();
      return Promise.reject(error);
    }
  );
}

// ============================================================================
// Utility Functions
// ============================================================================

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'message' in error && 'statusCode' in error;
};

// ============================================================================
// Auth Token Management
// ============================================================================

export const authTokenManager = {
  getToken: getAuthToken,
  getRefreshToken,
  setToken: setAuthToken,
  removeTokens: removeAuthTokens,
  refreshToken: refreshAuthToken,
};

// ============================================================================
// API Helper Functions
// ============================================================================

// Dashboard API helpers
export const dashboardApi = {
  getStats: () => api.get(API_ENDPOINTS.DASHBOARD.STATS),
  getMessageStats: () => api.get(API_ENDPOINTS.DASHBOARD.MESSAGE_STATS),
  getMessageStatsByDate: (days: number = 7) =>
    api.get(`${API_ENDPOINTS.DASHBOARD.MESSAGE_STATS_BY_DATE}?days=${days}`),
  getBatchStats: () => api.get(API_ENDPOINTS.DASHBOARD.BATCH_STATS),
  getRecentMessages: (page: number = 0, size: number = 20) =>
    api.get(`${API_ENDPOINTS.DASHBOARD.RECENT_MESSAGES}?page=${page}&size=${size}`),
  getDailyStats: () => api.get(API_ENDPOINTS.DASHBOARD.DAILY_STATS),
};

// Templates API helpers
export const templatesApi = {
  getAll: (page: number = 0, size: number = 10, sortBy: string = 'createdAt', sortDir: string = 'desc') =>
    api.get(`${API_ENDPOINTS.TEMPLATES.LIST}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  getActive: () => api.get(API_ENDPOINTS.TEMPLATES.ACTIVE),
  getById: (id: number) => api.get(API_ENDPOINTS.TEMPLATES.GET(id)),
  create: (template: any) => api.post(API_ENDPOINTS.TEMPLATES.CREATE, template),
  update: (id: number, template: any) => api.put(API_ENDPOINTS.TEMPLATES.UPDATE(id), template),
  delete: (id: number) => api.delete(API_ENDPOINTS.TEMPLATES.DELETE(id)),
  search: (query: string, page: number = 0, size: number = 10) =>
    api.get(`${API_ENDPOINTS.TEMPLATES.SEARCH}?q=${query}&page=${page}&size=${size}`),
  preview: (id: number, data: any) => api.post(API_ENDPOINTS.TEMPLATES.PREVIEW(id), data),
};

// Messages API helpers
export const messagesApi = {
  sendText: (phoneNumber: string, message: string) =>
    api.post(`${API_ENDPOINTS.MESSAGES.SEND_TEXT}?phoneNumber=${phoneNumber}&message=${encodeURIComponent(message)}`),
  sendTemplate: (phoneNumber: string, templateId: number) =>
    api.post(`${API_ENDPOINTS.MESSAGES.SEND_TEMPLATE}?phoneNumber=${phoneNumber}&templateId=${templateId}`),
  sendBulk: (data: any) => api.post(API_ENDPOINTS.MESSAGES.SEND_BULK, data),
  getBulkCampaigns: () => api.get(API_ENDPOINTS.MESSAGES.BULK_CAMPAIGNS),
};

// Chatbots API helpers
export const chatbotsApi = {
  getAll: (page: number = 0, size: number = 50) =>
    api.get(`${API_ENDPOINTS.CHATBOTS.LIST}?page=${page}&size=${size}`),
  getById: (id: number) => api.get(API_ENDPOINTS.CHATBOTS.GET(id)),
  create: (chatbot: any) => api.post(API_ENDPOINTS.CHATBOTS.CREATE, chatbot),
  update: (id: number, chatbot: any) => api.put(API_ENDPOINTS.CHATBOTS.UPDATE(id), chatbot),
  delete: (id: number) => api.delete(API_ENDPOINTS.CHATBOTS.DELETE(id)),
  toggle: (id: number) => api.post(API_ENDPOINTS.CHATBOTS.TOGGLE(id)),
  trigger: (id: number, phoneNumber: string, message: string) =>
    api.post(`${API_ENDPOINTS.CHATBOTS.TRIGGER(id)}?phoneNumber=${phoneNumber}&message=${encodeURIComponent(message)}`),
  getStatistics: () => api.get(API_ENDPOINTS.CHATBOTS.STATISTICS),
};

// Users API helpers
export const usersApi = {
  getAll: (page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDir: string = 'desc') =>
    api.get(`${API_ENDPOINTS.USERS.LIST}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  getById: (id: number) => api.get(API_ENDPOINTS.USERS.GET(id)),
  create: (user: any) => api.post(API_ENDPOINTS.USERS.CREATE, user),
  update: (id: number, user: any) => api.put(API_ENDPOINTS.USERS.UPDATE(id), user),
  delete: (id: number) => api.delete(API_ENDPOINTS.USERS.DELETE(id)),
  toggleStatus: (id: number) => api.post(API_ENDPOINTS.USERS.TOGGLE_STATUS(id)),
  resetPassword: (id: number) => api.post(API_ENDPOINTS.USERS.RESET_PASSWORD(id)),
  getStatistics: () => api.get(API_ENDPOINTS.USERS.STATISTICS),
};

// Settings API helpers
export const settingsApi = {
  get: () => api.get(API_ENDPOINTS.SETTINGS.GET),
  update: (settings: any) => api.put(API_ENDPOINTS.SETTINGS.UPDATE, settings),
  getHealth: () => api.get(API_ENDPOINTS.SETTINGS.HEALTH),
};

// Conversations API helpers
export const conversationsApi = {
  getAll: (page: number = 0, size: number = 20, filters: any = {}) => {
    const params = buildQueryString({
      page,
      size,
      ...filters
    });
    return api.get(`/conversations?${params}`);
  },
  getById: (id: number) => api.get(`/conversations/${id}`),
  create: (data: any) => api.post('/conversations', data),
  update: (id: number, data: any) => api.put(`/conversations/${id}`, data),
  delete: (id: number) => api.delete(`/conversations/${id}`),
  getMessages: (id: number, page: number = 0, size: number = 50) =>
    api.get(`/conversations/${id}/messages?page=${page}&size=${size}`),
  sendMessage: (id: number, data: any) => api.post(`/conversations/${id}/messages`, data),
  updateStatus: (id: number, status: string) => api.patch(`/conversations/${id}/status`, { status }),
  assignAgent: (id: number, agentId: number) => api.patch(`/conversations/${id}/assign`, { agentId }),
};

// Contacts API helpers
export const contactsApi = {
  getAll: (page: number = 0, size: number = 20, filters: any = {}) => {
    const params = buildQueryString({
      page,
      size,
      ...filters
    });
    return api.get(`/contacts?${params}`);
  },
  getById: (id: number) => api.get(`/contacts/${id}`),
  create: (data: any) => api.post('/contacts', data),
  update: (id: number, data: any) => api.put(`/contacts/${id}`, data),
  delete: (id: number) => api.delete(`/contacts/${id}`),
  search: (query: string) => api.get(`/contacts/search?q=${encodeURIComponent(query)}`),
  updateStatus: (id: number, status: string) => api.patch(`/contacts/${id}/status`, { status }),
  addTags: (id: number, tags: string[]) => api.post(`/contacts/${id}/tags`, { tags }),
  removeTags: (id: number, tags: string[]) => api.delete(`/contacts/${id}/tags`, { data: { tags } }),
  getConversations: (id: number, page: number = 0, size: number = 20) =>
    api.get(`/contacts/${id}/conversations?page=${page}&size=${size}`),
};

// Health check
export const healthApi = {
  check: () => api.get(API_ENDPOINTS.HEALTH),
};

// ============================================================================
// Export Default
// ============================================================================

export default api;
