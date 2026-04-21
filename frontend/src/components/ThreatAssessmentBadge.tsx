'use client';

import { motion } from 'framer-motion';
import type { RiskLevel } from '@/types/analysis';

interface ThreatAssessmentBadgeProps {
  riskLevel: RiskLevel;
  score: number;
}

export function ThreatAssessmentBadge({ riskLevel, score }: ThreatAssessmentBadgeProps) {
  const getThreatInfo = (risk: RiskLevel) => {
    switch (risk) {
      case 'Low':
        return {
          label: 'LOW RISK',
          icon: '✓',
          color: 'success',
          bgGradient: 'from-emerald-600/30 via-green-500/20 to-teal-400/10',
          borderColor: 'border-emerald-500/60',
          textColor: 'text-emerald-400',
          labelColor: 'text-green-300',
          glowColor: '#10b981',
          shadowColor: 'emerald',
          accentGradient: 'from-green-400 to-emerald-500',
        };
      case 'Medium':
      case 'Inconclusive':
        return {
          label: 'MEDIUM RISK',
          icon: '⚠',
          color: 'warning',
          bgGradient: 'from-amber-600/30 via-yellow-500/20 to-orange-400/10',
          borderColor: 'border-amber-500/60',
          textColor: 'text-amber-400',
          labelColor: 'text-yellow-300',
          glowColor: '#f59e0b',
          shadowColor: 'amber',
          accentGradient: 'from-yellow-400 to-amber-500',
        };
      case 'High':
        return {
          label: 'HIGH RISK',
          icon: '✕',
          color: 'error',
          bgGradient: 'from-red-600/30 via-rose-500/20 to-pink-400/10',
          borderColor: 'border-red-500/60',
          textColor: 'text-red-400',
          labelColor: 'text-pink-300',
          glowColor: '#ef4444',
          shadowColor: 'red',
          accentGradient: 'from-red-400 to-rose-500',
        };
      default:
        return {
          label: 'UNKNOWN',
          icon: '?',
          color: 'tertiary',
          bgGradient: 'from-slate-600/30 via-slate-500/20 to-slate-400/10',
          borderColor: 'border-slate-500/60',
          textColor: 'text-slate-400',
          labelColor: 'text-slate-300',
          glowColor: '#64748b',
          shadowColor: 'slate',
          accentGradient: 'from-slate-400 to-slate-500',
        };
    }
  };

  const threat = getThreatInfo(riskLevel);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="relative group"
    >
      {/* Animated glow background */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-2xl opacity-40"
        style={{ backgroundColor: threat.glowColor }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Main card */}
      <div
        className={`relative bg-gradient-to-br ${threat.bgGradient} border-2 ${threat.borderColor} rounded-2xl p-10 text-center backdrop-blur-md`}
        style={{
          boxShadow: `0 0 60px ${threat.glowColor}30, 0 8px 32px rgba(0,0,0,0.2)`,
        }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Icon with gradient background */}
          <motion.div className="relative">
            {/* Icon background circle */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${threat.accentGradient} blur-lg opacity-50`}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Icon */}
            <motion.div
              className={`relative text-6xl font-bold ${threat.textColor}`}
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
              whileHover={{ scale: 1.15 }}
            >
              {threat.icon}
            </motion.div>
          </motion.div>

          {/* Label with gradient */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <h3 className={`text-heading2 font-black tracking-wider bg-gradient-to-r ${threat.accentGradient} bg-clip-text text-transparent`}>
              {threat.label}
            </h3>
          </motion.div>

          {/* Divider line */}
          <motion.div
            className={`h-1 w-24 rounded-full bg-gradient-to-r ${threat.accentGradient}`}
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />

          {/* Score Context with glow */}
          <motion.div
            className="flex items-baseline gap-2 bg-gradient-to-r bg-clip-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <motion.span
              className={`text-5xl font-black bg-gradient-to-r ${threat.accentGradient} bg-clip-text text-transparent`}
              whileHover={{ scale: 1.1 }}
            >
              {score}
            </motion.span>
            <span className={`text-body-sm font-semibold ${threat.labelColor}`}>/100</span>
          </motion.div>

          <motion.span className={`text-body-xs font-medium ${threat.labelColor} opacity-80`}>
            THREAT SCORE
          </motion.span>

          {/* Subtext */}
          <motion.p
            className={`text-body-sm font-medium max-w-md leading-relaxed ${threat.labelColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            {riskLevel === 'Low' && 'This claim exhibits characteristics typical of factual information.'}
            {riskLevel === 'Medium' && 'This claim shows mixed signals and requires further verification.'}
            {riskLevel === 'Inconclusive' && 'Insufficient data. Multiple factors present contradictory signals.'}
            {riskLevel === 'High' && 'This claim shows strong indicators of misinformation or propaganda.'}
          </motion.p>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-transparent pointer-events-none"
          style={{
            borderImage: `linear-gradient(45deg, ${threat.glowColor}, transparent, ${threat.glowColor}) 1`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
