'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { transitions } from '@/lib/animations';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-sm transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 focus:ring-offset-surface-1',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 active:shadow-lg',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 active:shadow-lg',
        outline: 'border border-border-light text-text-secondary hover:bg-surface-2 hover:border-border-lighter active:bg-surface-2',
        ghost: 'text-primary-600 hover:bg-surface-2 active:bg-surface-2',
        danger: 'bg-error text-white hover:bg-red-700 active:bg-red-800 active:shadow-lg',
        success: 'bg-success text-white hover:bg-emerald-600 active:bg-emerald-700 active:shadow-lg',
      },
      size: {
        sm: 'h-8 px-3 text-label-sm',
        md: 'h-10 px-4 text-body-sm',
        lg: 'h-12 px-6 text-body',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant, size, fullWidth, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, fullWidth, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
