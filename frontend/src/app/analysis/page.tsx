'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '@/components/ui';
import { slideUpVariants } from '@/lib/animations';
import { Navbar } from '@/components/Navbar';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { LayerBreakdown } from '@/components/LayerBreakdown';
import { NetworkGraph } from '@/components/NetworkGraph';
import { AttributionPanel } from '@/components/AttributionPanel';
import { PostsList } from '@/components/PostsList';
import { PropagationSpread } from '@/components/PropagationSpread';
import { LiveAmplificationFeed } from '@/components/LiveAmplificationFeed';
import { ThreatAssessmentBadge } from '@/components/ThreatAssessmentBadge';
import { Footer } from '@/components/Footer';
import type { AnalysisResult } from '@/types/analysis';

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

export default function AnalysisPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [propagationMetrics, setPropagationMetrics] = useState<any>(null);
  const [amplificationPosts, setAmplificationPosts] = useState<AmplificationPost[]>([]);
  const [loadingPropagation, setLoadingPropagation] = useState(false);
  const [propagationError, setPropagationError] = useState<string>('');

  const fetchPropagationMetrics = async (query: string) => {
    setLoadingPropagation(true);
    setPropagationError('');
    try {
      const response = await fetch('/api/propagation/analyze-spread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(
          errorBody?.error || errorBody?.detail || `API request failed (${response.status})`
        );
      }

      const data = await response.json();

      if (data.analysis) {
        setPropagationMetrics(data.analysis);

        // Transform posts into amplification posts with URLs
        const posts: AmplificationPost[] = (data.posts || []).map((post: any) => {
          const postUrl = post.url || post.permalink_url || post.link || post.article_url || post.source_url;

          return {
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
            url: postUrl,
          };
        });

        setAmplificationPosts(posts);
      }
    } catch (error) {
      console.error('Error fetching propagation metrics:', error);
      setPropagationError(
        error instanceof Error && error.message
          ? error.message
          : 'Propagation metrics are temporarily unavailable.'
      );
    } finally {
      setLoadingPropagation(false);
    }
  };

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem('verigraph.analysis');
      if (!raw) {
        setLoaded(true);
        return;
      }
      const parsed = JSON.parse(raw) as AnalysisResult;
      if (parsed?.query && parsed?.layers && parsed?.nodes) {
        setResult(parsed);
        fetchPropagationMetrics(parsed.query);
      }
    } catch {
      setResult(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (loaded && !result) {
    return (
      <div className="min-h-screen bg-surface-0 text-text-primary">
        <Navbar />
        <main className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-heading1 font-bold text-text-primary">No Analysis Result Found</h1>
          <p className="mt-4 max-w-2xl text-body text-text-secondary">
            Start from the home page and run a live analysis to see results here.
          </p>
          <div className="mt-8">
            <Link href="/">
              <Button size="lg" variant="primary">
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12">
        {/* Header Section */}
        <motion.section variants={slideUpVariants} initial="initial" animate="animate" className="space-y-6">
          <div>
            <Badge variant="info" size="sm" className="uppercase">
              Analysis Result
            </Badge>
            <h1 className="mt-4 text-heading1 font-bold text-text-primary leading-tight">{result.query}</h1>
          </div>

          {/* Threat Assessment Badge */}
          <ThreatAssessmentBadge riskLevel={result.riskLevel} score={result.finalScore} />
        </motion.section>

        {/* Score Display */}
        <motion.div variants={slideUpVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
          <ScoreDisplay
            score={result.finalScore}
            riskLevel={result.riskLevel}
            resultStatus={result.resultStatus}
            confidence={result.confidence}
          />
        </motion.div>

        {/* Layer Breakdown */}
        <motion.div variants={slideUpVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
          <LayerBreakdown layers={result.layers} />
        </motion.div>

        {/* Graph & Posts Grid */}
        <motion.div
          variants={slideUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid gap-8 xl:grid-cols-[1.5fr_1fr]"
        >
          <NetworkGraph nodes={result.nodes} links={result.links} />
          <PostsList posts={result.posts} />
        </motion.div>

        {/* Attribution Panel */}
        <motion.div variants={slideUpVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
          <AttributionPanel summary={result.summary} />
        </motion.div>

        {/* Propagation Metrics Section */}
        {propagationError && (
          <motion.div variants={slideUpVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
            <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-body-sm text-warning">
              {propagationError}
            </div>
          </motion.div>
        )}

        {propagationMetrics && (
          <>
            <motion.section
              variants={slideUpVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="border-t border-border-default pt-12"
            >
              <div className="mb-8">
                <h2 className="text-heading2 font-bold text-text-primary mb-2">How This Claim Spreads</h2>
                <p className="text-body text-text-secondary">Real-time propagation metrics across platforms</p>
              </div>
              <PropagationSpread metrics={propagationMetrics} />
            </motion.section>

            {/* Amplification Feed */}
            {amplificationPosts.length > 0 && (
              <motion.section
                variants={slideUpVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <div className="mb-8">
                  <h2 className="text-heading2 font-bold text-text-primary mb-2">Top Amplifiers</h2>
                  <p className="text-body text-text-secondary">Accounts driving rapid spread</p>
                </div>
                <LiveAmplificationFeed posts={amplificationPosts} isLive={false} />
              </motion.section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

