'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white',
        secondary: 'bg-secondary-500 text-white',
        success: 'bg-success text-white',
        error: 'bg-error text-white',
        warning: 'bg-warning text-white',
        info: 'bg-info text-white',
        outline: 'border border-border-light text-text-secondary bg-surface-1',
        ghost: 'bg-surface-2 text-text-secondary',
      },
      size: {
        sm: 'text-caption px-2 py-0.5',
        md: 'text-label-sm px-3 py-1',
        lg: 'text-body-sm px-4 py-1.5',
      },
      animated: {
        true: 'hover:scale-105',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      animated: false,
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant, size, animated, children, icon, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={badgeVariants({ variant, size, animated, className })}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-1 flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-200"
            aria-label="Remove badge"
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
