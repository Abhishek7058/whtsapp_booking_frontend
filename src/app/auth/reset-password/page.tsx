/**
 * Reset Password Page
 * Password reset with token page
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';

// ============================================================================
// Schema & Types
// ============================================================================

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// Component
// ============================================================================

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const watchedPasswords = watch(['newPassword', 'confirmPassword']);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Invalid reset link');
      router.push('/auth/forgot-password');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPasswordWithToken(
        token,
        data.newPassword,
        data.confirmPassword
      );

      if (response.success) {
        setIsSuccess(true);
        toast.success(response.message || 'Password reset successfully');
      } else {
        toast.error(response.message || 'Failed to reset password');
      }

    } catch (error: any) {
      console.error('Password reset failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-whatsapp-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              
              {/* Success Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Password reset successful!
              </h1>
              
              {/* Success Message */}
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              
              {/* Sign In Button */}
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Sign in to your account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-whatsapp-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Invalid Reset Link
              </h1>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Button
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full"
              >
                Request new reset link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-50 to-whatsapp-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            {/* Logo */}
            <div className="mx-auto h-12 w-12 rounded-xl bg-whatsapp-500 flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-white" />
            </div>
            
            <CardTitle className="text-2xl font-bold text-gray-900">
              Reset your password
            </CardTitle>
            
            <p className="text-gray-600 mt-2">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password Field */}
              <div>
                <Input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                  error={errors.newPassword?.message}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              
              {/* Confirm Password Field */}
              <div>
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  }
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />
              </div>
              
              {/* Password Requirements */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Password requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={watchedPasswords[0]?.length >= 8 ? 'text-green-600' : ''}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(watchedPasswords[0] || '') ? 'text-green-600' : ''}>
                    • One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(watchedPasswords[0] || '') ? 'text-green-600' : ''}>
                    • One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(watchedPasswords[0] || '') ? 'text-green-600' : ''}>
                    • One number
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(watchedPasswords[0] || '') ? 'text-green-600' : ''}>
                    • One special character
                  </li>
                </ul>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading || !watchedPasswords[0] || !watchedPasswords[1]}
              >
                Reset password
              </Button>
            </form>
            
            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
