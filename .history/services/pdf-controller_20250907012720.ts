// PDF Generation Controller - Main orchestrator for PDF generation workflow

import {
  PDFOptions,
  PDFResult,
  BrowserCapabilities,
  GenerationStrategy,
  PDFConfiguration,
  GenerationResult,
  ErrorRecoveryPlan
} from '../types/pdf';
import {
  PDFGenerationError,
  BrowserCompatibilityError,
  GenerationTimeoutError,
  ErrorHandler
} from '../utils/errors';
import { PDFErrorRecoveryService } from './pdf-error-recovery';
import {
  TIMEOUTS,
  MEMORY_LIMITS,
  STRATEGY_PRIORITY,
  REQUIRED_FEATURES,
  DEFAULT_METADATA,
  DEFAULT_MARGINS,
  PAGE_FORMATS,
  DPI_SETTINGS
} from '../constants/pdf-constants';

/**
 * Main controller class that orchestrates PDF generation workflow
 * Handles strategy selection, browser capability detection, and error recovery
 */
export class PDFGenerationController {
  private currentStrategy: GenerationStrategy = 'modern';
  private browserCapabilities: BrowserCapabilities | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private errorRecoveryService: PDFErrorRecoveryService;

  constructor() {
    this.detectBrowserCapabilities();
    this.errorRecoveryService = new PDFErrorRecoveryService();
  }

  /**
   * Main entry point for PDF generation
   * Coordinates the entire generation workflow with error handling and fallbacks
   */
  async generatePDF(element: HTMLElement, options: PDFOptions): Promise<PDFResult> {
    const startTime = Date.now();
    
    try {
      // Validate input parameters
      this.validateInputs(element, options);
      
      // Select optimal generation strategy
      const strategy = this.selectStrategy(this.browserCapabilities!);
      this.currentStrategy = strategy;
      
      // Create full configuration
      const config = this.createConfiguration(options, strategy);
      
      // Attempt PDF generation with selected strategy
      const result = await this.executeGeneration(element, config);
      
      // Calculate generation metadata
      const duration = Date.now() - startTime;
      result.metadata.duration = duration;
      
      return result;
      
    } catch (error) {
      return this.handleGenerationError(error, element, options, startTime);
    }
  }

  /**
   * Detect browser capabilities for strategy selection
   */
  validateBrowserSupport(): BrowserCapabilities {
    if (this.browserCapabilities) {
      return this.browserCapabilities;
    }
    
    return this.detectBrowserCapabilities();
  }

  /**
   * Select the optimal generation strategy based on browser capabilities
   */
  selectStrategy(capabilities: BrowserCapabilities): GenerationStrategy {
    // Check if modern strategy is supported
    if (this.canUseModernStrategy(capabilities)) {
      return 'modern';
    }
    
    // Check if fallback strategy is available
    if (this.canUseFallbackStrategy()) {
      return 'fallback';
    }
    
    // Default to legacy strategy
    return 'legacy';
  }

  /**
   * Create default PDF configuration
   */
  createDefaultConfiguration(): PDFConfiguration {
    return {
      format: 'letter',
      orientation: 'portrait',
      margins: DEFAULT_MARGINS,
      resolution: DPI_SETTINGS.medium,
      compression: {
        text: true,
        images: true,
        level: 'medium'
      },
      imageQuality: 0.85,
      fonts: [],
      colors: {
        mode: 'rgb'
      },
      metadata: {
        title: 'Professional CV',
        author: 'CV Owner',
        creator: DEFAULT_METADATA.creator,
        producer: DEFAULT_METADATA.producer,
        subject: DEFAULT_METADATA.subject,
        keywords: DEFAULT_METADATA.keywords
      },
      strategy: 'modern',
      timeout: TIMEOUTS.modern,
      retryAttempts: 3
    };
  }

  /**
   * Get recovery suggestions for failed generation
   */
  getRecoverySuggestions(error: PDFGenerationError): string[] {
    return this.errorRecoveryService.getRecoverySuggestions(error);
  }

  /**
   * Get system health status
   */
  getSystemHealth(): {
    isStable: boolean;
    recommendation: string;
    errorStats: any;
    recoveryStats: any;
  } {
    const errorStats = ErrorHandler.getErrorStatistics();
    const recoveryStats = this.errorRecoveryService.getRecoveryStatistics();
    
    return {
      isStable: !ErrorHandler.isSystemUnstable(),
      recommendation: ErrorHandler.getSystemRecommendation(),
      errorStats,
      recoveryStats
    };
  }

  /**
   * Reset error tracking and recovery history
   */
  resetErrorTracking(): void {
    ErrorHandler.clearErrorHistory();
    this.errorRecoveryService.clearRecoveryHistory();
    this.retryCount = 0;
  }

  /**
   * Check if the system is ready for PDF generation
   */
  isSystemReady(): { ready: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!this.browserCapabilities) {
      issues.push('Browser capabilities not detected');
    } else {
      if (!this.browserCapabilities.supportsCanvas) {
        issues.push('Canvas support not available');
      }
      
      if (this.browserCapabilities.maxCanvasSize < REQUIRED_FEATURES.minCanvasSize) {
        issues.push('Canvas size limitations detected');
      }
      
      if (this.browserCapabilities.memoryLimit < MEMORY_LIMITS.warningThreshold) {
        issues.push('Low memory availability');
      }
    }
    
    if (ErrorHandler.isSystemUnstable()) {
      issues.push('System appears unstable due to recent errors');
    }
    
    return {
      ready: issues.length === 0,
      issues
    };
  }

  // Private methods

  /**
   * Detect and cache browser capabilities
   */
  private detectBrowserCapabilities(): BrowserCapabilities {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const capabilities: BrowserCapabilities = {
      supportsCanvas: !!ctx,
      supportsWebGL: this.detectWebGLSupport(),
      supportsWorkers: typeof Worker !== 'undefined',
      supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
      maxCanvasSize: this.detectMaxCanvasSize(),
      memoryLimit: this.estimateMemoryLimit()
    };
    
    this.browserCapabilities = capabilities;
    return capabilities;
  }

  /**
   * Check if WebGL is supported
   */
  private detectWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  /**
   * Detect maximum canvas size supported by browser
   */
  private detectMaxCanvasSize(): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return MEMORY_LIMITS.minCanvasSize;
    
    // Test progressively larger canvas sizes
    let maxSize = MEMORY_LIMITS.minCanvasSize;
    const testSizes = [2048, 4096, 8192, 16384, 32767];
    
    for (const size of testSizes) {
      try {
        canvas.width = size;
        canvas.height = size;
        ctx.fillRect(0, 0, 1, 1);
        maxSize = size;
      } catch {
        break;
      }
    }
    
    return Math.min(maxSize, MEMORY_LIMITS.maxCanvasSize);
  }

  /**
   * Estimate available memory for PDF generation
   */
  private estimateMemoryLimit(): number {
    // Use performance.memory if available (Chrome)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.jsHeapSizeLimit || MEMORY_LIMITS.maxMemoryUsage;
    }
    
    // Fallback to conservative estimate
    return MEMORY_LIMITS.maxMemoryUsage;
  }

  /**
   * Check if modern strategy can be used
   */
  private canUseModernStrategy(capabilities: BrowserCapabilities): boolean {
    return (
      capabilities.supportsCanvas &&
      capabilities.maxCanvasSize >= REQUIRED_FEATURES.minCanvasSize &&
      capabilities.memoryLimit >= MEMORY_LIMITS.warningThreshold
    );
  }

  /**
   * Check if fallback strategy is available
   */
  private canUseFallbackStrategy(): boolean {
    // This would check if server-side generation is available
    // For now, we'll assume it's not available in client-side only setup
    return false;
  }

  /**
   * Validate input parameters
   */
  private validateInputs(element: HTMLElement, options: PDFOptions): void {
    if (!element) {
      throw new PDFGenerationError('No element provided for PDF generation', 'content', false);
    }
    
    if (!element.offsetWidth || !element.offsetHeight) {
      throw new PDFGenerationError('Element has no visible dimensions', 'content', true, 'fallback');
    }
    
    if (!options.filename) {
      throw new PDFGenerationError('No filename provided', 'content', false);
    }
  }

  /**
   * Create full configuration from options
   */
  private createConfiguration(options: PDFOptions, strategy: GenerationStrategy): PDFConfiguration {
    const defaultConfig = this.createDefaultConfiguration();
    
    return {
      ...defaultConfig,
      format: options.format,
      margins: options.margins,
      metadata: {
        ...defaultConfig.metadata,
        ...options.metadata
      },
      strategy,
      timeout: TIMEOUTS[strategy],
      resolution: DPI_SETTINGS[options.quality]
    };
  }

  /**
   * Execute PDF generation with the selected strategy
   */
  private async executeGeneration(element: HTMLElement, config: PDFConfiguration): Promise<PDFResult> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new GenerationTimeoutError(config.timeout, config.strategy));
      }, config.timeout);
    });

    const generation = this.generateWithStrategy(element, config);
    
    try {
      return await Promise.race([generation, timeout]);
    } catch (error) {
      if (error instanceof GenerationTimeoutError) {
        throw error;
      }
      throw ErrorHandler.fromError(error as Error, this.getNextStrategy(config.strategy));
    }
  }

  /**
   * Generate PDF using the specified strategy
   */
  private async generateWithStrategy(element: HTMLElement, config: PDFConfiguration): Promise<PDFResult> {
    switch (config.strategy) {
      case 'modern':
        return this.generateWithModernStrategy(element, config);
      case 'fallback':
        return this.generateWithFallbackStrategy(element, config);
      case 'legacy':
        return this.generateWithLegacyStrategy(element, config);
      default:
        throw new PDFGenerationError(`Unknown strategy: ${config.strategy}`, 'generation', false);
    }
  }

  /**
   * Generate PDF using modern strategy (jsPDF + html2canvas)
   */
  private async generateWithModernStrategy(element: HTMLElement, config: PDFConfiguration): Promise<PDFResult> {
    // This will be implemented in task 3.1
    throw new PDFGenerationError('Modern strategy not yet implemented', 'generation', true, 'fallback');
  }

  /**
   * Generate PDF using fallback strategy (server-side)
   */
  private async generateWithFallbackStrategy(element: HTMLElement, config: PDFConfiguration): Promise<PDFResult> {
    // This will be implemented later as server-side fallback
    throw new PDFGenerationError('Fallback strategy not available', 'generation', true, 'legacy');
  }

  /**
   * Generate PDF using legacy strategy (html2pdf.js)
   */
  private async generateWithLegacyStrategy(element: HTMLElement, config: PDFConfiguration): Promise<PDFResult> {
    // This will use the existing html2pdf.js implementation as fallback
    throw new PDFGenerationError('Legacy strategy not yet implemented', 'generation', false);
  }

  /**
   * Get the next strategy in the fallback chain
   */
  private getNextStrategy(currentStrategy: GenerationStrategy): GenerationStrategy | undefined {
    const currentIndex = STRATEGY_PRIORITY.indexOf(currentStrategy);
    return STRATEGY_PRIORITY[currentIndex + 1];
  }

  /**
   * Handle generation errors with advanced recovery logic
   */
  private async handleGenerationError(
    error: unknown,
    element: HTMLElement,
    options: PDFOptions,
    startTime: number
  ): Promise<PDFResult> {
    const pdfError = error instanceof PDFGenerationError 
      ? error 
      : ErrorHandler.fromError(error as Error);

    ErrorHandler.logError(pdfError);

    // Create configuration for potential recovery
    const config = this.createConfiguration(options, this.currentStrategy);

    // Check if recovery should be attempted
    if (this.errorRecoveryService.shouldAttemptRecovery(pdfError, config)) {
      try {
        return await this.errorRecoveryService.attemptRecovery(
          pdfError,
          element,
          config,
          (el, cfg) => this.executeGeneration(el, cfg)
        );
      } catch (recoveryError) {
        // If recovery fails, continue with original error handling
        ErrorHandler.logError(recoveryError instanceof PDFGenerationError 
          ? recoveryError 
          : ErrorHandler.fromError(recoveryError as Error));
      }
    }

    // Return error result with recovery suggestions
    const duration = Date.now() - startTime;
    const suggestions = this.errorRecoveryService.getRecoverySuggestions(pdfError);
    
    return {
      success: false,
      error: pdfError.getUserMessage(),
      metadata: {
        strategy: this.currentStrategy,
        duration,
        fileSize: 0,
        pageCount: 0,
        warnings: [
          pdfError.getTechnicalDetails(),
          ...suggestions.map(s => `Suggestion: ${s}`)
        ]
      }
    };
  }
}