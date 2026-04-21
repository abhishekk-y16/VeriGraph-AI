'use client';

import { motion } from 'framer-motion';
import { Card, Badge } from '@/components/ui';
import { slideUpVariants, containerVariants, itemVariants } from '@/lib/animations';
import type { LayerResult } from '@/types/analysis';

interface LayerBreakdownProps {
  layers: LayerResult[];
}

export function LayerBreakdown({ layers }: LayerBreakdownProps) {
  const statusTone = (status?: string) => {
    if (status === 'unavailable') return 'text-error bg-error/10';
    if (status === 'insufficient_evidence') return 'text-warning bg-warning/10';
    return 'text-info bg-info/10';
  };

  const statusLabel = (status?: string) => {
    if (status === 'unavailable') return 'Unavailable';
    if (status === 'insufficient_evidence') return 'Limited Evidence';
    return 'Available';
  };

  const evidenceEntries = (evidence?: Record<string, unknown>) => {
    if (!evidence) {
      return [] as Array<[string, unknown]>;
    }
    return Object.entries(evidence)
      .filter(([, value]) => {
        if (value === null || value === undefined) {
          return false;
        }
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        if (typeof value === 'object') {
          return Object.keys(value as Record<string, unknown>).length > 0;
        }
        return true;
      })
      .slice(0, 4);
  };

  const formatEvidenceValue = (value: unknown) => {
    if (typeof value === 'number') {
      return Number.isInteger(value) ? String(value) : value.toFixed(3);
    }
    if (typeof value === 'string') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value as Record<string, unknown>)
        .map(([key, nested]) => `${key}:${String(nested)}`)
        .join(', ');
    }
    return String(value);
  };

  const badgeCandidates = (layer: LayerResult): Array<[string, unknown]> => {
    const evidence = layer.evidence ?? {};
    const keysByLayer: Record<LayerResult['name'], string[]> = {
      NLP: ['urgencyHits', 'urgencyTerms', 'exclamationHits', 'tokenCount'],
      GNN: ['coordinationDensity', 'nodeCount', 'linkCount', 'clusterCount'],
      Gemini: ['verdict', 'httpStatus', 'confidence'],
    };

    const keys = keysByLayer[layer.name] || [];
    return keys
      .map((key) => [key, evidence[key]] as [string, unknown])
      .filter(([, value]) => {
        if (value === null || value === undefined) {
          return false;
        }
        if (typeof value === 'string') {
          return value.trim().length > 0;
        }
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return true;
      })
      .slice(0, 3);
  };

  const badgeVariant = (layer: LayerResult): 'error' | 'warning' | 'info' | 'success' => {
    if (layer.status === 'unavailable') {
      return 'error';
    }
    if (layer.status === 'insufficient_evidence') {
      return 'warning';
    }
    return 'success';
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      className="grid gap-4 lg:grid-cols-3"
      aria-label="Analysis layers: NLP, Graph neural network, and Gemini fact-check"
      role="region"
    >
      {layers.map((layer) => (
        <motion.div key={layer.name} variants={itemVariants}>
          <Card className="cursor-pointer h-full flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
            {/* Layer Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-heading4 font-semibold text-text-primary">{layer.name}</h3>
              <Badge variant={badgeVariant(layer)} size="sm">
                {layer.score}%
              </Badge>
            </div>

            {/* Status */}
            <p className="text-caption font-medium text-text-tertiary uppercase tracking-wide mb-4">
              {statusLabel(layer.status)}
              {typeof layer.confidence === 'number' ? ` • ${Math.round(layer.confidence * 100)}% confidence` : ''}
            </p>

            {/* Progress Bar */}
            <div className="h-2 rounded-full bg-surface-2 mb-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${layer.score}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500"
              />
            </div>

            {/* Explanation */}
            <p className="text-body-sm text-text-secondary mb-4 leading-relaxed">{layer.explanation}</p>

            {/* Badges */}
            {badgeCandidates(layer).length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {badgeCandidates(layer).map(([key, value]) => (
                  <Badge
                    key={`${layer.name}-badge-${key}`}
                    variant="outline"
                    size="sm"
                  >
                    {key}: {formatEvidenceValue(value)}
                  </Badge>
                ))}
              </div>
            ) : null}

            {/* Evidence Section */}
            {evidenceEntries(layer.evidence).length > 0 ? (
              <div className="mt-auto pt-4 border-t border-border-default">
                <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wide mb-3">
                  Evidence Signals
                </p>
                <div className="space-y-3">
                  {evidenceEntries(layer.evidence).map(([key, value]) => (
                    <div key={`${layer.name}-${key}`} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-caption font-medium text-text-secondary capitalize">{key}</span>
                        <span className="text-caption font-semibold text-primary-600">{formatEvidenceValue(value)}</span>
                      </div>

                      {/* Visual Progress Bars */}
                      {(() => {
                        // For ratio values (0-1 range)
                        if (typeof value === 'number' && value >= 0 && value <= 1) {
                          return (
                            <motion.div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${value * 100}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className={`h-1.5 rounded-full ${
                                  value > 0.7 ? 'bg-error' : value > 0.4 ? 'bg-warning' : 'bg-success'
                                }`}
                              />
                            </motion.div>
                          );
                        }

                        // For count values (0+)
                        if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
                          const maxVal = key === 'tokenCount' ? 100 : key === 'nodeCount' ? 50 : 20;
                          const percentage = Math.min((value / maxVal) * 100, 100);
                          return (
                            <motion.div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${percentage}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500"
                              />
                            </motion.div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </motion.div>
      ))}
    </motion.section>
  );
}
