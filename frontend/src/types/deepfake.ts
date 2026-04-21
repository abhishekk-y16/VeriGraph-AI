export type DeepfakeMediaType = 'image' | 'video';
export type DeepfakePrediction = 'Real' | 'Fake';
export type DeepfakeConfidenceLevel = 'Low' | 'Medium' | 'High';

export interface DeepfakeMetadata {
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  mediaType: DeepfakeMediaType;
  modelVersion: string;
  frameCount?: number | null;
  framesAnalyzed?: number | null;
  samplingStrategy?: string | null;
}

export interface DeepfakeResult {
  mediaType: DeepfakeMediaType;
  prediction: DeepfakePrediction;
  confidence: number;
  confidenceLevel: DeepfakeConfidenceLevel;
  processingTimeMs: number;
  message: string;
  metadata: DeepfakeMetadata;
}