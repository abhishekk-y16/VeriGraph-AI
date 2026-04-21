'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { slideFromRightVariants } from '@/lib/animations';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastItemProps extends ToastMessage {
  onClose: (id: string) => void;
}

const variantStyles = {
  success: {
    bg: 'bg-success',
    icon: '✓',
    textColor: 'text-white',
  },
  error: {
    bg: 'bg-error',
    icon: '!',
    textColor: 'text-white',
  },
  warning: {
    bg: 'bg-warning',
    icon: '⚠',
    textColor: 'text-white',
  },
  info: {
    bg: 'bg-info',
    icon: 'i',
    textColor: 'text-white',
  },
};

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  title,
  description,
  variant,
  duration = 5000,
  action,
  onClose,
}) => {
  const style = variantStyles[variant];

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      variants={slideFromRightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`${style.bg} ${style.textColor} rounded-sm shadow-lg px-4 py-3 min-w-sm max-w-md flex items-start gap-3`}
    >
      <div className="flex-shrink-0 font-bold text-lg">{style.icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-body-sm">{title}</h3>
        {description && <p className="text-body-sm opacity-90 mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <button
            onClick={action.onClick}
            className="text-body-sm font-medium opacity-90 hover:opacity-100 transition-opacity"
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => onClose(id)}
          className="text-body-sm opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close toast"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-toast flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Toast store for global usage
class ToastStore {
  private listeners: ((toasts: ToastMessage[]) => void)[] = [];
  private toasts: ToastMessage[] = [];

  subscribe(listener: (toasts: ToastMessage[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  add(message: Omit<ToastMessage, 'id'>) {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastMessage = { ...message, id };
    this.toasts = [toast, ...this.toasts];
    this.notify();
    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  clear() {
    this.toasts = [];
    this.notify();
  }

  getToasts() {
    return this.toasts;
  }
}

export const toastStore = new ToastStore();

// Helper functions
export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    toastStore.add({ title, description, variant: 'success', duration }),
  error: (title: string, description?: string, duration?: number) =>
    toastStore.add({ title, description, variant: 'error', duration }),
  warning: (title: string, description?: string, duration?: number) =>
    toastStore.add({ title, description, variant: 'warning', duration }),
  info: (title: string, description?: string, duration?: number) =>
    toastStore.add({ title, description, variant: 'info', duration }),
  remove: (id: string) => toastStore.remove(id),
  clear: () => toastStore.clear(),
};

export default ToastContainer;
