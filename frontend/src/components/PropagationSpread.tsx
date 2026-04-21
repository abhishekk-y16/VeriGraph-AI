"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, Badge } from "@/components/ui";
import { slideUpVariants, containerVariants, itemVariants } from "@/lib/animations";

const getTone = (score: number): string => {
  if (score >= 70) return "#EF4444";
  if (score >= 40) return "#F59E0B";
  return "#10B981";
};

interface SpreadMetrics {
  total_reach: {
    total_reach: number;
    total_likes: number;
    total_shares: number;
    total_comments: number;
    post_count: number;
    average_engagement_per_post: number;
  };
  platform_breakdown: {
    platform_distribution: Record<
      string,
      {
        post_count: number;
        total_engagement: number;
        avg_engagement: number;
        reach_percentage: number;
        likes: number;
        shares: number;
        comments: number;
      }
    >;
    platforms_with_posts: string[];
  };
  timeline: {
    timeline_buckets: Record<
      string,
      {
        post_count: number;
        total_engagement: number;
        growth_rate: number;
        date_range: { start: string; end: string };
      }
    >;
    spread_pattern: "exponential" | "linear" | "declining" | "flat" | "none";
    peak_period: string | null;
  };
  top_spreaders: Array<{
    username: string;
    author_id: string;
    platform: string;
    post_count: number;
    total_engagement: number;
    avg_engagement_per_post: number;
    total_likes: number;
    total_shares: number;
    total_comments: number;
  }>;
  virality: {
    viral_coefficient: number;
    doubling_time_hours: number | null;
    growth_rate: number;
    viral_classification:
      | "non-viral"
      | "slow"
      | "moderate"
      | "fast"
      | "explosive";
    virality_score: number;
  };
}

interface PropagationSpreadProps {
  metrics: SpreadMetrics | null;
  isLoading?: boolean;
}

export function PropagationSpread({
  metrics,
  isLoading = false,
}: PropagationSpreadProps) {
  const [animatedReach, setAnimatedReach] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!metrics) return;

    // Animate total reach
    const reachTarget = metrics.total_reach.total_reach;
    const reachDuration = 1.5;
    const startTime = Date.now();

    const animateReach = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (reachDuration * 1000), 1);
      setAnimatedReach(Math.floor(reachTarget * progress));

      if (progress < 1) {
        requestAnimationFrame(animateReach);
      }
    };

    animateReach();

    // Animate virality score
    const scoreTarget = metrics.virality.virality_score;
    const scoreDuration = 1.8;
    const scoreStartTime = Date.now();

    const animateScore = () => {
      const elapsed = Date.now() - scoreStartTime;
      const progress = Math.min(elapsed / (scoreDuration * 1000), 1);
      setAnimatedScore(Math.floor(scoreTarget * progress));

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };

    animateScore();
  }, [metrics]);

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="h-8 bg-surface-2 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-surface-2 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <div className="text-center py-6 text-text-tertiary">
          <p>No propagation data available</p>
        </div>
      </Card>
    );
  }

  const viralityColor = getTone(metrics.virality.virality_score);

  const getViralityVariant = (): "error" | "warning" | "success" => {
    const score = metrics.virality.virality_score;
    if (score >= 70) return "error";
    if (score >= 40) return "warning";
    return "success";
  };

  return (
    <motion.div
      variants={slideUpVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      <Card
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        style={{
          boxShadow: `0 0 40px ${viralityColor}15, inset 0 1px 0 ${viralityColor}08`,
        }}
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <h2 className="text-heading4 font-bold text-text-primary">
            Propagation Spread Analysis
          </h2>
          <p className="text-body-sm text-text-secondary mt-2">
            How the claim is spreading across {metrics.platform_breakdown.platforms_with_posts.length} sources
          </p>
        </motion.div>

        {/* Main Metrics Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* Total Reach Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-lg border border-border-default bg-surface-2 p-6 shadow-md"
          >
            <p className="text-caption uppercase tracking-wider text-text-tertiary font-bold">
              Total Reach
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-text-primary">
                {animatedReach.toLocaleString()}
              </span>
              <span className="text-body-sm text-text-secondary">engagements</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-caption">
              <div>
                <p className="text-text-tertiary">Likes</p>
                <p className="text-text-primary font-semibold">
                  {metrics.total_reach.total_likes.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-text-tertiary">Shares</p>
                <p className="text-text-primary font-semibold">
                  {metrics.total_reach.total_shares.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-text-tertiary">Comments</p>
                <p className="text-text-primary font-semibold">
                  {metrics.total_reach.total_comments.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Virality Score Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-lg border p-6 shadow-md"
            style={{
              borderColor: `${viralityColor}40`,
              backgroundColor: `${viralityColor}08`,
            }}
          >
            <p className="text-caption uppercase tracking-wider font-bold" style={{ color: viralityColor }}>
              Virality Score
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold" style={{ color: viralityColor }}>
                  {animatedScore}
                </div>
                <Badge variant={getViralityVariant()} size="sm" className="mt-2 capitalize">
                  {metrics.virality.viral_classification}
                </Badge>
              </div>
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={viralityColor}
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - animatedScore / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg border border-border-default bg-surface-2 p-6 shadow-md mb-6"
        >
          <h3 className="text-body-sm font-bold text-text-primary mb-4">
            Platform Distribution
          </h3>
          <div className="space-y-3">
            {metrics.platform_breakdown.platforms_with_posts.map((platform) => {
              const data =
                metrics.platform_breakdown.platform_distribution[platform];
              const platformColor = getPlatformColor(platform);

              return (
                <div key={platform} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-body-sm capitalize font-medium text-text-secondary">
                      {platform}
                    </span>
                    <span className="text-caption text-text-tertiary">
                      {data.reach_percentage.toFixed(1)}% • {data.post_count} posts
                    </span>
                  </div>
                  <div className="w-full bg-surface-3 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.reach_percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: platformColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Timeline Spread */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg border border-border-default bg-surface-2 p-6 shadow-md mb-6"
        >
          <h3 className="text-body-sm font-bold text-text-primary mb-4">Spread Timeline</h3>
          <div className="space-y-3">
            {["24h", "7d", "30d"].map((period) => {
              const data = metrics.timeline.timeline_buckets[period];
              if (!data) return null;

              const isHighest =
                period ===
                Object.entries(metrics.timeline.timeline_buckets).reduce(
                  (max, [key, val]) =>
                    val.total_engagement > max.engagement
                      ? { key, engagement: val.total_engagement }
                      : max,
                  { key: "", engagement: 0 }
                ).key;

              return (
                <div
                  key={period}
                  className={`p-3 rounded-lg border transition-colors ${
                    isHighest
                      ? "border-primary-500/40 bg-primary-500/5"
                      : "border-border-default bg-surface-1"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-body-sm font-medium text-text-primary">
                        Last {period}
                      </p>
                      <p className="text-caption text-text-tertiary mt-1">
                        {data.post_count} posts
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-heading4 font-semibold text-text-primary">
                        {data.total_engagement}
                      </p>
                      {data.growth_rate !== 0 && (
                        <p
                          className="text-caption mt-1"
                          style={{
                            color: data.growth_rate > 0 ? "#10B981" : "#EF4444",
                          }}
                        >
                          {data.growth_rate > 0 ? "+" : ""}
                          {data.growth_rate.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <p className="text-caption text-text-tertiary mt-4">
              Pattern: <span className="capitalize text-text-secondary font-medium">{metrics.timeline.spread_pattern}</span>
            </p>
          </div>
        </motion.div>

        {/* Top Spreaders */}
        {metrics.top_spreaders.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="rounded-lg border border-border-default bg-surface-2 p-6 shadow-md mb-6"
          >
            <h3 className="text-body-sm font-bold text-text-primary mb-4">
              Top 5 Spreaders
            </h3>
            <div className="space-y-2">
              {metrics.top_spreaders.slice(0, 5).map((spreader, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-surface-1 hover:border-primary-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shadow-sm">
                      <span className="text-caption font-semibold">#{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-text-primary truncate">
                        {spreader.username}
                      </p>
                      <p className="text-caption text-text-tertiary capitalize">
                        {spreader.platform}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-body-sm font-semibold text-text-primary">
                      {spreader.total_engagement}
                    </p>
                    <p className="text-caption text-text-tertiary">
                      {spreader.post_count} posts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Virality Details */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-lg border border-border-default bg-surface-2 p-4 shadow-sm"
          >
            <p className="text-caption uppercase tracking-wider text-text-tertiary font-bold">
              Daily Growth Rate
            </p>
            <p className="text-3xl font-bold text-text-primary mt-3">
              {metrics.virality.growth_rate.toFixed(2)}%
            </p>
          </motion.div>
          {metrics.virality.doubling_time_hours && (
            <motion.div
              variants={itemVariants}
              className="rounded-lg border border-border-default bg-surface-2 p-4 shadow-sm"
            >
              <p className="text-caption uppercase tracking-wider text-text-tertiary font-bold">
                Doubling Time
              </p>
              <p className="text-3xl font-bold text-text-primary mt-3">
                {metrics.virality.doubling_time_hours < 24
                  ? `${(metrics.virality.doubling_time_hours).toFixed(1)}h`
                  : `${(metrics.virality.doubling_time_hours / 24).toFixed(1)}d`}
              </p>
            </motion.div>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
}

function getPlatformColor(platform: string): string {
  // Updated palette: blue, amber, green, error
  const colors: Record<string, string> = {
    facebook: "#2563EB",
    news: "#EF4444",
    gdelt: "#F59E0B",
    telegram: "#3B82F6",
    commoncrawl: "#10B981",
  };
  return colors[platform] || "#7A9FB5";
}
