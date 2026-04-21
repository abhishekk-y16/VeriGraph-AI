'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { slideUpVariants } from '@/lib/animations';

interface FeatureCardProps {
  title: string;
  description: string;
  accent?:string;
  icon?: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <motion.div variants={slideUpVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
      <Card
        variant="interactive"
        padding="lg"
        className="group relative overflow-hidden h-full flex flex-col"
      >
        {/* Accent gradient background */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-10 blur-3xl bg-gradient-to-br from-primary-500 to-secondary-500" />

        {/* Icon */}
        {icon && (
          <div className="mb-4 h-12 w-12 rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 flex items-center justify-center text-white text-xl">
            {icon}
          </div>
        )}

        {/* Title */}
        <h3 className="text-heading4 font-semibold text-text-primary mb-2">{title}</h3>

        {/* Sparkline visualization */}
        <svg viewBox="0 0 200 80" className="w-full h-12 my-4 opacity-60" aria-hidden="true">
          <defs>
            <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(37, 99, 235, 0.5)" />
              <stop offset="100%" stopColor="rgba(245, 158, 11, 0.5)" />
            </linearGradient>
          </defs>
          <polyline
            points="0,40 10,30 20,35 30,25 40,30 50,20 60,30 70,25 80,35 90,30 100,40 110,35 120,45 130,40 140,50 150,45 160,55 170,50 180,60 190,55 200,60"
            fill="none"
            stroke="url(#sparkGradient)"
            strokeWidth="2"
          />
        </svg>

        {/* Description */}
        <p className="text-body-sm text-text-secondary leading-relaxed flex-1">{description}</p>

        {/* Footer label */}
        <div className="mt-6 pt-4 border-t border-border-default text-caption font-medium uppercase tracking-widest text-primary-600">
          Interactive Module
        </div>
      </Card>
    </motion.div>
  );
}
