'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full px-4 py-2.5 rounded-sm border border-border-default bg-surface-1 text-text-primary placeholder-text-muted transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
  {
    variants: {
      variant: {
        default: 'border-border-default focus:ring-primary-600',
        error: 'border-error focus:ring-error focus:border-error',
        success: 'border-success focus:ring-success focus:border-success',
        warning: 'border-warning focus:ring-warning focus:border-warning',
      },
      size: {
        sm: 'h-8 text-label-sm px-3',
        md: 'h-10 text-body-sm px-4',
        lg: 'h-12 text-body px-4',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed bg-surface-0',
        false: 'hover:border-border-light',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      disabled: false,
    },
  }
);

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'disabled' | 'size'>, VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className = '', variant, size, label, helperText, error, icon, fullWidth, disabled, ...props },
    ref
  ) => {
    const finalVariant = error ? 'error' : variant;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-body-sm font-medium text-text-primary mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={inputVariants({ variant: finalVariant, size, disabled: disabled || false, className })}
            disabled={disabled}
            {...props}
          />
          {icon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">{icon}</div>}
        </div>
        {error && <p className="text-error text-caption mt-1">{error}</p>}
        {helperText && !error && <p className="text-text-tertiary text-caption mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
