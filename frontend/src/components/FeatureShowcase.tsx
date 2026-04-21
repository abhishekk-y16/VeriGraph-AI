"use client";

import { motion } from "framer-motion";
import { FeatureCard } from "@/components/FeatureCard";
import { containerVariants, itemVariants, slideUpVariants } from "@/lib/animations";

const features = [
  {
    title: "Semantic Threat Signal",
    description:
      "Transformer-powered language analysis catches manipulative patterns, urgency framing, and sentiment pressure in real time.",
    accent: "#3B82F6",
  },
  {
    title: "Coordination Graph Lens",
    description:
      "Force-directed relationship graph surfaces synchronized bursts, repeated links, and account cluster behavior instantly.",
    accent: "#10B981",
  },
  {
    title: "Fact Validation Layer",
    description:
      "Gemini fact verification adds truth assessment with confidence scoring and compact evidence explanation.",
    accent: "#F59E0B",
  },
  {
    title: "Realtime Intelligence Feed",
    description:
      "Live post cards animate into view while counters and cluster metrics update smoothly for a broadcast-style experience.",
    accent: "#EF4444",
  },
];

export function FeatureShowcase() {
  return (
    <motion.section
      id="features"
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, amount: 0.2 }}
      className="mx-auto w-full max-w-7xl px-6 py-16"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-display font-bold tracking-tight text-text-primary">
          Why VeriGraph feels different
        </h2>
        <p className="mt-4 max-w-3xl text-body-lg text-text-secondary">
          This is not a static report. It is a living misinformation radar with layered evidence and
          tactile interactions.
        </p>
      </motion.div>
      
      {/* Process Timeline */}
      <motion.div
        variants={slideUpVariants}
        className="mt-12 rounded-lg border border-border-default bg-surface-1 p-8 mb-10 shadow-md"
      >
        <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-6">Analysis Pipeline</p>
        <div className="flex flex-wrap items-center justify-between gap-0">
          {[
            { label: "Input Claim", icon: "📝" },
            { label: "NLP Analysis", icon: "🧠" },
            { label: "Network Map", icon: "🔗" },
            { label: "Fact Check", icon: "✓" },
            { label: "Results", icon: "📊" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="flex flex-col items-center flex-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.12 }}
            >
              <motion.div
                className="relative z-10 w-12 h-12 rounded-full border-2 border-primary-600 bg-surface-2 flex items-center justify-center mb-2 text-lg shadow-md"
                whileHover={{ boxShadow: "0 0 15px rgba(37, 99, 235, 0.4)", scale: 1.08 }}
              >
                {item.icon}
              </motion.div>
              <span className="text-caption font-semibold text-text-primary text-center">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {features.map((feature) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
          >
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
