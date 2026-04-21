'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { slideUpVariants, containerVariants, itemVariants } from '@/lib/animations';
import { ParticleBackdrop } from '@/components/ParticleBackdrop';

const words = ['Realtime', 'Trust', 'Detection'];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-8 min-h-screen flex flex-col justify-center">
      <div className="hero-gradient pointer-events-none absolute inset-0" aria-hidden="true" />
      <ParticleBackdrop />

      {/* Video Background */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-0 right-0 h-150 z-0 overflow-hidden"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40 mix-blend-screen absolute inset-0"
          style={{ background: 'transparent' }}
        >
          <source src="/VeriGraph_AI_Trust_Your_Data.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-surface-0/30 to-surface-0 pointer-events-none" />
      </motion.div>

      <div className="relative mx-auto w-full max-w-7xl z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex rounded-full border border-primary-500/40 bg-surface-1/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-text-secondary backdrop-blur-sm"
        >
          🎬 Coordinated Misinformation Radar
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-12 max-w-5xl text-5xl sm:text-6xl xl:text-display font-bold leading-tight text-text-primary"
        >
          <span className="inline-block rounded-2xl bg-surface-0/80 px-4 py-1 text-white shadow-lg shadow-black/40 backdrop-blur-sm">
            VeriGraph AI:
          </span>
          <span className="block mt-4">
            {' '}
            <span className="inline-flex flex-wrap gap-3 mt-4">
              {words.map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.12, duration: 0.5 }}
                  className="rounded-md bg-linear-to-r from-primary-500/30 to-secondary-500/20 px-4 py-2 text-primary-200 font-bold border border-primary-500/50 backdrop-blur-md shadow-lg shadow-primary-600/20"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 max-w-3xl text-body sm:text-lg leading-relaxed text-text-secondary"
        >
          Hybrid intelligence across{' '}
          <span className="text-primary-500 font-semibold">language semantics</span>,{' '}
          <span className="text-success font-semibold">account networks</span>, and{' '}
          <span className="text-secondary-500 font-semibold">fact verification</span>. Built to show judges real impact in one glance.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/analysis">
              <Button size="lg" variant="primary" className="gap-2">
                <span>⚡</span> Launch Live Dashboard
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/deepfake">
              <Button size="lg" variant="secondary" className="gap-2">
                <span>🎥</span> Deepfake Detection
              </Button>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a href="#features">
              <Button size="lg" variant="outline" className="gap-2">
                <span>↓</span> Explore Features
              </Button>
            </a>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-3 gap-4 sm:gap-8"
        >
          {[
            { label: 'Analysis Layers', value: '3' },
            { label: 'Data Sources', value: '1000+' },
            { label: 'Real-time Processing', value: '99.9%' },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <div className="rounded-md border border-border-light bg-surface-1/50 p-4 sm:p-6 backdrop-blur-sm hover:bg-surface-1 hover:border-border-lighter transition-all duration-300 group">
                <p className="text-2xl sm:text-3xl font-bold text-primary-600 group-hover:text-primary-400 transition-colors">
                  {stat.value}
                </p>
                <p className="text-caption sm:text-body-sm text-text-tertiary mt-2">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
