'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="sticky top-0 z-50 border-b border-border-default bg-surface-1/60 backdrop-blur-xl"
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-heading3 font-bold text-text-primary hover:text-primary-600 transition-colors duration-300"
        >
          <span className="text-2xl">◆</span>
          <span>VeriGraph</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-body-sm text-text-secondary">
          <a
            href="#features"
            className="transition-colors duration-300 hover:text-text-primary hover:border-b-2 hover:border-primary-600 pb-1"
          >
            Features
          </a>
          <Link
            href="/deepfake"
            className="transition-colors duration-300 hover:text-text-primary hover:border-b-2 hover:border-primary-600 pb-1"
          >
            Deepfake
          </Link>
          <a
            href="#about"
            className="transition-colors duration-300 hover:text-text-primary hover:border-b-2 hover:border-primary-600 pb-1"
          >
            About
          </a>
          <Link href="/analysis">
            <Button variant="secondary" size="md">
              Dashboard
            </Button>
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
