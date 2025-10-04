// Main PDF Generation Service Interface

import { 
  PDFOptions, 
  PDFResult, 
  BrowserCapabilities, 
  GenerationStrategy,
  PDFConfiguration 
} from '../types/pdf';
import { PDFGenerationError, ErrorHandler } from '../utils/errors';
import { BrowserDetector, ConfigurationManager } from '../utils/pdf-utils';
import { ModernPDFGenerator } from './pdf-modern-generator';

/**
 * Main PDF Generation Controller Interface
 * This will be implemented in task 2.1
 */
export interface IPDFGenerationController {
  generatePDF(element: HTMLElement, options: PDFOptions): Promise<PDFResult>;
  validateBrowserSupport(): BrowserCapabilities;
  selectStrategy(capabilities: BrowserCapabilities): GenerationStrategy;
}

/**
 * Modern PDF Generator Interface (Primary Strategy)
 * This will be implemented in task 3.1
 */
export interface IModernPDFGenerator {
  generate(element: HTMLElement, config: PDFConfiguration): Promise<PDFResult>;
  validateCapabilities(): boolean;
  estimateGenerationTime(element: HTMLElement): number;
}

/**
 * Server-side PDF Generator Interface (Fallback Strategy)
 * This will be implemented as part of fallback strategy
 */
export interface IServerPDFGenerator {
  generateFromHTML(html: string, css: string, options: any): Promise<Buffer>;
  validateHTML(html: string): { isValid: boolean; errors: string[] };
  optimizeForPrint(html: string): string;
}

/**
 * Document Processor Interface
 * This will be implemented in task 4.1
 */
export interface IDocumentProcessor {
  extractContent(element: HTMLElement): string;
  sanitizeHTML(html: string): string;
  optimizeForPDF(html: string): string;
  handlePageBreaks(html: string): string;
}

/**
 * Quality Assurance Interface
 * This will be implemented in task 5.1
 */
export interface IQualityAssurance {
  validatePDF(blob: Blob): Promise<{ isValid: boolean; issues: string[] }>;
  checkATSCompatibility(blob: Blob): Promise<boolean>;
  assessQuality(blob: Blob): Promise<{ score: number; metrics: any }>;
}

/**
 * Temporary placeholder implementation for immediate use
 * This maintains compatibility while we build the new system
 */
export class PDFGenerationService {
  private static instance: PDFGenerationService;

  private constructor() {}

  static getInstance(): PDFGenerationService {
    if (!PDFGenerationService.instance) {
      PDFGenerationService.instance = new PDFGenerationService();
    }
    return PDFGenerationService.instance;
  }

  /**
   * Temporary method that will be replaced by the full implementation
   */
  async generatePDF(element: HTMLElement, options: Partial<PDFOptions> = {}): Promise<PDFResult> {
    try {
      // Validate browser capabilities
      BrowserDetector.validateRequiredFeatures();
      
      // For now, return a placeholder result
      // This will be replaced with actual implementation in subsequent tasks
      return {
        success: false,
        error: 'PDF generation system is being upgraded. Please use the current system temporarily.',
        metadata: {
          strategy: 'modern',
          duration: 0,
          fileSize: 0,
          pageCount: 0,
          warnings: ['System under development']
        }
      };
    } catch (error) {
      const pdfError = ErrorHandler.fromError(error as Error);
      ErrorHandler.logError(pdfError);
      
      return {
        success: false,
        error: pdfError.getUserMessage(),
        metadata: {
          strategy: 'modern',
          duration: 0,
          fileSize: 0,
          pageCount: 0,
          warnings: [pdfError.getTechnicalDetails()]
        }
      };
    }
  }

  /**
   * Get browser capabilities
   */
  getBrowserCapabilities(): BrowserCapabilities {
    return BrowserDetector.detectCapabilities();
  }

  /**
   * Get default configuration
   */
  getDefaultConfiguration(): PDFConfiguration {
    return ConfigurationManager.getDefaultConfiguration();
  }
}