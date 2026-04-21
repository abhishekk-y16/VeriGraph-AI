"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Card } from "@/components/ui";
import { containerVariants, itemVariants } from "@/lib/animations";
import type { PostItem } from "@/types/analysis";

interface PostsListProps {
  posts: PostItem[];
}

const TRUSTED_SOURCE_URLS: Record<string, string> = {
  "bbc news": "https://www.bbc.com/news",
  bbc: "https://www.bbc.com/news",
  reuters: "https://www.reuters.com",
  "ap news": "https://apnews.com",
  "associated press": "https://apnews.com",
  cnn: "https://www.cnn.com",
};

function getTrustedSourceUrl(post: PostItem): string | null {
  const explicitUrl = post.sourceVerification?.matchedUrl || post.url;
  if (explicitUrl) {
    return explicitUrl;
  }

  const sourceKey = (post.sourceName || post.username || "").toLowerCase();
  for (const [key, url] of Object.entries(TRUSTED_SOURCE_URLS)) {
    if (sourceKey.includes(key)) {
      return url;
    }
  }

  return null;
}

export function PostsList({ posts }: PostsListProps) {
  const [isLoading, setIsLoading] = useState(posts.length === 0);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(posts[0]?.id ?? null);
  const proofDrawerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (posts.length > 0) {
      setIsLoading(false);
      if (!selectedPostId || !posts.some((post) => post.id === selectedPostId)) {
        setSelectedPostId(posts[0]?.id ?? null);
      }
    }
  }, [posts, selectedPostId]);

  useEffect(() => {
    if (!selectedPostId) {
      return;
    }

    proofDrawerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedPostId]);

  const selectedPost = posts.find((post) => post.id === selectedPostId) ?? null;

  const selectedSourceName = selectedPost?.sourceName || selectedPost?.username || "Unknown source";

  const selectedSourceUrl = selectedPost ? getTrustedSourceUrl(selectedPost) : null;

  const proofBadgeVariant = (status?: PostItem["sourceVerification"] extends infer Proof ? Proof extends { status: infer Status } ? Status : never : never) => {
    switch (status) {
      case "verified":
        return "success";
      case "ambiguous":
        return "warning";
      case "disabled":
        return "outline";
      default:
        return "error";
    }
  };

  return (
    <Card
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
      aria-label="Live amplification feed showing posts from sources"
      role="region"
    >
      <p className="text-caption font-semibold text-text-tertiary uppercase tracking-wider mb-4">Live Amplification Feed</p>
      
      {isLoading ? (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="rounded-lg border border-border-default bg-surface-2 p-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="h-4 bg-surface-3 rounded w-1/3 mb-3" />
              <div className="h-3 bg-surface-3 rounded w-full mb-2" />
              <div className="h-3 bg-surface-3 rounded w-4/5 mb-3" />
              <div className="flex gap-4">
                <div className="h-3 bg-surface-3 rounded w-20" />
                <div className="h-3 bg-surface-3 rounded w-20" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-3"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {posts.map((post) => (
            <motion.article
              key={post.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01, y: -2 }}
              className={`rounded-lg border bg-surface-2 p-4 transition-all hover:border-primary-500/40 group shadow-hover ${
                selectedPostId === post.id ? "border-primary-500/60 ring-1 ring-primary-500/25" : "border-border-default"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-body-sm font-semibold text-text-primary">{post.username}</span>
                    {post.sourceName && post.sourceName !== post.username && (
                      <Badge variant="outline" size="sm">
                        {post.sourceName}
                      </Badge>
                    )}
                    {post.sourceVerification && (
                      <Badge variant={proofBadgeVariant(post.sourceVerification.status) as any} size="sm">
                        {post.sourceVerification.status}
                      </Badge>
                    )}
                  </div>
                  <span className="text-caption text-text-tertiary">{post.timestamp}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={selectedPostId === post.id ? "primary" : "outline"}
                  onClick={() => setSelectedPostId(post.id)}
                  aria-pressed={selectedPostId === post.id}
                >
                  {selectedPostId === post.id ? "Selected" : "Evidence"}
                </Button>
              </div>
              <p className="text-body-sm leading-relaxed text-text-secondary">{post.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-caption text-text-tertiary">
                <span>Likes: {post.likes}</span>
                <span>Shares: {post.shares}</span>
                {getTrustedSourceUrl(post) && (
                  <a
                    href={getTrustedSourceUrl(post) as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    Open source link
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

      {selectedPost && (
        <motion.div
          ref={proofDrawerRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <Card variant="elevated" padding="lg" className="border-primary-500/20 bg-surface-1 xl:sticky xl:top-28">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-caption font-semibold uppercase tracking-wider text-text-tertiary">Evidence Drawer</p>
                <h3 className="mt-2 text-heading4 font-bold text-text-primary">{selectedSourceName}</h3>
                <p className="mt-1 text-body-sm text-text-secondary">Selected proof and source validation details</p>
              </div>
              {selectedPost.sourceVerification ? (
                <Badge variant={proofBadgeVariant(selectedPost.sourceVerification.status) as any} size="sm" className="uppercase">
                  {selectedPost.sourceVerification.status}
                </Badge>
              ) : (
                <Badge variant={selectedSourceUrl ? "info" : "outline"} size="sm" className="uppercase">
                  {selectedSourceUrl ? "Source available" : "No validation data"}
                </Badge>
              )}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border-default bg-surface-2 p-4">
                <p className="text-caption uppercase tracking-wider text-text-tertiary">Source identity</p>
                <p className="mt-2 text-body-sm text-text-primary">{selectedSourceName}</p>
                <p className="mt-1 text-caption text-text-tertiary">Post ID: {selectedPost.id}</p>
              </div>

              <div className="rounded-2xl border border-border-default bg-surface-2 p-4">
                <p className="text-caption uppercase tracking-wider text-text-tertiary">Canonical source</p>
                {selectedSourceUrl ? (
                  <a
                    href={selectedSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-body-sm text-primary-600 hover:underline"
                  >
                    {selectedSourceUrl}
                  </a>
                ) : (
                  <p className="mt-2 text-body-sm text-text-secondary">No canonical URL available.</p>
                )}
              </div>

              <div className="rounded-2xl border border-border-default bg-surface-2 p-4">
                <p className="text-caption uppercase tracking-wider text-text-tertiary">NewsAPI message</p>
                <p className="mt-2 text-body-sm text-text-secondary">
                  {selectedPost.sourceVerification?.message || "This source has not been checked yet."}
                </p>
              </div>

              <div className="rounded-2xl border border-border-default bg-surface-2 p-4">
                <p className="text-caption uppercase tracking-wider text-text-tertiary">Matched article</p>
                <p className="mt-2 text-body-sm text-text-primary">
                  {selectedPost.sourceVerification?.matchedTitle || selectedPost.sourceName || selectedPost.username}
                </p>
              </div>

              <div className="rounded-2xl border border-border-default bg-surface-2 p-4">
                <p className="text-caption uppercase tracking-wider text-text-tertiary">Matched URL</p>
                {selectedSourceUrl ? (
                  <a
                    href={selectedSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block break-all text-body-sm text-primary-600 hover:underline"
                  >
                    {selectedSourceUrl}
                  </a>
                ) : (
                  <p className="mt-2 text-body-sm text-text-secondary">No matched URL available.</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" size="sm">
                {selectedPost.sourceVerification?.provider || "NewsAPI"}
              </Badge>
              <Badge variant="outline" size="sm">
                {selectedPost.sourceVerification?.queryUsed || "No query used"}
              </Badge>
              {selectedPost.sourceVerification?.confidence !== undefined && selectedPost.sourceVerification?.confidence !== null && (
                <Badge variant="outline" size="sm">
                  Confidence {Math.round((selectedPost.sourceVerification.confidence || 0) * 100)}%
                </Badge>
              )}
            </div>

            {!selectedPost.sourceVerification && selectedSourceUrl && (
              <div className="mt-4 rounded-2xl border border-info/20 bg-info/10 p-4 text-body-sm text-text-secondary">
                NewsAPI proof is not attached for this item in the current run, but the canonical source link above is live.
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </Card>
  );
}
