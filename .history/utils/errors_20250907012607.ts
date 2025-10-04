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
 * Error handler utility functions with recovery mechanisms
 */
export class ErrorHandler {
  private static errorHistory: PDFGenerationError[] = [];
  private static readonly MAX_HISTORY = 50;

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
   * Log error with appropriate level and store in history
   */
  static logError(error: PDFGenerationError): void {
    const logData = {
      category: error.category,
      message: error.message,
      recoverable: error.recoverable,
      timestamp: error.timestamp,
      context: error.context
    };

    // Store in error history
    this.addToHistory(error);

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

  /**
   * Create comprehensive error recovery plan
   */
  static createRecoveryPlan(error: PDFGenerationError, attemptCount: number = 1): ErrorRecoveryPlan {
    const baseRecovery = error.getRecoveryPlan();
    
    // Enhance recovery plan based on error history and attempt count
    const enhancedPlan: ErrorRecoveryPlan = {
      ...baseRecovery,
      retryWithSameStrategy: this.shouldRetryWithSameStrategy(error, attemptCount),
      fallbackStrategy: this.selectOptimalFallbackStrategy(error, attemptCount),
      userAction: this.generateUserActionMessage(error, attemptCount),
      technicalDetails: this.generateTechnicalDetails(error, attemptCount)
    };

    return enhancedPlan;
  }

  /**
   * Get error statistics for monitoring
   */
  static getErrorStatistics(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    recentErrors: PDFGenerationError[];
    commonPatterns: string[];
  } {
    const errorsByCategory: Record<ErrorCategory, number> = {
      browser: 0,
      content: 0,
      generation: 0,
      network: 0,
      validation: 0
    };

    this.errorHistory.forEach(error => {
      errorsByCategory[error.category]++;
    });

    const recentErrors = this.errorHistory.slice(-10);
    const commonPatterns = this.identifyCommonPatterns();

    return {
      totalErrors: this.errorHistory.length,
      errorsByCategory,
      recentErrors,
      commonPatterns
    };
  }

  /**
   * Check if system is experiencing recurring issues
   */
  static isSystemUnstable(): boolean {
    const recentErrors = this.errorHistory.slice(-5);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentCriticalErrors = recentErrors.filter(error => 
      error.timestamp > fiveMinutesAgo && !error.recoverable
    );

    return recentCriticalErrors.length >= 3;
  }

  /**
   * Get recommended action based on system state
   */
  static getSystemRecommendation(): string {
    if (this.isSystemUnstable()) {
      return 'System appears unstable. Consider refreshing the page or trying again later.';
    }

    const stats = this.getErrorStatistics();
    const mostCommonCategory = Object.entries(stats.errorsByCategory)
      .sort(([,a], [,b]) => b - a)[0];

    if (mostCommonCategory && mostCommonCategory[1] > 0) {
      switch (mostCommonCategory[0] as ErrorCategory) {
        case 'browser':
          return 'Browser compatibility issues detected. Try updating your browser or using Chrome/Firefox.';
        case 'network':
          return 'Network issues detected. Check your internet connection.';
        case 'content':
          return 'Content processing issues detected. Try simplifying your CV layout.';
        case 'generation':
          return 'PDF generation issues detected. Try closing other browser tabs to free up memory.';
        default:
          return 'Multiple issues detected. Try refreshing the page.';
      }
    }

    return 'System is operating normally.';
  }

  /**
   * Clear error history (for privacy/memory management)
   */
  static clearErrorHistory(): void {
    this.errorHistory = [];
  }

  // Private methods

  /**
   * Add error to history with size management
   */
  private static addToHistory(error: PDFGenerationError): void {
    this.errorHistory.push(error);
    
    // Keep only recent errors to prevent memory issues
    if (this.errorHistory.length > this.MAX_HISTORY) {
      this.errorHistory = this.errorHistory.slice(-this.MAX_HISTORY);
    }
  }

  /**
   * Determine if we should retry with the same strategy
   */
  private static shouldRetryWithSameStrategy(error: PDFGenerationError, attemptCount: number): boolean {
    // Don't retry with same strategy more than 2 times
    if (attemptCount > 2) return false;
    
    // Retry network errors and some generation errors
    return error.category === 'network' || 
           (error.category === 'generation' && attemptCount === 1);
  }

  /**
   * Select optimal fallback strategy based on error and history
   */
  private static selectOptimalFallbackStrategy(error: PDFGenerationError, attemptCount: number): GenerationStrategy | undefined {
    // If we've tried multiple times, skip to legacy
    if (attemptCount > 2) {
      return 'legacy';
    }

    // Use the error's suggested fallback strategy
    return error.fallbackStrategy;
  }

  /**
   * Generate user-friendly action message
   */
  private static generateUserActionMessage(error: PDFGenerationError, attemptCount: number): string {
    const baseMessage = error.getUserMessage();
    
    if (attemptCount > 1) {
      return `${baseMessage} (Attempt ${attemptCount})`;
    }
    
    return baseMessage;
  }

  /**
   * Generate enhanced technical details
   */
  private static generateTechnicalDetails(error: PDFGenerationError, attemptCount: number): string {
    const baseDetails = error.getTechnicalDetails();
    const systemState = this.isSystemUnstable() ? ' | System unstable' : '';
    
    return `${baseDetails} | Attempt: ${attemptCount}${systemState}`;
  }

  /**
   * Identify common error patterns
   */
  private static identifyCommonPatterns(): string[] {
    const patterns: string[] = [];
    const recentErrors = this.errorHistory.slice(-20);
    
    // Check for repeated error categories
    const categoryCount: Record<string, number> = {};
    recentErrors.forEach(error => {
      categoryCount[error.category] = (categoryCount[error.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count >= 3) {
        patterns.push(`Frequent ${category} errors`);
      }
    });
    
    // Check for timeout patterns
    const timeoutErrors = recentErrors.filter(error => 
      error.message.toLowerCase().includes('timeout')
    );
    if (timeoutErrors.length >= 2) {
      patterns.push('Timeout issues detected');
    }
    
    // Check for memory-related patterns
    const memoryErrors = recentErrors.filter(error =>
      error.message.toLowerCase().includes('memory') ||
      error.message.toLowerCase().includes('canvas')
    );
    if (memoryErrors.length >= 2) {
      patterns.push('Memory/Canvas issues detected');
    }
    
    return patterns;
  }
}

/**
 * Recovery strategy manager
 */
export class RecoveryManager {
  private static recoveryAttempts: Map<string, number> = new Map();
  private static readonly MAX_RECOVERY_ATTEMPTS = 3;

  /**
   * Execute recovery strategy with tracking
   */
  static async executeRecovery<T>(
    recoveryKey: string,
    recoveryFunction: () => Promise<T>,
    fallbackFunction?: () => Promise<T>
  ): Promise<T> {
    const attempts = this.recoveryAttempts.get(recoveryKey) || 0;
    
    if (attempts >= this.MAX_RECOVERY_ATTEMPTS) {
      if (fallbackFunction) {
        return await fallbackFunction();
      }
      throw new PDFGenerationError(
        'Maximum recovery attempts exceeded',
        'generation',
        false
      );
    }

    try {
      this.recoveryAttempts.set(recoveryKey, attempts + 1);
      const result = await recoveryFunction();
      
      // Reset attempts on success
      this.recoveryAttempts.delete(recoveryKey);
      return result;
      
    } catch (error) {
      // If we have a fallback and this is the last attempt, try it
      if (fallbackFunction && attempts + 1 >= this.MAX_RECOVERY_ATTEMPTS) {
        return await fallbackFunction();
      }
      
      throw error;
    }
  }

  /**
   * Reset recovery attempts for a specific key
   */
  static resetRecoveryAttempts(recoveryKey: string): void {
    this.recoveryAttempts.delete(recoveryKey);
  }

  /**
   * Clear all recovery tracking
   */
  static clearAllRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
  }

  /**
   * Get current recovery status
   */
  static getRecoveryStatus(): { activeRecoveries: number; totalAttempts: number } {
    const totalAttempts = Array.from(this.recoveryAttempts.values())
      .reduce((sum, attempts) => sum + attempts, 0);
    
    return {
      activeRecoveries: this.recoveryAttempts.size,
      totalAttempts
    };
  }
}