# 🚀 **WhatsApp CRM Frontend - Next.js TypeScript Application**

[![Next.js](https://img.shields.io/badge/Next.js-14.0+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3+-38B2AC.svg)](https://tailwindcss.com/)
[![React Query](https://img.shields.io/badge/React%20Query-5.14+-FF4154.svg)](https://tanstack.com/query)

A **professional-grade frontend application** for the WhatsApp CRM system, built with Next.js 14, TypeScript, and Tailwind CSS. Features enterprise-level authentication, real-time messaging, comprehensive user management, and responsive design.

## 📋 **Table of Contents**

- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🎨 UI Components](#-ui-components)
- [🔐 Authentication](#-authentication)
- [📊 State Management](#-state-management)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)

## 🌟 **Features**

### **🔐 Enterprise Authentication**
- **JWT-based Authentication** with automatic token refresh
- **Role-based Access Control** (Admin/Team Member)
- **Session Management** with activity tracking
- **Multi-tab Support** with synchronized logout
- **Remember Me** functionality

### **💬 Real-time Messaging**
- **Live Conversation Updates** via WebSocket
- **Typing Indicators** and read receipts
- **Message Threading** with conversation context
- **Media Support** (images, documents, audio, video)
- **Message Search** and filtering

### **👥 User Management**
- **Comprehensive User Profiles** with role management
- **Team Performance Analytics** and metrics
- **Online Status Tracking** and availability
- **Bulk Operations** for user management
- **Activity Logging** and audit trails

### **📊 Advanced Dashboard**
- **Real-time Metrics** and KPI tracking
- **Interactive Charts** with drill-down capabilities
- **Customizable Widgets** and layout
- **Export Functionality** for reports
- **Mobile-responsive Design**

### **🎨 Modern UI/UX**
- **Responsive Design** for all screen sizes
- **Dark/Light Theme** support
- **Accessibility Compliant** (WCAG 2.1)
- **Smooth Animations** and transitions
- **Professional Design System**

## 🏗️ **Architecture**

### **Technology Stack**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS 3.3+
- **State Management**: Zustand with Immer
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Radix UI + Custom components
- **Icons**: Heroicons + Lucide React
- **Testing**: Jest + React Testing Library
- **Build Tool**: Next.js built-in bundler

### **Key Patterns**
- **Component-driven Development** with Storybook
- **Type-safe API Integration** with TypeScript
- **Atomic Design Principles** for UI components
- **Custom Hooks** for business logic
- **Error Boundaries** for graceful error handling
- **Performance Optimization** with React.memo and useMemo

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18.0+ and npm 8.0+
- Backend API running on `http://localhost:8080`

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/whatsapp-crm-frontend.git
cd whatsapp-crm-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### **Environment Variables**

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=WhatsApp CRM
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080/ws
```

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript checks
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run storybook    # Start Storybook
```

## 📁 **Project Structure**

```
src/
├── 📁 app/                    # Next.js App Router pages
│   ├── 📁 auth/              # Authentication pages
│   │   ├── login/page.tsx    # Login page
│   │   └── layout.tsx        # Auth layout
│   ├── 📁 dashboard/         # Dashboard pages
│   │   ├── page.tsx          # Main dashboard
│   │   └── overview/         # Dashboard sections
│   ├── 📁 conversations/     # Conversation management
│   ├── 📁 contacts/          # Contact management
│   ├── 📁 admin/             # Admin-only pages
│   ├── layout.tsx            # Root layout
│   ├── loading.tsx           # Global loading UI
│   ├── error.tsx             # Global error UI
│   └── not-found.tsx         # 404 page
├── 📁 components/            # Reusable components
│   ├── 📁 ui/                # Base UI components
│   │   ├── Button.tsx        # Button component
│   │   ├── Input.tsx         # Input component
│   │   ├── Card.tsx          # Card component
│   │   └── ...               # Other UI components
│   ├── 📁 layout/            # Layout components
│   │   ├── DashboardLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── Sidebar.tsx
│   ├── 📁 features/          # Feature-specific components
│   │   ├── 📁 auth/          # Authentication components
│   │   ├── 📁 conversations/ # Conversation components
│   │   ├── 📁 contacts/      # Contact components
│   │   └── 📁 dashboard/     # Dashboard components
│   └── 📁 common/            # Common components
├── 📁 hooks/                 # Custom React hooks
│   ├── useAuth.ts            # Authentication hook
│   ├── useWebSocket.ts       # WebSocket hook
│   ├── useLocalStorage.ts    # Local storage hook
│   └── ...                   # Other custom hooks
├── 📁 lib/                   # Utility libraries
│   ├── api.ts                # API client configuration
│   ├── utils.ts              # Utility functions
│   ├── validations.ts        # Form validation schemas
│   └── constants.ts          # Application constants
├── 📁 services/              # API service layer
│   ├── auth.service.ts       # Authentication API
│   ├── user.service.ts       # User management API
│   ├── conversation.service.ts # Conversation API
│   ├── contact.service.ts    # Contact API
│   └── dashboard.service.ts  # Dashboard API
├── 📁 store/                 # State management
│   ├── auth.store.ts         # Authentication state
│   ├── conversation.store.ts # Conversation state
│   ├── ui.store.ts           # UI state
│   └── index.ts              # Store configuration
├── 📁 types/                 # TypeScript type definitions
│   ├── api.ts                # API response types
│   ├── auth.ts               # Authentication types
│   ├── user.ts               # User types
│   └── common.ts             # Common types
├── 📁 styles/                # Global styles
│   ├── globals.css           # Global CSS
│   └── components.css        # Component styles
└── 📁 config/                # Configuration files
    ├── database.ts           # Database configuration
    ├── auth.ts               # Auth configuration
    └── api.ts                # API configuration
```

## 🔧 **Configuration**

### **Tailwind CSS Configuration**
- **Custom Color Palette** with WhatsApp brand colors
- **Extended Spacing** and typography scales
- **Custom Animations** and transitions
- **Responsive Breakpoints** for all devices
- **Dark Mode Support** with class-based switching

### **TypeScript Configuration**
- **Strict Mode** enabled for type safety
- **Path Mapping** for clean imports
- **Custom Type Definitions** for API responses
- **Incremental Compilation** for faster builds

### **ESLint & Prettier**
- **Next.js Recommended** rules
- **TypeScript Integration** with type checking
- **Import Sorting** and organization
- **Consistent Code Formatting** across team

## 🎨 **UI Components**

### **Base Components**
- **Button** - Multiple variants and sizes
- **Input** - Form inputs with validation
- **Card** - Content containers
- **Modal** - Overlay dialogs
- **Dropdown** - Select menus
- **Toast** - Notification system

### **Complex Components**
- **DataTable** - Sortable, filterable tables
- **ConversationList** - Real-time conversation feed
- **UserProfile** - Comprehensive user cards
- **Dashboard** - Metric widgets and charts
- **FileUpload** - Drag-and-drop file handling

### **Layout Components**
- **DashboardLayout** - Main application layout
- **AuthLayout** - Authentication page layout
- **Sidebar** - Navigation sidebar
- **Header** - Top navigation bar

## 🔐 **Authentication**

### **Features**
- **JWT Token Management** with automatic refresh
- **Role-based Route Protection** 
- **Session Persistence** across browser sessions
- **Multi-tab Synchronization** for logout
- **Activity Tracking** for session management

### **Implementation**
```typescript
// Protected route example
import { withAuth } from '@/hoc/withAuth';

const ProtectedPage = () => {
  return <div>Protected content</div>;
};

export default withAuth(ProtectedPage, ['ADMIN']);
```

## 📊 **State Management**

### **Zustand Stores**
- **Auth Store** - User authentication state
- **Conversation Store** - Real-time conversation data
- **UI Store** - Application UI state
- **Notification Store** - Toast notifications

### **React Query Integration**
- **Server State Management** with caching
- **Optimistic Updates** for better UX
- **Background Refetching** for fresh data
- **Error Handling** with retry logic

## 🧪 **Testing**

### **Testing Strategy**
- **Unit Tests** for utility functions
- **Component Tests** with React Testing Library
- **Integration Tests** for user flows
- **E2E Tests** with Playwright (planned)

### **Running Tests**
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## 🚀 **Deployment**

### **Build Process**
```bash
npm run build            # Production build
npm run start            # Start production server
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment-specific Builds**
- **Development** - Hot reloading, debug tools
- **Staging** - Production build with debug info
- **Production** - Optimized build, error tracking

## 🎯 **Performance Optimizations**

- **Code Splitting** with dynamic imports
- **Image Optimization** with Next.js Image
- **Bundle Analysis** with webpack-bundle-analyzer
- **Caching Strategies** for API responses
- **Lazy Loading** for non-critical components

## 🤝 **Contributing**

1. **Fork** the repository
2. **Create** a feature branch
3. **Write** tests for new features
4. **Follow** the coding standards
5. **Submit** a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

*Professional WhatsApp CRM Frontend - Making customer communication beautiful and efficient.*
