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
 * Enhanced PDF Generation Service with Modern Generator
 * Integrates the new ModernPDFGenerator for high-quality PDF generation
 */
export class PDFGenerationService {
  private static instance: PDFGenerationService;
  private modernGenerator: ModernPDFGenerator;

  private constructor() {
    this.modernGenerator = new ModernPDFGenerator();
  }

  static getInstance(): PDFGenerationService {
    if (!PDFGenerationService.instance) {
      PDFGenerationService.instance = new PDFGenerationService();
    }
    return PDFGenerationService.instance;
  }

  /**
   * Generate PDF using the modern strategy
   */
  async generatePDF(element: HTMLElement, options: Partial<PDFOptions> = {}): Promise<PDFResult> {
    try {
      // Validate browser capabilities
      BrowserDetector.validateRequiredFeatures();
      
      // Create complete options with defaults
      const completeOptions = this.createCompleteOptions(options);
      
      // Use modern generator for PDF creation
      const result = await this.modernGenerator.generatePDF(element, completeOptions);
      
      return result;
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
   * Create complete options with defaults
   */
  private createCompleteOptions(options: Partial<PDFOptions>): PDFOptions {
    const defaultConfig = ConfigurationManager.getDefaultConfiguration();
    
    return {
      filename: options.filename || 'CV.pdf',
      quality: options.quality || 'high',
      format: options.format || defaultConfig.format,
      margins: options.margins || defaultConfig.margins,
      metadata: {
        title: options.metadata?.title || 'Professional CV',
        author: options.metadata?.author || 'CV Owner',
        subject: options.metadata?.subject || 'Professional CV Document',
        keywords: options.metadata?.keywords || ['CV', 'Resume', 'Professional'],
        creator: options.metadata?.creator || 'ATS CV Optimizer',
        producer: options.metadata?.producer || 'Modern PDF Generator'
      }
    };
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