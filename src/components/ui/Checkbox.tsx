/**
 * Checkbox Component
 * Accessible checkbox component with custom styling
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    className, 
    label,
    description,
    error,
    indeterminate = false,
    id,
    ...props 
  }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = Boolean(error);

    // Handle indeterminate state
    React.useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div className="space-y-1">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className={cn(
                'h-4 w-4 rounded border-gray-300 text-whatsapp-600 focus:ring-whatsapp-500 focus:ring-offset-0',
                hasError && 'border-error-500 focus:ring-error-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className
              )}
              {...props}
            />
          </div>
          
          {(label || description) && (
            <div className="flex-1 min-w-0">
              {label && (
                <label 
                  htmlFor={checkboxId}
                  className={cn(
                    'block text-sm font-medium cursor-pointer',
                    hasError ? 'text-error-700' : 'text-gray-700',
                    props.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {label}
                </label>
              )}
              
              {description && (
                <p className={cn(
                  'text-sm',
                  hasError ? 'text-error-600' : 'text-gray-500'
                )}>
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-error-600 ml-7">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================================================
// Checkbox Group Component
// ============================================================================

interface CheckboxGroupProps {
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  className?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  children,
  label,
  description,
  error,
  className,
}) => {
  const hasError = Boolean(error);

  return (
    <fieldset className={cn('space-y-3', className)}>
      {label && (
        <legend className={cn(
          'text-sm font-medium',
          hasError ? 'text-error-700' : 'text-gray-700'
        )}>
          {label}
        </legend>
      )}
      
      {description && (
        <p className={cn(
          'text-sm',
          hasError ? 'text-error-600' : 'text-gray-500'
        )}>
          {description}
        </p>
      )}
      
      <div className="space-y-2">
        {children}
      </div>
      
      {error && (
        <p className="text-sm text-error-600">
          {error}
        </p>
      )}
    </fieldset>
  );
};

// ============================================================================
// Exports
// ============================================================================

export { Checkbox, CheckboxGroup };
export type { CheckboxProps };
