/**
 * Login Page
 * User authentication page with form validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert } from '@/components/ui/Alert';
import toast from 'react-hot-toast';

// ============================================================================
// Validation Schema
// ============================================================================

const loginSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, 'Username or email is required')
    .max(255, 'Username or email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(255, 'Password is too long'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// Component
// ============================================================================

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, error, clearError } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
      rememberMe: false,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Focus on first input
  useEffect(() => {
    setFocus('usernameOrEmail');
  }, [setFocus]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearError();

    try {
      await login(data);
      toast.success('Login successful!');
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials
  const demoCredentials = [
    { label: 'Admin Account', username: 'admin@whatsappcrm.com', password: 'Admin@123' },
    { label: 'Team Member (Sarah)', username: 'sarah.johnson@whatsappcrm.com', password: 'Sarah@123' },
  ];

  const fillDemoCredentials = (username: string, password: string) => {
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      (form.elements.namedItem('usernameOrEmail') as HTMLInputElement).value = username;
      (form.elements.namedItem('password') as HTMLInputElement).value = password;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and Title */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-whatsapp-500 flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Sign in to WhatsApp CRM
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage your customer conversations efficiently
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mt-6">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <div>
                <h4 className="font-medium">Authentication Error</h4>
                <p className="text-sm">{error}</p>
              </div>
            </Alert>
          )}

          {/* Login Form */}
          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Username/Email Field */}
              <div>
                <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
                  Username or Email
                </label>
                <div className="mt-1">
                  <Input
                    id="usernameOrEmail"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter your username or email"
                    error={errors.usernameOrEmail?.message || ''}
                    {...register('usernameOrEmail')}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    error={errors.password?.message || ''}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="rememberMe"
                    {...register('rememberMe')}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-whatsapp-600 hover:text-whatsapp-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading || isSubmitting}
                >
                  {isLoading || isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {demoCredentials.map((demo, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoCredentials(demo.username, demo.password)}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">{demo.label}</span>
                    <span className="ml-2 text-gray-500">({demo.username})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-whatsapp-600 hover:text-whatsapp-500"
                >
                  Contact your administrator
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-whatsapp-500 to-whatsapp-700">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative h-full flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-md text-center">
              <h1 className="text-4xl font-bold mb-6">
                Professional WhatsApp CRM
              </h1>
              <p className="text-xl text-whatsapp-100 mb-8">
                Streamline your customer communications with our enterprise-grade WhatsApp management platform.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Multi-User Support</div>
                  <div className="text-whatsapp-100">Team collaboration</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Real-time Analytics</div>
                  <div className="text-whatsapp-100">Performance insights</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Automated Workflows</div>
                  <div className="text-whatsapp-100">Smart automation</div>
                </div>
                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="font-semibold">Secure & Compliant</div>
                  <div className="text-whatsapp-100">Enterprise security</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
