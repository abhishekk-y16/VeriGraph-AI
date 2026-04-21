'use client';

import React from 'react';

interface FocusRingProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isActive?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'success';
}

const focusColors = {
  primary: 'focus-within:ring-primary-600',
  secondary: 'focus-within:ring-secondary-500',
  error: 'focus-within:ring-error',
  success: 'focus-within:ring-success',
};

/**
 * FocusRing Component
 * Wraps interactive elements to provide consistent focus states
 * Use this to ensure keyboard navigation is always visible
 */
export const FocusRing = React.forwardRef<HTMLDivElement, FocusRingProps>(
  ({ children, isActive, color = 'primary', className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`outline-none transition-all duration-300 ease-in-out ${
          isActive ? 'ring-2 ring-offset-2 ring-offset-surface-1 ring-primary-600' : ''
        } focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-surface-1 ${focusColors[color]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FocusRing.displayName = 'FocusRing';

export default FocusRing;
