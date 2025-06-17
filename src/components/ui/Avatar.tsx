/**
 * Avatar Component
 * User avatar component with fallback support
 */

import React from 'react';
import Image from 'next/image';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================================================
// Avatar Variants
// ============================================================================

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const avatarFallbackVariants = cva(
  'flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

// ============================================================================
// Types
// ============================================================================

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  showOnlineIndicator?: boolean;
  isOnline?: boolean;
}

// ============================================================================
// Component
// ============================================================================

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    size, 
    src, 
    alt, 
    fallback,
    showOnlineIndicator = false,
    isOnline = false,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    const showImage = src && !imageError;
    const showFallback = !showImage || !imageLoaded;

    // Generate fallback text from alt or fallback prop
    const fallbackText = fallback || (alt ? alt.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?');

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, className }))}
        {...props}
      >
        {/* Image */}
        {showImage && (
          <Image
            src={src}
            alt={alt || 'Avatar'}
            fill
            className={cn(
              'object-cover transition-opacity duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}

        {/* Fallback */}
        {showFallback && (
          <div className={cn(avatarFallbackVariants({ size }))}>
            {fallbackText}
          </div>
        )}

        {/* Online Indicator */}
        {showOnlineIndicator && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white',
              isOnline ? 'bg-green-400' : 'bg-gray-400',
              size === 'xs' && 'h-2 w-2',
              size === 'sm' && 'h-2.5 w-2.5',
              size === 'default' && 'h-3 w-3',
              size === 'lg' && 'h-3.5 w-3.5',
              size === 'xl' && 'h-4 w-4',
              size === '2xl' && 'h-5 w-5'
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// ============================================================================
// Avatar Group Component
// ============================================================================

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: VariantProps<typeof avatarVariants>['size'];
  className?: string;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({
  children,
  max = 3,
  size = 'default',
  className,
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-white rounded-full">
          {React.cloneElement(child as React.ReactElement, { size })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="ring-2 ring-white rounded-full">
          <div className={cn(avatarFallbackVariants({ size }))}>
            +{remainingCount}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export { Avatar, AvatarGroup, avatarVariants };
export type { AvatarProps };
