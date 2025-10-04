// PDF Generation System Type Definitions

export type PageFormat = 'letter' | 'a4';
export type GenerationStrategy = 'modern' | 'fallback' | 'legacy';
export type ErrorCategory = 'browser' | 'content' | 'generation' | 'network' | 'validation';

// Core PDF Configuration
export interface PDFOptions {
  filename: string;
  quality: 'high' | 'medium' | 'low';
  format: PageFormat;
  margins: MarginConfig;
  metadata: DocumentMetadata;
}

export interface MarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DocumentMetadata {
  title: string;
  author: string;
  subject?: string;
  keywords?: string[];
  creator: string;
  producer: string;
}

// Browser Capabilities Detection
export interface BrowserCapabilities {
  supportsCanvas: boolean;
  supportsWebGL: boolean;
  supportsWorkers: boolean;
  supportsOffscreenCanvas: boolean;
  maxCanvasSize: number;
  memoryLimit: number;
}

// PDF Generation Results
export interface PDFResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  metadata: GenerationMetadata;
}

export interface GenerationMetadata {
  strategy: GenerationStrategy;
  duration: number;
  fileSize: number;
  pageCount: number;
  warnings: string[];
}

// Quality Metrics
export interface QualityMetrics {
  textExtractability: number; // 0-1
  layoutFidelity: number; // 0-1
  atsCompatibility: boolean;
  pdfCompliance: string[]; // PDF standards met
}

// Advanced PDF Configuration
export interface PDFConfiguration {
  // Document settings
  format: PageFormat;
  orientation: 'portrait' | 'landscape';
  margins: MarginConfig;
  
  // Quality settings
  resolution: number; // DPI
  compression: CompressionSettings;
  imageQuality: number; // 0-1
  
  // Content settings
  fonts: FontConfiguration[];
  colors: ColorProfile;
  metadata: DocumentMetadata;
  
  // Generation settings
  strategy: GenerationStrategy;
  timeout: number;
  retryAttempts: number;
}

export interface FontConfiguration {
  family: string;
  variants: string[];
  fallbacks: string[];
  embedSubset: boolean;
}

export interface CompressionSettings {
  text: boolean;
  images: boolean;
  level: 'none' | 'low' | 'medium' | 'high';
}

export interface ColorProfile {
  mode: 'rgb' | 'cmyk';
  iccProfile?: string;
}

// Generation Result with Quality
export interface GenerationResult {
  success: boolean;
  blob?: Blob;
  error?: PDFGenerationError;
  metadata: GenerationMetadata;
  quality: QualityMetrics;
}

// Server-side PDF Options (for fallback)
export interface ServerPDFOptions {
  format: PageFormat;
  margins: MarginConfig;
  printBackground: boolean;
  displayHeaderFooter: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  preferCSSPageSize: boolean;
}

// Validation Results
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Error Recovery Plan
export interface ErrorRecoveryPlan {
  retryWithSameStrategy: boolean;
  fallbackStrategy?: GenerationStrategy;
  userAction?: string;
  technicalDetails: string;
}