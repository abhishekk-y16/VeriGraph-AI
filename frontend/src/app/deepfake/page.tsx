'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge, Button, Card } from '@/components/ui';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useDeepfakeDetection } from '@/lib/hooks/useDeepfakeDetection';
import type { DeepfakePrediction } from '@/types/deepfake';

const acceptedTypes = '.jpg,.jpeg,.png,.mp4,.avi,.mov,.mkv';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

function confidencePercent(confidence: number) {
  return Math.round(confidence * 100);
}

function confidenceTrackClass(prediction: DeepfakePrediction) {
  return prediction === 'Fake' ? 'bg-error' : 'bg-success';
}

function verdictFrameClass(prediction: DeepfakePrediction) {
  return prediction === 'Fake'
    ? 'border-error/25 bg-linear-to-br from-error/12 via-error/8 to-surface-1 text-error'
    : 'border-success/25 bg-linear-to-br from-success/12 via-success/8 to-surface-1 text-success';
}

function verdictAccent(prediction: DeepfakePrediction) {
  return prediction === 'Fake'
    ? 'from-error to-secondary-500'
    : 'from-success to-primary-600';
}

function formatConfidenceLabel(confidence: number) {
  if (confidence >= 0.85) return 'Very high';
  if (confidence >= 0.65) return 'High';
  if (confidence >= 0.45) return 'Moderate';
  return 'Low';
}

function StepPill({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="rounded-full border border-border-default bg-surface-1 px-3 py-2 text-caption text-text-secondary shadow-sm">
      <span className="font-semibold text-text-primary">{label}</span>
      <span className="mx-1 text-text-tertiary">•</span>
      <span>{detail}</span>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border-default bg-surface-1 p-4 shadow-sm">
      <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">{label}</div>
      <div className="mt-2 text-body font-semibold text-text-primary">{value}</div>
    </div>
  );
}

export default function DeepfakePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { result, loading, error, detectMedia, reset, setError } = useDeepfakeDetection();

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const mediaKind = useMemo(() => {
    if (!file) return null;
    return file.type.startsWith('video/') ? 'video' : 'image';
  }, [file]);

  const fileDetails = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      size: formatBytes(file.size),
      mime: file.type || 'unknown mime type',
      kind: mediaKind?.toUpperCase() ?? 'MEDIA',
    };
  }, [file, mediaKind]);

  const handleFile = (selected: File | null) => {
    if (!selected) return;

    if (!selected.type.startsWith('image/') && !selected.type.startsWith('video/')) {
      setError('Please upload a JPG, PNG, MP4, AVI, MOV, or MKV file.');
      return;
    }

    setError('');
    setFile(selected);
    reset();
  };

  const handleUpload = async () => {
    if (!file || loading) return;
    await detectMedia(file);
  };

  const resetAll = () => {
    setFile(null);
    setPreviewUrl('');
    reset();

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface-0 text-text-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-128 bg-linear-to-b from-primary-600/12 via-primary-600/5 to-transparent" />
        <div className="absolute -top-24 -right-32 h-96 w-96 rounded-full bg-secondary-500/10 blur-3xl" />
        <div className="absolute -left-28 top-40 h-112 rounded-full bg-success/10 blur-3xl" style={{ width: '28rem' }} />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.85) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.85) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <Navbar />

      <main className="relative mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-caption text-text-tertiary">
              <Link href="/" className="hover:text-text-secondary transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>Media Analysis</span>
              <span>/</span>
              <span className="text-text-primary">Deepfake Detection</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-linear-to-b from-primary-600 to-secondary-500" />
              <Badge variant="primary" size="sm" className="uppercase tracking-[0.18em]">
                Enterprise Media Screening
              </Badge>
            </div>

            <h1 className="text-display font-black leading-[1.05] tracking-tight text-text-primary sm:text-[40px]">
              Deepfake detection for images and videos, built for fast decision-making.
            </h1>

            <p className="max-w-2xl text-body text-text-secondary leading-relaxed">
              Upload an image or video and get an immediate Real/Fake verdict with confidence,
              frame summary, and model metadata. The workflow stays simple, fast, and fully aligned
              with hackathon prototype constraints.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-136">
            <Card padding="md" className="border-border-light bg-surface-1/90 shadow-lg backdrop-blur-sm">
              <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Model</div>
              <div className="mt-2 text-body-sm font-semibold text-text-primary">EfficientNet-B0</div>
            </Card>
            <Card padding="md" className="border-border-light bg-surface-1/90 shadow-lg backdrop-blur-sm">
              <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Mode</div>
              <div className="mt-2 text-body-sm font-semibold text-text-primary">Image + Video</div>
            </Card>
            <Card padding="md" className="border-border-light bg-surface-1/90 shadow-lg backdrop-blur-sm">
              <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Latency</div>
              <div className="mt-2 text-body-sm font-semibold text-text-primary">Fast path</div>
            </Card>
          </div>
        </motion.div>

        <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <Card
            variant="default"
            padding="lg"
            className="overflow-hidden border-border-light bg-surface-1/90 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-5">
              <div>
                <div className="text-caption uppercase tracking-[0.22em] text-text-tertiary">Step 1</div>
                <h2 className="mt-1 text-heading2 font-bold text-text-primary">Upload media</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <StepPill label="Images" detail="JPG, PNG" />
                <StepPill label="Video" detail="MP4, AVI, MOV, MKV" />
              </div>
            </div>

            <div
              className={`mt-6 rounded-3xl border border-dashed p-6 transition-all duration-300 ${
                dragActive
                  ? 'border-primary-500 bg-primary-600/6 shadow-[0_0_0_1px_rgba(37,99,235,0.35)]'
                  : 'border-border-default bg-linear-to-br from-surface-1 to-surface-2'
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFile(event.dataTransfer.files?.[0] ?? null);
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept={acceptedTypes}
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />

              <div className="flex flex-col items-center gap-5 text-center">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary-500/25 bg-linear-to-br from-primary-600/15 to-secondary-500/10 text-3xl text-primary-500 shadow-lg"
                >
                  ⬆
                </motion.div>

                <div className="space-y-2">
                  <p className="text-body font-semibold text-text-primary">Drop a file here or select one from your device.</p>
                  <p className="max-w-lg text-body-sm text-text-secondary">
                    The upload panel supports direct drag-and-drop, previews the selected media, and
                    keeps the workflow focused on quick analysis.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={() => inputRef.current?.click()} variant="primary" size="lg">
                    Select File
                  </Button>
                  <Button onClick={handleUpload} isLoading={loading} disabled={!file || loading} variant="outline" size="lg">
                    Run Detection
                  </Button>
                </div>

                <p className="text-caption text-text-tertiary">
                  Supported formats: JPG, PNG, MP4, AVI, MOV, MKV
                </p>
              </div>
            </div>

            {fileDetails && (
              <div className="mt-6 rounded-3xl border border-border-default bg-surface-2/80 p-4 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={mediaKind === 'video' ? 'warning' : 'info'} size="sm">
                        {fileDetails.kind}
                      </Badge>
                      <span className="truncate text-body-sm font-semibold text-text-primary">{fileDetails.name}</span>
                    </div>
                    <p className="mt-1 text-body-sm text-text-secondary">
                      {fileDetails.size} · {fileDetails.mime}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleUpload} isLoading={loading} size="md" variant="primary" disabled={!file || loading}>
                      Detect Media
                    </Button>
                    <Button onClick={resetAll} size="md" variant="outline">
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-border-default bg-surface-0">
                  {previewUrl && mediaKind === 'image' && (
                    <img src={previewUrl} alt="Selected upload preview" className="max-h-104 w-full object-cover" />
                  )}
                  {previewUrl && mediaKind === 'video' && (
                    <video src={previewUrl} controls className="max-h-104 w-full bg-black object-cover" />
                  )}
                </div>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl border border-error/25 bg-error/10 px-4 py-3 text-body-sm text-error"
              >
                <span className="mr-2 font-bold">!</span>
                {error}
              </motion.div>
            )}

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border-default bg-surface-2/70 p-4">
                <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Workflow</div>
                <div className="mt-2 text-body-sm font-semibold text-text-primary">Drop, analyze, review</div>
              </div>
              <div className="rounded-2xl border border-border-default bg-surface-2/70 p-4">
                <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Video mode</div>
                <div className="mt-2 text-body-sm font-semibold text-text-primary">Frame sampling</div>
              </div>
              <div className="rounded-2xl border border-border-default bg-surface-2/70 p-4">
                <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Output</div>
                <div className="mt-2 text-body-sm font-semibold text-text-primary">Verdict + confidence</div>
              </div>
            </div>
          </Card>

          <Card
            variant="default"
            padding="lg"
            className="overflow-hidden border-border-light bg-surface-1/90 shadow-2xl shadow-black/20 backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-5">
              <div>
                <div className="text-caption uppercase tracking-[0.22em] text-text-tertiary">Step 2</div>
                <h2 className="mt-1 text-heading2 font-bold text-text-primary">Detection report</h2>
              </div>

              {result ? (
                <Badge variant={result.prediction === 'Fake' ? 'error' : 'success'} size="sm" className="uppercase">
                  {result.prediction} media
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" className="uppercase">
                  Awaiting analysis
                </Badge>
              )}
            </div>

            <AnimatePresence mode="wait">
              {loading && !result ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 space-y-4"
                >
                  <div className="rounded-3xl border border-border-default bg-surface-2 p-5">
                    <div className="h-4 w-24 animate-pulse rounded bg-surface-3" />
                    <div className="mt-4 h-12 w-64 animate-pulse rounded-lg bg-surface-3" />
                    <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-surface-3" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="rounded-2xl border border-border-default bg-surface-2 p-4">
                        <div className="h-3 w-20 animate-pulse rounded bg-surface-3" />
                        <div className="mt-3 h-6 w-24 animate-pulse rounded bg-surface-3" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key={result.metadata.fileName}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="mt-6 space-y-6"
                >
                  <div className={`rounded-3xl border p-6 shadow-lg ${verdictFrameClass(result.prediction)}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="text-caption uppercase tracking-[0.24em] opacity-80">Prediction</div>
                        <div className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                          {result.prediction === 'Fake' ? 'Deepfake' : 'Real'}
                        </div>
                        <p className="mt-3 max-w-xl text-body-sm text-text-secondary">
                          {result.message}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border-default bg-surface-1/85 px-4 py-3 shadow-sm">
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Confidence level</div>
                        <div className="mt-1 text-body font-semibold text-text-primary">{formatConfidenceLabel(result.confidence)}</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-body-sm text-text-secondary">
                        <span>Confidence</span>
                        <span>{confidencePercent(result.confidence)}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                        <div
                          className={`h-full rounded-full bg-linear-to-r ${verdictAccent(result.prediction)} transition-all duration-500 ease-in-out ${confidenceTrackClass(result.prediction)}`}
                          style={{ width: `${confidencePercent(result.confidence)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricTile label="Confidence Level" value={result.confidenceLevel} />
                    <MetricTile label="Processing Time" value={`${result.processingTimeMs} ms`} />
                    <MetricTile label="Media Type" value={result.mediaType.toUpperCase()} />
                    <MetricTile label="Frames Analyzed" value={`${result.metadata.framesAnalyzed ?? 1}`} />
                  </div>

                  <div className="rounded-3xl border border-border-default bg-surface-2/80 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Analysis metadata</div>
                        <div className="mt-1 text-body-sm font-semibold text-text-primary">Model and file details</div>
                      </div>
                      <Badge variant={result.prediction === 'Fake' ? 'error' : 'success'} size="sm">
                        {result.prediction === 'Fake' ? 'High risk' : 'Low risk'}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border-default bg-surface-1 p-4">
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">File</div>
                        <div className="mt-1 text-body-sm font-semibold text-text-primary">{result.metadata.fileName}</div>
                      </div>
                      <div className="rounded-2xl border border-border-default bg-surface-1 p-4">
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Size</div>
                        <div className="mt-1 text-body-sm font-semibold text-text-primary">
                          {formatBytes(result.metadata.fileSizeBytes)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border-default bg-surface-1 p-4">
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Model</div>
                        <div className="mt-1 text-body-sm font-semibold text-text-primary">{result.metadata.modelVersion}</div>
                      </div>
                      <div className="rounded-2xl border border-border-default bg-surface-1 p-4">
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Sampling</div>
                        <div className="mt-1 text-body-sm font-semibold text-text-primary">
                          {result.metadata.samplingStrategy ?? 'n/a'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge variant="outline" size="sm">
                        Binary decision
                      </Badge>
                      <Badge variant="outline" size="sm">
                        0.5 threshold
                      </Badge>
                      <Badge variant="outline" size="sm">
                        Unified model
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-default pt-4">
                    <p className="text-caption text-text-tertiary">
                      {result.prediction === 'Fake'
                        ? 'The media shows stronger signals of manipulation.'
                        : 'The media is currently classified as authentic by the model.'}
                    </p>
                    <div className="flex gap-3">
                      <Button onClick={handleUpload} isLoading={loading} size="md" variant="primary" disabled={!file || loading}>
                        Re-run detection
                      </Button>
                      <Button onClick={resetAll} size="md" variant="outline">
                        Clear file
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="mt-6"
                >
                  <div className="rounded-3xl border border-border-default bg-linear-to-br from-surface-1 to-surface-2 p-8 shadow-sm">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-500/20 bg-primary-600/10 text-2xl text-primary-500">
                      ◌
                    </div>
                    <h3 className="mt-5 text-heading3 font-bold text-text-primary">No analysis yet</h3>
                    <p className="mt-3 max-w-lg text-body-sm text-text-secondary leading-relaxed">
                      Choose a file to populate the right-hand report panel with confidence, processing time,
                      frame count, and model metadata.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border-default bg-surface-1 p-4">
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Output 1</div>
                        <div className="mt-1 text-body-sm font-semibold text-text-primary">Real / Fake verdict</div>
                      </div>
                      <div className="rounded-2xl border border-border-default bg-surface-1 p-4">
                        <div className="text-caption uppercase tracking-[0.18em] text-text-tertiary">Output 2</div>
                        <div className="mt-1 text-body-sm font-semibold text-text-primary">Confidence + metadata</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 border-t border-border-default pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-caption text-text-tertiary">
                  Professional screening surface with a single-model pipeline, adaptive sampling, and clear verdict states.
                </p>
                <Link href="/analysis" className="text-body-sm font-medium text-primary-600 hover:underline">
                  Back to claim analysis
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}