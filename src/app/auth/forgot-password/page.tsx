/**
 * Forgot Password Page
 * Password reset request page
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// Component
// ============================================================================

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const watchedEmail = watch('email');

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);

    try {
      const response = await authService.requestPasswordReset(data.email);

      if (response.success) {
        setEmailAddress(data.email);
        setIsEmailSent(true);
        toast.success(response.message || 'Password reset instructions sent to your email');
      } else {
        toast.error(response.message || 'Failed to send password reset email');
      }

    } catch (error: any) {
      console.error('Password reset request failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!emailAddress) return;

    setIsLoading(true);

    try {
      const response = await authService.requestPasswordReset(emailAddress);

      if (response.success) {
        toast.success(response.message || 'Password reset email sent again');
      } else {
        toast.error(response.message || 'Failed to resend email');
      }

    } catch (error: any) {
      console.error('Resend failed:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
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
                Check your email
              </h1>
              
              {/* Success Message */}
              <p className="text-gray-600 mb-6">
                We've sent password reset instructions to{' '}
                <span className="font-medium text-gray-900">{emailAddress}</span>
              </p>
              
              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-blue-900 mb-2">Next steps:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>
              
              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Resend email
                </Button>
                
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="ghost"
                  className="w-full"
                  leftIcon={<ArrowLeftIcon className="h-4 w-4" />}
                >
                  Back to login
                </Button>
              </div>
              
              {/* Help Text */}
              <p className="text-sm text-gray-500 mt-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button 
                  onClick={handleResendEmail}
                  className="text-whatsapp-600 hover:text-whatsapp-500 font-medium"
                  disabled={isLoading}
                >
                  try again
                </button>
              </p>
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
              Forgot your password?
            </CardTitle>
            
            <p className="text-gray-600 mt-2">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email address"
                  leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                  error={errors.email?.message || ''}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading || !watchedEmail}
              >
                Send reset instructions
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
            
            {/* Help Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Need help?</strong> Contact your system administrator or{' '}
                  <a 
                    href="mailto:support@whatsappcrm.com" 
                    className="text-whatsapp-600 hover:text-whatsapp-500"
                  >
                    support team
                  </a>{' '}
                  for assistance with password recovery.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
