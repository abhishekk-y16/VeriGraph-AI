"use client";

import { useEffect, useState } from "react";
import { PropagationSpread } from "@/components/PropagationSpread";
import { LiveAmplificationFeed } from "@/components/LiveAmplificationFeed";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Card } from "@/components/ui";
import { motion } from "framer-motion";
import { slideUpVariants, containerVariants, itemVariants } from "@/lib/animations";

interface AmplificationPost {
  id: string;
  source: string;
  platform: string;
  title: string;
  text?: string;
  likes: number;
  shares: number;
  timestamp: string;
  url?: string;
  author?: string;
  engagement: number;
}

interface AnalysisState {
  threatScore: number;
  riskLevel: string;
  propagationMetrics: any;
  amplificationPosts: AmplificationPost[];
  isLoading: boolean;
}

export default function PropagationDemoPage() {
  const [state, setState] = useState<AnalysisState>({
    threatScore: 0,
    riskLevel: "Unknown",
    propagationMetrics: null,
    amplificationPosts: [],
    isLoading: false,
  });

  const [query, setQuery] = useState<string>("");

  const analyzeClaim = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 4) {
      alert("Please enter a claim with at least 4 characters");
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Get propagation metrics
      const response = await fetch("/api/propagation/analyze-spread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || errorBody?.detail || `API request failed (${response.status})`
        );
      }

      const data = await response.json();

      if (!data.analysis) {
        throw new Error("No analysis data received");
      }

      // Transform posts into amplification posts with URLs
      const amplificationPosts: AmplificationPost[] = (
        data.posts || []
      ).map((post: any) => ({
        id: post.id || `${post.author_id || post.username}_${post.created_at || Math.random()}`,
        source: post.platform,
        platform: post.platform,
        title: `${post.username || post.author || 'User'} on ${(post.platform || 'unknown').toUpperCase()}`,
        text: post.text || post.content || '',
        likes: post.likes || 0,
        shares: post.shares || 0,
        timestamp: post.created_at || new Date().toISOString(),
        author: post.username || post.author || 'Anonymous',
        engagement: post.engagement || 0,
        url: post.url || post.permalink_url || undefined,
      }));

      // Calculate threat score based on virality
      const threatScore = data.analysis.virality?.virality_score || 0;

      setState({
        threatScore,
        riskLevel: getThreatLevel(threatScore),
        propagationMetrics: data.analysis,
        amplificationPosts,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error analyzing claim:", error);
      alert("Failed to analyze claim. Make sure the backend is running on localhost:8000");
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      analyzeClaim(query);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-darkest via-surface-dark to-surface-darkest">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border-default bg-surface-1/30 backdrop-blur-xl sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-display font-bold text-text-primary mb-2">
            Propaganda Propagation Analysis
          </h1>
          <p className="text-body-lg text-text-secondary">
            Track how claims spread across 5 sources with threat assessment and
            live amplification feed
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter a claim to analyze (min 4 characters)..."
              disabled={state.isLoading}
              className="flex-1 px-6 py-4 rounded-lg border border-border-default bg-surface-2 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-600/50 disabled:opacity-50 transition-all shadow-md"
            />
            <button
              onClick={() => analyzeClaim(query)}
              disabled={state.isLoading}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {state.isLoading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </motion.div>

        {/* Results */}
        {state.propagationMetrics ? (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Threat Assessment */}
            <motion.div variants={itemVariants}>
              <ScoreDisplay
                score={state.threatScore}
                riskLevel={state.riskLevel}
                confidence={state.threatScore / 100}
              />
            </motion.div>

            {/* Propagation Metrics */}
            <motion.div variants={itemVariants}>
              <PropagationSpread metrics={state.propagationMetrics} />
            </motion.div>

            {/* Live Amplification Feed */}
            {state.amplificationPosts.length > 0 && (
              <motion.div variants={itemVariants}>
                <h2 className="text-heading3 font-bold text-text-primary mb-4">
                  Top Amplifiers
                </h2>
                <LiveAmplificationFeed
                  posts={state.amplificationPosts}
                  isLive={false}
                />
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={slideUpVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <Card>
              <div className="max-w-lg">
                <div className="text-6xl mb-6">📊</div>
                <h2 className="text-heading3 font-bold text-text-primary mb-4">
                  Analyze Propaganda Spread
                </h2>
                <p className="text-body-lg text-text-secondary mb-6">
                  Enter a claim to see how it propagates across multiple news
                  sources and social platforms
                </p>

                <div className="bg-surface-2 rounded-lg p-6 mb-6 border border-border-default">
                  <h3 className="font-semibold text-text-primary mb-3">
                    📰 Data Sources:
                  </h3>
                  <ul className="space-y-2 text-text-secondary text-body-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-error"></span>
                      News RSS feeds (AP, BBC, Reuters, CNN)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning"></span>
                      GDELT global event database
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                      Telegram public channels
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      CommonCrawl web archive (200B+ pages)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary-500"></span>
                      Facebook public posts
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setQuery("vaccine safety concerns");
                      setTimeout(() => analyzeClaim("vaccine safety concerns"), 100);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border border-border-default text-text-primary hover:border-primary-500/40 hover:bg-primary-500/5 transition-all text-body-sm font-medium"
                  >
                    Example: "vaccine safety concerns"
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function getThreatLevel(
  score: number
): "Critical" | "High" | "Medium" | "Low" | "None" {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "None";
}
