'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { slideUpVariants, containerVariants, itemVariants } from '@/lib/animations';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { FeatureShowcase } from '@/components/FeatureShowcase';
import { Footer } from '@/components/Footer';
import { analyzeClaim } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
    const trimmed = query.trim();
    if (trimmed.length < 4 || isAnalyzing) {
      return;
    }

    setError('');
    setIsAnalyzing(true);
    try {
      const result = await analyzeClaim(trimmed);
      window.sessionStorage.setItem('verigraph.analysis', JSON.stringify(result));
      router.push('/analysis');
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to analyze claim right now.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 text-text-primary">
      <Navbar />
      <main>
        <Hero />

        {/* Claim Analysis Section */}
        <motion.section
          variants={slideUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto w-full max-w-7xl px-6 py-20"
        >
          {/* Background accent */}
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
          </div>

          <Card variant="default" padding="lg" className="border-border-light shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-0.5 bg-linear-to-b from-primary-600 to-secondary-500 rounded-full" />
                <Badge variant="primary" size="sm" className="uppercase">
                  Realtime Claim Check
                </Badge>
              </div>

              <h2 className="text-heading1 font-bold text-text-primary leading-tight">
                Drop any suspicious claim across web and social
              </h2>

              <p className="mt-4 max-w-3xl text-body text-text-secondary leading-relaxed">
                Analyze breaking news, rumors, and claims across millions of websites and social platforms in real-time using our advanced multi-layer intelligence.
              </p>
            </div>

            {/* Search Input Row */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.input
                whileFocus={{ scale: 1.01 }}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Paste a breaking claim, rumor, or news snippet..."
                className="flex-1 rounded-sm border border-border-default bg-surface-2 px-4 py-3 text-body text-text-primary outline-none transition-all duration-300 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 placeholder:text-text-muted"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || query.trim().length < 4}
                isLoading={isAnalyzing}
                size="lg"
                className="whitespace-nowrap"
              >
                {isAnalyzing ? 'Analyzing...' : '🔍 Analyze Live'}
              </Button>
            </div>

            {/* Features row */}
            <div className="mt-6 flex flex-wrap gap-3">
              {['✓ Live Data', '✓ 1M+ Coverage', '✓ 3-Layer Analysis', '✓ Real-Time Results'].map((feature, idx) => (
                <span key={idx} className="text-caption text-text-tertiary font-medium">
                  {feature}
                </span>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-sm border border-error/30 bg-error/10 px-4 py-3 text-body-sm text-error"
              >
                ⚠ {error}
              </motion.div>
            )}
          </Card>
        </motion.section>

        <FeatureShowcase />

        {/* About Section */}
        <motion.section
          id="about"
          variants={slideUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto w-full max-w-7xl px-6 py-20"
        >
          {/* Background accents */}
          <div className="absolute inset-0 -z-10 opacity-15">
            <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-success/40 blur-3xl" />
            <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-secondary-500/20 blur-3xl" />
          </div>

          <Card variant="default" padding="lg" className="border-border-light">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-0.5 bg-linear-to-b from-success to-primary-600 rounded-full" />
                  <Badge variant="success" size="sm" className="uppercase">
                    About VeriGraph
                  </Badge>
                </div>

                <h3 className="text-heading1 font-bold text-text-primary leading-tight">
                  Building <span className="bg-linear-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">trust</span> in real-time information ecosystems
                </h3>

                <p className="mt-6 text-body text-text-secondary leading-relaxed">
                  VeriGraph combines{' '}
                  <span className="text-primary-600 font-semibold">language analysis</span>,{' '}
                  <span className="text-success font-semibold">network coordination mapping</span>, and{' '}
                  <span className="text-secondary-500 font-semibold">fact validation</span> into one unified intelligence surface.
                </p>

                <p className="mt-4 text-body text-text-secondary leading-relaxed">
                  Instead of a single confidence score, it reveals how misinformation propagates across coordinated accounts so investigators, journalists, and public safety teams can act decisively.
                </p>

                <motion.div className="mt-10 flex gap-4">
                  <motion.a href="/analysis">
                    <Button size="lg" variant="primary">
                      Try Dashboard →
                    </Button>
                  </motion.a>
                  <motion.a href="#features">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </motion.a>
                </motion.div>
              </div>

              {/* Feature Grid */}
              <motion.div
                variants={containerVariants}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {[
                  { icon: '🧠', title: 'NLP Analysis', desc: 'Semantic threat signals' },
                  { icon: '🔗', title: 'Network Graph', desc: 'Coordination detection' },
                  { icon: '✓', title: 'Fact Check', desc: 'Truth assessment' },
                  { icon: '📊', title: 'Live Feed', desc: 'Real-time updates' },
                ].map((feature, idx) => (
                  <motion.div key={idx} variants={itemVariants}>
                    <Card
                      variant="interactive"
                      padding="md"
                      className="h-full flex flex-col"
                    >
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h4 className="font-semibold text-text-primary text-body-sm mb-1">{feature.title}</h4>
                      <p className="text-caption text-text-secondary">{feature.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </Card>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}
