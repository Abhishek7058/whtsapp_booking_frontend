/**
 * API Response Types - Matching Backend DTOs
 * These types correspond to the Spring Boot backend API responses
 */

// ============================================================================
// Base API Response Structure
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  errorCode?: string;
  timestamp: string;
  path?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OnlineStatusRequest {
  isOnline: boolean;
}

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'ADMIN' | 'TEAM_MEMBER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  profilePictureUrl?: string;
  department?: string;
  jobTitle?: string;
  isOnline?: boolean;
  lastLoginAt?: string;
  phoneNumber?: string;
  maxConcurrentChats?: number;
  skills?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  maxConcurrentChats?: number;
  skills?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  profilePictureUrl?: string;
  maxConcurrentChats?: number;
  skills?: string;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  status: UserStatus;
}

// ============================================================================
// Contact Types
// ============================================================================

export type ContactStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Contact {
  id: number;
  phoneNumber: string;
  name?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  profilePictureUrl?: string;
  status: ContactStatus;
  source?: string;
  languageCode?: string;
  timezone?: string;
  notes?: string;
  tags?: string[];
  lastMessageAt?: string;
  assignedAgentId?: number;
  assignedAgent?: UserInfo;
  leadScore?: number;
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContactRequest {
  phoneNumber: string;
  name?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  source?: string;
  languageCode?: string;
  timezone?: string;
  notes?: string;
  tags?: string[];
  assignedAgentId?: number;
  customFields?: Record<string, any>;
}

export interface UpdateContactRequest {
  name?: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  profilePictureUrl?: string;
  status?: ContactStatus;
  languageCode?: string;
  timezone?: string;
  notes?: string;
  tags?: string[];
  assignedAgentId?: number;
  customFields?: Record<string, any>;
}

// ============================================================================
// Conversation Types
// ============================================================================

export type ConversationStatus = 'OPEN' | 'ASSIGNED' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type ConversationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Conversation {
  id: number;
  contactId: number;
  contact?: Contact;
  status: ConversationStatus;
  subject?: string;
  lastMessageAt?: string;
  unreadCount: number;
  assignedAgentId?: number;
  assignedAgent?: UserInfo;
  priority: ConversationPriority;
  resolutionTimeMinutes?: number;
  firstResponseTimeMinutes?: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateConversationRequest {
  contactId: number;
  subject?: string;
  assignedAgentId?: number;
  priority?: ConversationPriority;
  notes?: string;
}

export interface UpdateConversationRequest {
  status?: ConversationStatus;
  subject?: string;
  assignedAgentId?: number;
  priority?: ConversationPriority;
  notes?: string;
}

// ============================================================================
// Message Types
// ============================================================================

export type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contact' | 'sticker';
export type MessageDirection = 'INCOMING' | 'OUTGOING';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface IncomingMessage {
  id: number;
  whatsappMessageId?: string;
  fromNumber: string;
  messageContent?: string;
  messageType: MessageType;
  timestamp: string;
  processed: boolean;
  processedAt?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaCaption?: string;
  mediaFilename?: string;
  mediaFileSize?: number;
  locationLatitude?: number;
  locationLongitude?: number;
  locationName?: string;
  locationAddress?: string;
  contactId?: number;
  contact?: Contact;
  conversationId?: number;
  conversation?: Conversation;
  sentimentScore?: number;
  sentimentLabel?: string;
  detectedIntent?: string;
  intentConfidence?: number;
  createdAt: string;
}

export interface OutgoingMessage {
  id: number;
  toNumber: string;
  messageContent?: string;
  messageType: MessageType;
  status: MessageStatus;
  whatsappMessageId?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaCaption?: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  errorMessage?: string;
  contactId?: number;
  contact?: Contact;
  conversationId?: number;
  conversation?: Conversation;
  sentByUserId?: number;
  sentByUser?: UserInfo;
  createdAt: string;
  updatedAt?: string;
}

export interface SendMessageRequest {
  toNumber: string;
  messageType: MessageType;
  messageContent?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  templateName?: string;
  templateLanguage?: string;
  templateParameters?: string[];
  conversationId?: number;
  scheduledAt?: string;
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface DashboardStats {
  totalContacts: number;
  totalConversations: number;
  openConversations: number;
  assignedConversations: number;
  totalMessages: number;
  messagesLast24h: number;
  onlineAgents: number;
  totalAgents: number;
  averageResponseTime: number;
  recentActivity: number;
}

export interface MessageStatistics {
  status: string;
  count: number;
}

export interface ConversationAnalytics {
  date: string;
  totalConversations: number;
  resolvedConversations: number;
  averageResolutionTime: number;
  averageResponseTime: number;
}

export interface AgentPerformance {
  agentId: number;
  agentName: string;
  totalConversations: number;
  resolvedConversations: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  customerSatisfactionScore: number;
}

// ============================================================================
// WebSocket Types
// ============================================================================

export interface WebSocketMessage {
  type: 'NEW_MESSAGE' | 'CONVERSATION_UPDATE' | 'USER_STATUS' | 'TYPING' | 'NOTIFICATION';
  data: any;
  timestamp: string;
}

export interface TypingIndicator {
  conversationId: number;
  userId: number;
  isTyping: boolean;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ============================================================================
// Filter & Search Types
// ============================================================================

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  isOnline?: boolean;
}

export interface ContactFilters {
  search?: string;
  status?: ContactStatus;
  assignedAgentId?: number;
  tags?: string[];
  source?: string;
  hasUnreadMessages?: boolean;
}

export interface ConversationFilters {
  search?: string;
  status?: ConversationStatus;
  priority?: ConversationPriority;
  assignedAgentId?: number;
  contactId?: number;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  message: string;
  errorCode?: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
  rejectedValue?: any;
}

// ============================================================================
// Utility Types
// ============================================================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}
