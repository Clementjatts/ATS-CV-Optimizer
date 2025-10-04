// PDF Generation System - Type Exports

export * from './pdf';
export * from '../utils/errors';
export * from '../utils/pdf-utils';
export * from '../services/pdf-generation';
export * from '../services/pdf-modern-generator';
export * from '../services/pdf-font-manager';
export * from '../services/pdf-image-processor';
export * from '../services/pdf-document-processor';
export * from '../services/pdf-page-break-handler';
export * from '../services/pdf-layout-optimizer';
export * from '../services/pdf-document-processing-service';
export * from '../constants/pdf-constants';

// Quality Assurance Module Types
export type {
  PDFValidationOptions,
  ComplianceCheckResult,
  TextExtractionResult,
  LayoutIntegrityResult,
  FileSizeValidationResult
} from '../services/pdf-validation-service';

export type {
  ATSCompatibilityOptions,
  TextExtractionTest,
  SearchabilityTest,
  MetadataValidation,
  ParserCompatibilityTest,
  ATSCompatibilityResult
} from '../services/pdf-ats-compatibility-service';

export type {
  PerformanceMetrics,
  QualityScore,
  QualityReport,
  QualityRecommendation,
  TechnicalDetails,
  QualityTrend,
  QualityDashboard
} from '../services/pdf-quality-metrics-service';

// File Management System Types
export type {
  FilenameOptions,
  FilenameResult
} from '../services/pdf-filename-generator';

export type {
  DownloadOptions,
  DownloadProgress,
  DownloadResult
} from '../services/pdf-download-manager';

export type {
  FileManagerOptions,
  FileManagerResult
} from '../services/pdf-file-manager';