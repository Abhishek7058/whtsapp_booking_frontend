/**
 * Badge Component
 * Small status and labeling component
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Badge Variants
// ============================================================================

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80',
        secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80',
        destructive: 'border-transparent bg-error-500 text-white hover:bg-error-500/80',
        success: 'border-transparent bg-success-500 text-white hover:bg-success-500/80',
        warning: 'border-transparent bg-warning-500 text-white hover:bg-warning-500/80',
        outline: 'text-gray-950 border-gray-200 hover:bg-gray-100',
        whatsapp: 'border-transparent bg-whatsapp-500 text-white hover:bg-whatsapp-500/80',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ============================================================================
// Types
// ============================================================================

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

// ============================================================================
// Component
// ============================================================================

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant, 
    size,
    icon,
    removable = false,
    onRemove,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <span className="mr-1 flex-shrink-0">
            {React.cloneElement(icon as React.ReactElement, {
              className: cn('h-3 w-3', (icon as React.ReactElement).props?.className),
            })}
          </span>
        )}

        {/* Content */}
        <span>{children}</span>

        {/* Remove button */}
        {removable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'away' | 'busy' | 'active' | 'inactive' | 'pending' | 'completed' | 'failed';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, ...props }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'completed':
        return { variant: 'success' as const, text: status };
      case 'offline':
      case 'inactive':
        return { variant: 'secondary' as const, text: status };
      case 'away':
      case 'pending':
        return { variant: 'warning' as const, text: status };
      case 'busy':
      case 'failed':
        return { variant: 'destructive' as const, text: status };
      default:
        return { variant: 'secondary' as const, text: status };
    }
  };

  const { variant, text } = getStatusConfig(status);

  return (
    <Badge variant={variant} {...props}>
      {text}
    </Badge>
  );
};

// ============================================================================
// Notification Badge Component
// ============================================================================

interface NotificationBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
  showZero?: boolean;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  max = 99, 
  showZero = false,
  ...props 
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge variant="destructive" size="sm" {...props}>
      {displayCount}
    </Badge>
  );
};

// ============================================================================
// Priority Badge Component
// ============================================================================

interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, ...props }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'low':
        return { variant: 'secondary' as const, text: 'Low' };
      case 'normal':
        return { variant: 'outline' as const, text: 'Normal' };
      case 'high':
        return { variant: 'warning' as const, text: 'High' };
      case 'urgent':
        return { variant: 'destructive' as const, text: 'Urgent' };
      default:
        return { variant: 'secondary' as const, text: priority };
    }
  };

  const { variant, text } = getPriorityConfig(priority);

  return (
    <Badge variant={variant} {...props}>
      {text}
    </Badge>
  );
};

// ============================================================================
// Exports
// ============================================================================

export { Badge, StatusBadge, NotificationBadge, PriorityBadge, badgeVariants };
export type { BadgeProps, StatusBadgeProps, NotificationBadgeProps, PriorityBadgeProps };
