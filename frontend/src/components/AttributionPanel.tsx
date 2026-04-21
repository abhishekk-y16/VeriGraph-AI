"use client";

import { motion } from "framer-motion";
import { Card, Badge } from "@/components/ui";
import { slideUpVariants } from "@/lib/animations";

interface AttributionPanelProps {
  summary: string;
}

export function AttributionPanel({ summary }: AttributionPanelProps) {
  // Extract key metrics from summary
  const isInconclusive = summary.toLowerCase().includes("inconclusive");
  const confidenceMatch = summary.match(/(\d+)%/);
  const confidence = confidenceMatch ? confidenceMatch[1] : "N/A";
  const nlpMatch = summary.match(/NLP=(\d+)/)?.[1];
  const gnnMatch = summary.match(/GNN=(\d+)/)?.[1];
  const geminiMatch = summary.match(/Gemini=(\d+)/)?.[1];
  const accountsMatch = summary.match(/observed (\d+) accounts/);
  const accounts = accountsMatch ? accountsMatch[1] : "0";

  return (
    <motion.div
      variants={slideUpVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
    >
      <Card
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        aria-label="Attribution summary and analysis conclusion"
        role="region"
      >
        <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-4">Attribution Summary</p>
        
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-body-sm font-semibold text-text-primary">
                {isInconclusive ? "⚠ Inconclusive" : "✓ Complete"}
              </p>
              <p className="text-caption text-text-secondary mt-1">
                {accounts} account{accounts !== "1" ? "s" : ""} detected • Confidence {confidence}%
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end max-w-xs">
              {nlpMatch && (
                <Badge variant="info" size="sm">
                  NLP {nlpMatch}
                </Badge>
              )}
              {gnnMatch && (
                <Badge variant="success" size="sm">
                  GNN {gnnMatch}
                </Badge>
              )}
              {geminiMatch && (
                <Badge variant="warning" size="sm">
                  Gemini {geminiMatch}
                </Badge>
              )}
            </div>
          </div>
          {isInconclusive && (
            <p className="text-caption text-text-secondary">
              Inconsistent evidence across layers. More data recommended before final verdict.
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
