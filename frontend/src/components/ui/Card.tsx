'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg border border-border-default bg-surface-1 shadow-md transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105',
  {
    variants: {
      variant: {
        default: 'border-border-default',
        elevated: 'border-border-light shadow-lg',
        ghost: 'border-transparent bg-transparent shadow-none hover:shadow-none hover:scale-100',
        interactive: 'cursor-pointer hover:bg-surface-2 hover:shadow-lg hover:scale-102',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  isHoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant, padding, children, isHoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({
          variant: isHoverable ? 'interactive' : variant,
          padding,
          className,
        })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents for structured content
export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`pb-4 border-b border-border-default ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(({ className = '', ...props }, ref) => (
  <h3 ref={ref} className={`text-heading3 font-semibold text-text-primary ${className}`} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p ref={ref} className={`text-body-sm text-text-secondary ${className}`} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`py-4 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`pt-4 border-t border-border-default flex gap-2 justify-end ${className}`} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export default Card;
