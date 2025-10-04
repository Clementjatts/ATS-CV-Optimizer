// PDF Generation Error Handling Classes and Utilities

import { ErrorCategory, GenerationStrategy, ErrorRecoveryPlan } from '../types/pdf';

/**
 * Custom error class for PDF generation failures
 */
export class PDFGenerationError extends Error {
  public readonly category: ErrorCategory;
  public readonly recoverable: boolean;
  public readonly fallbackStrategy?: GenerationStrategy;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    category: ErrorCategory,
    recoverable: boolean = true,
    fallbackStrategy?: GenerationStrategy,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'PDFGenerationError';
    this.category = category;
    this.recoverable = recoverable;
    this.fallbackStrategy = fallbackStrategy;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PDFGenerationError);
    }
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.category) {
      case 'browser':
        return 'Your browser doesn\'t support all required features for PDF generation. We\'ll try an alternative method.';
      case 'content':
        return 'There was an issue processing your CV content. Please check for any unusual formatting.';
      case 'generation':
        return 'PDF generation failed. This might be due to complex content or browser limitations.';
      case 'network':
        return 'Network connection issue prevented PDF generation. Please check your internet connection.';
      case 'validation':
        return 'The generated PDF didn\'t meet quality standards. We\'ll try to regenerate it.';
      default:
        return 'An unexpected error occurred during PDF generation. Please try again.';
    }
  }

  /**
   * Get technical details for debugging
   */
  getTechnicalDetails(): string {
    return `${this.category.toUpperCase()}: ${this.message}${
      this.context ? ` | Context: ${JSON.stringify(this.context)}` : ''
    }`;
  }

  /**
   * Create an error recovery plan
   */
  getRecoveryPlan(): ErrorRecoveryPlan {
    return {
      retryWithSameStrategy: this.category === 'network' || this.category === 'generation',
      fallbackStrategy: this.fallbackStrategy,
      userAction: this.getUserMessage(),
      technicalDetails: this.getTechnicalDetails()
    };
  }
}

/**
 * Browser compatibility error
 */
export class BrowserCompatibilityError extends PDFGenerationError {
  constructor(missingFeature: string, fallbackStrategy?: GenerationStrategy) {
    super(
      `Browser missing required feature: ${missingFeature}`,
      'browser',
      true,
      fallbackStrategy,
      { missingFeature }
    );
  }
}

/**
 * Content processing error
 */
export class ContentProcessingError extends PDFGenerationError {
  constructor(issue: string, element?: string) {
    super(
      `Content processing failed: ${issue}`,
      'content',
      true,
      'fallback',
      { issue, element }
    );
  }
}

/**
 * PDF generation timeout error
 */
export class GenerationTimeoutError extends PDFGenerationError {
  constructor(timeoutMs: number, strategy: GenerationStrategy) {
    super(
      `PDF generation timed out after ${timeoutMs}ms`,
      'generation',
      true,
      strategy === 'modern' ? 'fallback' : 'legacy',
      { timeoutMs, strategy }
    );
  }
}

/**
 * Network-related error for server-side generation
 */
export class NetworkError extends PDFGenerationError {
  constructor(statusCode?: number, responseText?: string) {
    super(
      `Network error during server-side PDF generation${statusCode ? ` (${statusCode})` : ''}`,
      'network',
      true,
      'legacy',
      { statusCode, responseText }
    );
  }
}

/**
 * PDF validation error
 */
export class ValidationError extends PDFGenerationError {
  constructor(validationIssues: string[]) {
    super(
      `PDF validation failed: ${validationIssues.join(', ')}`,
      'validation',
      true,
      'fallback',
      { validationIssues }
    );
  }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
  /**
   * Categorize an unknown error
   */
  static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('canvas') || message.includes('webgl') || message.includes('not supported')) {
      return 'browser';
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    
    if (message.includes('timeout') || message.includes('time out')) {
      return 'generation';
    }
    
    if (message.includes('invalid') || message.includes('malformed') || message.includes('corrupt')) {
      return 'content';
    }
    
    return 'generation';
  }

  /**
   * Create a PDFGenerationError from a generic error
   */
  static fromError(error: Error, fallbackStrategy?: GenerationStrategy): PDFGenerationError {
    if (error instanceof PDFGenerationError) {
      return error;
    }

    const category = this.categorizeError(error);
    return new PDFGenerationError(
      error.message,
      category,
      true,
      fallbackStrategy,
      { originalError: error.name }
    );
  }

  /**
   * Log error with appropriate level
   */
  static logError(error: PDFGenerationError): void {
    const logData = {
      category: error.category,
      message: error.message,
      recoverable: error.recoverable,
      timestamp: error.timestamp,
      context: error.context
    };

    if (error.recoverable) {
      console.warn('PDF Generation Warning:', logData);
    } else {
      console.error('PDF Generation Error:', logData);
    }
  }

  /**
   * Check if error should trigger fallback
   */
  static shouldFallback(error: PDFGenerationError): boolean {
    return error.recoverable && !!error.fallbackStrategy;
  }
}