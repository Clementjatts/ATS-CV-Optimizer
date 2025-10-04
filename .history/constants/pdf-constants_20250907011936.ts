// PDF Generation System Constants

// Page formats and dimensions (in inches)
export const PAGE_FORMATS = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 }
} as const;

// DPI settings for different quality levels
export const DPI_SETTINGS = {
  low: 150,
  medium: 200,
  high: 300
} as const;

// Default margins (in inches)
export const DEFAULT_MARGINS = {
  top: 0.5,
  right: 0.5,
  bottom: 0.5,
  left: 0.5
} as const;

// Generation timeouts (in milliseconds)
export const TIMEOUTS = {
  modern: 30000,    // 30 seconds for modern strategy
  fallback: 45000,  // 45 seconds for server-side fallback
  legacy: 20000     // 20 seconds for legacy html2pdf
} as const;

// Memory limits and thresholds
export const MEMORY_LIMITS = {
  maxCanvasSize: 32767,
  minCanvasSize: 1024,
  maxMemoryUsage: 100 * 1024 * 1024, // 100MB
  warningThreshold: 50 * 1024 * 1024  // 50MB
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  maxSize: 10 * 1024 * 1024,  // 10MB maximum
  targetSize: 2 * 1024 * 1024, // 2MB target
  warningSize: 5 * 1024 * 1024 // 5MB warning threshold
} as const;

// Quality thresholds
export const QUALITY_THRESHOLDS = {
  textExtractability: 0.95,  // 95% text should be extractable
  layoutFidelity: 0.90,      // 90% layout accuracy
  minQualityScore: 0.80      // 80% overall quality minimum
} as const;

// Font configurations
export const FONT_CONFIGS = {
  primary: {
    family: 'Calibri',
    fallbacks: ['Arial', 'Helvetica', 'sans-serif']
  },
  secondary: {
    family: 'Arial',
    fallbacks: ['Helvetica', 'sans-serif']
  },
  monospace: {
    family: 'Courier New',
    fallbacks: ['Courier', 'monospace']
  }
} as const;

// Error messages
export const ERROR_MESSAGES = {
  browserUnsupported: 'Your browser doesn\'t support the required features for PDF generation.',
  contentTooLarge: 'The CV content is too large to process. Please reduce the content size.',
  networkError: 'Network connection issue. Please check your internet connection and try again.',
  timeoutError: 'PDF generation timed out. Please try again with a simpler layout.',
  validationFailed: 'The generated PDF doesn\'t meet quality standards.',
  unknownError: 'An unexpected error occurred. Please try again.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  pdfGenerated: 'PDF generated successfully!',
  downloadStarted: 'Download started. Check your downloads folder.',
  qualityValidated: 'PDF quality validation passed.'
} as const;

// CSS classes for PDF optimization
export const PDF_CSS_CLASSES = {
  printOnly: 'pdf-print-only',
  screenOnly: 'pdf-screen-only',
  pageBreak: 'pdf-page-break',
  noBreak: 'pdf-no-break',
  optimized: 'pdf-optimized'
} as const;

// Generation strategies priority order
export const STRATEGY_PRIORITY: readonly ['modern', 'fallback', 'legacy'] = [
  'modern',
  'fallback', 
  'legacy'
] as const;

// Browser feature requirements
export const REQUIRED_FEATURES = {
  canvas: true,
  webgl: false,
  workers: false,
  offscreenCanvas: false,
  minCanvasSize: 2048
} as const;

// PDF metadata defaults
export const DEFAULT_METADATA = {
  creator: 'ATS CV Optimizer',
  producer: 'ATS CV Optimizer PDF Generator',
  subject: 'Professional CV Document',
  keywords: ['CV', 'Resume', 'Professional', 'ATS']
} as const;