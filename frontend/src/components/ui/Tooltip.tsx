'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, side = 'top', delay = 500 }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
      const id = setTimeout(() => setIsVisible(true), delay);
      setTimeoutId(id);
    };

    const handleMouseLeave = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setIsVisible(false);
    };

    const positionClasses = {
      top: '-top-12 left-1/2 -translate-x-1/2',
      bottom: 'top-12 left-1/2 -translate-x-1/2',
      left: 'left-0 top-1/2 -translate-y-1/2 -translate-x-12',
      right: 'right-0 top-1/2 -translate-y-1/2 translate-x-12',
    };

    return (
      <div
        ref={ref}
        className="relative inline-flex"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute ${positionClasses[side]} pointer-events-none z-50 whitespace-nowrap`}
            >
              <div className="bg-surface-0 text-text-primary text-caption px-3 py-2 rounded-sm shadow-lg border border-border-light">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
