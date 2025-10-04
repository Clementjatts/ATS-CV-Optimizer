// PDF Error Recovery Service
// Handles sophisticated error recovery and fallback strategies

import {
  GenerationStrategy,
  PDFConfiguration,
  PDFResult,
  ErrorRecoveryPlan,
  BrowserCapabilities
} from '../types/pdf';
import {
  PDFGenerationError,
  ErrorHandler,
  RecoveryManager
} from '../utils/errors';
import { STRATEGY_PRIORITY, TIMEOUTS } from '../constants/pdf-constants';

/**
 * Advanced error recovery service for PDF generation
 */
export class PDFErrorRecoveryService {
  private recoveryHistory: Map<string, RecoveryAttempt[]> = new Map();
  private readonly maxRecoveryAttempts = 3;

  /**
   * Attempt to recover from a PDF generation error
   */
  async attemptRecovery(
    error: PDFGenerationError,
    originalElement: HTMLElement,
    originalConfig: PDFConfiguration,
    generationFunction: (element: HTMLElement, config: PDFConfiguration) => Promise<PDFResult>
  ): Promise<PDFResult> {
    const recoveryKey = this.generateRecoveryKey(originalConfig);
    const attempts = this.getRecoveryAttempts(recoveryKey);
    
    if (attempts.length >= this.maxRecoveryAttempts) {
      throw new PDFGenerationError(
        'Maximum recovery attempts exceeded',
        'generation',
        false
      );
    }

    const recoveryPlan = ErrorHandler.createRecoveryPlan(error, attempts.length + 1);
    const recoveryAttempt: RecoveryAttempt = {
      timestamp: new Date(),
      originalError: error,
      recoveryPlan,
      strategy: recoveryPlan.fallbackStrategy || 'legacy'
    };

    this.addRecoveryAttempt(recoveryKey, recoveryAttempt);

    try {
      return await this.executeRecoveryPlan(
        recoveryPlan,
        originalElement,
        originalConfig,
        generationFunction
      );
    } catch (recoveryError) {
      recoveryAttempt.result = 'failed';
      recoveryAttempt.recoveryError = recoveryError instanceof PDFGenerationError 
        ? recoveryError 
        : ErrorHandler.fromError(recoveryError as Error);
      
      throw recoveryAttempt.recoveryError;
    }
  }

  /**
   * Get recovery suggestions based on error history
   */
  getRecoverySuggestions(error: PDFGenerationError): string[] {
    const suggestions = ErrorHandler.createRecoveryPlan(error).userAction ? 
      [ErrorHandler.createRecoveryPlan(error).userAction] : [];
    
    // Add context-specific suggestions based on error patterns
    const patterns = this.analyzeErrorPatterns();
    
    if (patterns.hasMemoryIssues) {
      suggestions.push('Close other browser tabs to free up memory');
      suggestions.push('Try reducing the CV content or complexity');
    }
    
    if (patterns.hasNetworkIssues) {
      suggestions.push('Check your internet connection');
      suggestions.push('Try again when you have a stable connection');
    }
    
    if (patterns.hasBrowserIssues) {
      suggestions.push('Update your browser to the latest version');
      suggestions.push('Try using Chrome or Firefox for better compatibility');
    }
    
    if (patterns.hasContentIssues) {
      suggestions.push('Simplify your CV layout and formatting');
      suggestions.push('Remove any special characters or complex elements');
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Check if recovery is recommended for this error
   */
  shouldAttemptRecovery(error: PDFGenerationError, config: PDFConfiguration): boolean {
    const recoveryKey = this.generateRecoveryKey(config);
    const attempts = this.getRecoveryAttempts(recoveryKey);
    
    // Don't attempt recovery if we've already tried too many times
    if (attempts.length >= this.maxRecoveryAttempts) {
      return false;
    }
    
    // Don't attempt recovery for non-recoverable errors
    if (!error.recoverable) {
      return false;
    }
    
    // Check if we have a viable fallback strategy
    return !!error.fallbackStrategy;
  }

  /**
   * Get recovery statistics for monitoring
   */
  getRecoveryStatistics(): RecoveryStatistics {
    const allAttempts = Array.from(this.recoveryHistory.values()).flat();
    const successful = allAttempts.filter(attempt => attempt.result === 'success');
    const failed = allAttempts.filter(attempt => attempt.result === 'failed');
    
    const strategySuccess: Record<GenerationStrategy, number> = {
      modern: 0,
      fallback: 0,
      legacy: 0
    };
    
    const strategyTotal: Record<GenerationStrategy, number> = {
      modern: 0,
      fallback: 0,
      legacy: 0
    };
    
    allAttempts.forEach(attempt => {
      strategyTotal[attempt.strategy]++;
      if (attempt.result === 'success') {
        strategySuccess[attempt.strategy]++;
      }
    });
    
    return {
      totalAttempts: allAttempts.length,
      successfulRecoveries: successful.length,
      failedRecoveries: failed.length,
      successRate: allAttempts.length > 0 ? successful.length / allAttempts.length : 0,
      strategyEffectiveness: Object.entries(strategyTotal).reduce((acc, [strategy, total]) => {
        acc[strategy as GenerationStrategy] = total > 0 ? strategySuccess[strategy as GenerationStrategy] / total : 0;
        return acc;
      }, {} as Record<GenerationStrategy, number>)
    };
  }

  /**
   * Clear recovery history (for privacy/memory management)
   */
  clearRecoveryHistory(): void {
    this.recoveryHistory.clear();
  }

  // Private methods

  /**
   * Execute a specific recovery plan
   */
  private async executeRecoveryPlan(
    plan: ErrorRecoveryPlan,
    element: HTMLElement,
    originalConfig: PDFConfiguration,
    generationFunction: (element: HTMLElement, config: PDFConfiguration) => Promise<PDFResult>
  ): Promise<PDFResult> {
    let config = { ...originalConfig };
    
    // Apply recovery modifications to configuration
    if (plan.fallbackStrategy) {
      config.strategy = plan.fallbackStrategy;
      config.timeout = TIMEOUTS[plan.fallbackStrategy];
    }
    
    // Apply strategy-specific optimizations
    config = this.optimizeConfigForRecovery(config, plan);
    
    // Prepare element for recovery attempt
    const optimizedElement = this.prepareElementForRecovery(element, plan);
    
    return await RecoveryManager.executeRecovery(
      this.generateRecoveryKey(config),
      () => generationFunction(optimizedElement, config)
    );
  }

  /**
   * Optimize configuration for recovery attempt
   */
  private optimizeConfigForRecovery(
    config: PDFConfiguration,
    plan: ErrorRecoveryPlan
  ): PDFConfiguration {
    const optimized = { ...config };
    
    // Reduce quality settings for better compatibility
    if (plan.fallbackStrategy === 'legacy') {
      optimized.resolution = Math.min(optimized.resolution, 200);
      optimized.imageQuality = Math.min(optimized.imageQuality, 0.8);
      optimized.compression.level = 'high';
    }
    
    // Increase timeout for fallback strategies
    if (plan.fallbackStrategy && plan.fallbackStrategy !== 'modern') {
      optimized.timeout = Math.max(optimized.timeout, TIMEOUTS[plan.fallbackStrategy]);
    }
    
    return optimized;
  }

  /**
   * Prepare element for recovery attempt
   */
  private prepareElementForRecovery(element: HTMLElement, plan: ErrorRecoveryPlan): HTMLElement {
    // For now, return the original element
    // In the future, we could apply optimizations like:
    // - Simplifying complex CSS
    // - Reducing image sizes
    // - Flattening nested structures
    return element;
  }

  /**
   * Generate a unique key for recovery tracking
   */
  private generateRecoveryKey(config: PDFConfiguration): string {
    return `${config.strategy}_${config.format}_${config.resolution}`;
  }

  /**
   * Get recovery attempts for a specific key
   */
  private getRecoveryAttempts(recoveryKey: string): RecoveryAttempt[] {
    return this.recoveryHistory.get(recoveryKey) || [];
  }

  /**
   * Add a recovery attempt to history
   */
  private addRecoveryAttempt(recoveryKey: string, attempt: RecoveryAttempt): void {
    const attempts = this.getRecoveryAttempts(recoveryKey);
    attempts.push(attempt);
    this.recoveryHistory.set(recoveryKey, attempts);
    
    // Clean up old attempts to prevent memory leaks
    this.cleanupOldAttempts();
  }

  /**
   * Clean up old recovery attempts
   */
  private cleanupOldAttempts(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [key, attempts] of this.recoveryHistory.entries()) {
      const recentAttempts = attempts.filter(attempt => attempt.timestamp > oneHourAgo);
      
      if (recentAttempts.length === 0) {
        this.recoveryHistory.delete(key);
      } else {
        this.recoveryHistory.set(key, recentAttempts);
      }
    }
  }

  /**
   * Analyze error patterns from recovery history
   */
  private analyzeErrorPatterns(): ErrorPatterns {
    const allAttempts = Array.from(this.recoveryHistory.values()).flat();
    const recentAttempts = allAttempts.filter(
      attempt => attempt.timestamp > new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
    );
    
    const memoryErrors = recentAttempts.filter(attempt =>
      attempt.originalError.message.toLowerCase().includes('memory') ||
      attempt.originalError.message.toLowerCase().includes('canvas')
    );
    
    const networkErrors = recentAttempts.filter(attempt =>
      attempt.originalError.category === 'network'
    );
    
    const browserErrors = recentAttempts.filter(attempt =>
      attempt.originalError.category === 'browser'
    );
    
    const contentErrors = recentAttempts.filter(attempt =>
      attempt.originalError.category === 'content'
    );
    
    return {
      hasMemoryIssues: memoryErrors.length >= 2,
      hasNetworkIssues: networkErrors.length >= 2,
      hasBrowserIssues: browserErrors.length >= 2,
      hasContentIssues: contentErrors.length >= 2
    };
  }
}

// Supporting interfaces

interface RecoveryAttempt {
  timestamp: Date;
  originalError: PDFGenerationError;
  recoveryPlan: ErrorRecoveryPlan;
  strategy: GenerationStrategy;
  result?: 'success' | 'failed';
  recoveryError?: PDFGenerationError;
}

interface RecoveryStatistics {
  totalAttempts: number;
  successfulRecoveries: number;
  failedRecoveries: number;
  successRate: number;
  strategyEffectiveness: Record<GenerationStrategy, number>;
}

interface ErrorPatterns {
  hasMemoryIssues: boolean;
  hasNetworkIssues: boolean;
  hasBrowserIssues: boolean;
  hasContentIssues: boolean;
}