'use client';

import { useEffect, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { Card } from '@/components/ui';

interface ScoreDisplayProps {
  score: number;
  riskLevel: string;
  resultStatus?: 'final' | 'inconclusive';
  confidence?: number;
}

function getTone(score: number, resultStatus?: 'final' | 'inconclusive') {
  if (resultStatus === 'inconclusive') return '#3B82F6'; // info blue
  if (score >= 70) return '#EF4444'; // error red
  if (score >= 40) return '#F59E0B'; // warning amber
  return '#10B981'; // success green
}

export function ScoreDisplay({ score, riskLevel, resultStatus = 'final', confidence }: ScoreDisplayProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (latest) => setAnimatedScore(Math.round(latest)),
    });

    return () => controls.stop();
  }, [score]);

  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, animatedScore));
  const strokeDashoffset = circumference * (1 - progress / 100);
  const tone = getTone(score, resultStatus);
  const confidencePct = confidence === undefined ? null : Math.round(confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <Card className="overflow-hidden" style={{ boxShadow: `0 0 40px ${tone}20, var(--shadow-lg)` }}>
        <div className="p-8">
          <div className="text-label font-semibold text-text-tertiary uppercase mb-8">Threat Assessment</div>

          <div className="flex flex-wrap items-center gap-12">
            <motion.div
              className="relative h-52 w-52 shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 rounded-full blur-xl opacity-20" style={{ backgroundColor: tone }} />
              <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 relative z-10">
                <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={tone}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 160ms linear' }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-text-primary">{animatedScore}</p>
                  <p className="text-caption text-text-tertiary uppercase tracking-wide mt-1">/ 100</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-6 flex-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-baseline gap-3">
                <motion.span
                  className="text-6xl font-bold tracking-tight"
                  style={{ color: tone }}
                  key={animatedScore}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {animatedScore}
                </motion.span>
                <span className="text-body text-text-tertiary font-medium">/100</span>
              </div>

              <div className="space-y-4 border-t border-border-default pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-body-sm font-medium text-text-secondary">Risk Level</span>
                  <div
                    className="px-3 py-1.5 rounded-sm text-body-sm font-semibold border"
                    style={{
                      backgroundColor: `${tone}15`,
                      color: tone,
                      borderColor: `${tone}40`,
                    }}
                  >
                    {riskLevel}
                  </div>
                </div>

                {resultStatus === 'inconclusive' ? (
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-text-secondary">Status</span>
                    <span className="text-warning font-medium">⚠ Inconclusive</span>
                  </div>
                ) : null}

                {confidencePct !== null ? (
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-medium text-text-secondary">Confidence</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-surface-2 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: tone }}
                          initial={{ width: 0 }}
                          animate={{ width: `${confidencePct}%` }}
                          transition={{ delay: 1, duration: 0.8 }}
                        />
                      </div>
                      <span className="text-body-sm font-semibold" style={{ color: tone }}>
                        {confidencePct}%
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
