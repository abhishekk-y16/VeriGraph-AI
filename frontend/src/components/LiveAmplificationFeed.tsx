"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui";
import { slideUpVariants } from "@/lib/animations";
import Link from "next/link";

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

interface LiveAmplificationFeedProps {
  posts?: AmplificationPost[];
  isLive?: boolean;
  onLinkClick?: (url: string) => void;
}

const getSourceColor = (source: string): string => {
  // Updated palette: blue, green, amber, red
  const colors: Record<string, string> = {
    "ap news": "#EF4444",
    "bbc": "#2563EB",
    "cnn": "#EF4444",
    "reuters": "#F59E0B",
    "The New York Times": "#2563EB",
    "The Guardian": "#10B981",
    "Washington Post": "#EF4444",
    "MSNBC": "#F59E0B",
    "facebook": "#2563EB",
    "news": "#EF4444",
    "gdelt": "#F59E0B",
    "telegram": "#3B82F6",
    "commoncrawl": "#10B981",
  };

  const lowerSource = source.toLowerCase();
  for (const [key, color] of Object.entries(colors)) {
    if (lowerSource.includes(key.toLowerCase())) {
      return color;
    }
  }
  return "#7A9FB5";
};

const getTimeAgo = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  } catch {
    return timestamp;
  }
};

export function LiveAmplificationFeed({
  posts = [],
  isLive = true,
  onLinkClick,
}: LiveAmplificationFeedProps) {
  const [displayPosts, setDisplayPosts] = useState<AmplificationPost[]>(posts);
  const [newPostCount, setNewPostCount] = useState(0);

  useEffect(() => {
    if (posts.length > 0) {
      setDisplayPosts(posts);
    }
  }, [posts]);

  const handleLinkClick = (url: string | undefined) => {
    if (url) {
      if (onLinkClick) {
        onLinkClick(url);
      }
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (displayPosts.length === 0) {
    return (
      <Card className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? "animate-pulse bg-error" : "bg-border-default"}`} />
            <h2 className="text-body-lg font-semibold text-text-primary">
              Live Amplification Feed
            </h2>
          </div>
        </div>
        <p className="text-center text-text-tertiary py-8">
          No posts found. Run an analysis to see live amplification data.
        </p>
      </Card>
    );
  }

  return (
    <motion.div variants={slideUpVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
      <Card
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        style={{
          boxShadow: `0 0 40px rgba(239, 68, 68, 0.1), inset 0 1px 0 rgba(239, 68, 68, 0.05)`,
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isLive ? "animate-pulse bg-error" : "bg-border-default"}`} />
            <h2 className="text-body-lg font-semibold text-text-primary">
              Live Amplification Feed
            </h2>
            {newPostCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-4 px-3 py-1 rounded-full bg-error/10 border border-error/30"
              >
                <span className="text-caption font-semibold text-error">
                  {newPostCount} new
                </span>
              </motion.div>
            )}
          </div>
          <p className="text-caption text-text-tertiary">
            {displayPosts.length} posts spreading
          </p>
        </motion.div>

        {/* Posts List */}
        <div className="space-y-3">
          <AnimatePresence>
            {displayPosts.map((post, idx) => {
              const sourceColor = getSourceColor(post.source);
              const totalEngagement = post.likes + post.shares;
              const isHighEngagement = totalEngagement > 300;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleLinkClick(post.url)}
                  className={`group relative p-4 rounded-lg border transition-all cursor-pointer ${
                    post.url
                      ? "border-border-default hover:border-primary-500/40 hover:bg-surface-2"
                      : "border-border-default bg-surface-1"
                  }`}
                  style={{
                    borderColor: isHighEngagement ? `${sourceColor}40` : undefined,
                    backgroundColor: isHighEngagement ? `${sourceColor}08` : undefined,
                  }}
                >
                  {/* High Engagement Badge */}
                  {isHighEngagement && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md"
                        style={{ backgroundColor: sourceColor }}
                      >
                        🔥
                      </div>
                    </motion.div>
                  )}

                  {/* Content Grid */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Source + Title */}
                    <div className="flex-1 min-w-0">
                      {/* Source + Time */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sourceColor }}
                        />
                        <span
                          className="text-caption font-semibold"
                          style={{ color: sourceColor }}
                        >
                          {post.source.toUpperCase()}
                        </span>
                        <span className="text-caption text-text-tertiary">
                          {getTimeAgo(post.timestamp)}
                        </span>
                      </div>

                      {/* Title */}
                      {post.url ? (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-body-sm font-medium text-text-primary leading-tight mb-2 line-clamp-2 hover:text-primary-400 hover:underline transition-colors block"
                        >
                          {post.title}
                        </a>
                      ) : (
                        <h3 className="text-body-sm font-medium text-text-primary leading-tight mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                      )}

                      {/* Text Preview */}
                      {post.text && (
                        <p className="text-caption text-text-secondary line-clamp-2 mb-2">
                          {post.text}
                        </p>
                      )}

                      {/* Author */}
                      {post.author && (
                        <p className="text-caption text-text-tertiary">
                          by{" "}
                          {post.url ? (
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary-400 hover:text-primary-300 hover:underline font-medium transition-colors"
                            >
                              {post.author}
                            </a>
                          ) : (
                            <span className="text-text-secondary">{post.author}</span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Right: Engagement Metrics */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-3">
                      {/* Engagement Numbers */}
                      <div className="flex items-center gap-4 text-body-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold text-error">
                            {post.likes}
                          </div>
                          <p className="text-caption text-text-tertiary">Likes</p>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-primary-500">
                            {post.shares}
                          </div>
                          <p className="text-caption text-text-tertiary">Shares</p>
                        </div>
                      </div>

                      {/* Total Engagement Bar */}
                      <div className="w-32 bg-surface-2 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${sourceColor}80, ${sourceColor})`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Link Indicator */}
                  {post.url && (
                    <div className="mt-3 flex items-center gap-1 text-caption text-text-tertiary group-hover:text-text-secondary transition-colors">
                      <span>🔗</span>
                      <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-primary-400 hover:underline truncate"
                      >
                        {post.url}
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-4 border-t border-border-default flex items-center justify-between"
        >
          <p className="text-caption text-text-tertiary">
            {isLive && "🔴 Live — Updates every 30s"}
          </p>
          <p className="text-caption text-text-tertiary">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </motion.div>
      </Card>
    </motion.div>
  );
}
