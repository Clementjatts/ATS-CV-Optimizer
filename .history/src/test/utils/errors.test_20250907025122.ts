import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PDFGenerationError,
  BrowserCompatibilityError,
  ContentProcessingError,
  GenerationTimeoutError,
  NetworkError,
  ValidationError,
  ErrorHandler
} from '../../../utils/errors';

describe('PDF Error Classes', () => {
  describe('PDFGenerationError', () => {
    it('should create error with correct properties', () => {
      const error = new PDFGenerationError(
        'Test error',
        'generation',
        true,
        'fallback',
        { test: 'context' }
      );

      expect(error.message).toBe('Test error');
      expect(error.category).toBe('generation');
      expect(error.recoverable).toBe(true);
      expect(error.fallbackStrategy).toBe('fallback');
      expect(error.context).toEqual({ test: 'context' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should provide user-friendly messages for different categories', () => {
      const browserError = new PDFGenerationError('Test', 'browser');
      const contentError = new PDFGenerationError('Test', 'content');
      const generationError = new PDFGenerationError('Test', 'generation');
      const networkError = new PDFGenerationError('Test', 'network');
      const validationError = new PDFGenerationError('Test', 'validation');

      expect(browserError.getUserMessage()).toContain('browser');
      expect(contentError.getUserMessage()).toContain('content');
      expect(generationError.getUserMessage()).toContain('generation');
      expect(networkError.getUserMessage()).toContain('connection');
      expect(validationError.getUserMessage()).toContain('quality');
    });

    it('should provide technical details', () => {
      const error = new PDFGenerationError(
        'Test error',
        'generation',
        true,
        undefined,
        { detail: 'value' }
      );

      const details = error.getTechnicalDetails();
      expect(details).toContain('GENERATION');
      expect(details).toContain('Test error');
      expect(details).toContain('Context');
    });

    it('should create recovery plan', () => {
      const error = new PDFGenerationError('Test', 'network', true, 'legacy');
      const plan = error.getRecoveryPlan();

      expect(plan).toHaveProperty('retryWithSameStrategy');
      expect(plan).toHaveProperty('fallbackStrategy');
      expect(plan).toHaveProperty('userAction');
      expect(plan).toHaveProperty('technicalDetails');
    });
  });

  describe('Specialized Error Classes', () => {
    it('should create BrowserCompatibilityError correctly', () => {
      const error = new BrowserCompatibilityError('WebGL', 'fallback');
      
      expect(error.category).toBe('browser');
      expect(error.message).toContain('WebGL');
      expect(error.fallbackStrategy).toBe('fallback');
    });

    it('should create ContentProcessingError correctly', () => {
      const error = new ContentProcessingError('Invalid HTML', 'div');
      
      expect(error.category).toBe('content');
      expect(error.message).toContain('Invalid HTML');
      expect(error.context?.element).toBe('div');
    });

    it('should create GenerationTimeoutError correctly', () => {
      const error = new GenerationTimeoutError(30000, 'modern');
      
      expect(error.category).toBe('generation');
      expect(error.message).toContain('30000ms');
      expect(error.context?.strategy).toBe('modern');
    });

    it('should create NetworkError correctly', () => {
      const error = new NetworkError(500, 'Server Error');
      
      expect(error.category).toBe('network');
      expect(error.message).toContain('500');
      expect(error.context?.statusCode).toBe(500);
    });

    it('should create ValidationError correctly', () => {
      const issues = ['Size too large', 'Invalid format'];
      const error = new ValidationError(issues);
      
      expect(error.category).toBe('validation');
      expect(error.message).toContain('Size too large');
      expect(error.context?.validationIssues).toEqual(issues);
    });
  });
});

describe('ErrorHandler', () => {
  beforeEach(() => {
    ErrorHandler.clearErrorHistory();
  });

  describe('Error Categorization', () => {
    it('should categorize canvas errors as browser', () => {
      const error = new Error('Canvas not supported');
      const category = ErrorHandler.categorizeError(error);
      expect(category).toBe('browser');
    });

    it('should categorize network errors correctly', () => {
      const error = new Error('Network connection failed');
      const category = ErrorHandler.categorizeError(error);
      expect(category).toBe('network');
    });

    it('should categorize timeout errors correctly', () => {
      const error = new Error('Operation timed out');
      const category = ErrorHandler.categorizeError(error);
      expect(category).toBe('generation');
    });

    it('should categorize content errors correctly', () => {
      const error = new Error('Invalid content format');
      const category = ErrorHandler.categorizeError(error);
      expect(category).toBe('content');
    });

    it('should default to generation category', () => {
      const error = new Error('Unknown error');
      const category = ErrorHandler.categorizeError(error);
      expect(category).toBe('generation');
    });
  });

  describe('Error Conversion', () => {
    it('should convert generic error to PDFGenerationError', () => {
      const genericError = new Error('Test error');
      const pdfError = ErrorHandler.fromError(genericError, 'legacy');

      expect(pdfError).toBeInstanceOf(PDFGenerationError);
      expect(pdfError.message).toBe('Test error');
      expect(pdfError.fallbackStrategy).toBe('legacy');
    });

    it('should return PDFGenerationError as-is', () => {
      const pdfError = new PDFGenerationError('Test', 'generation');
      const result = ErrorHandler.fromError(pdfError);

      expect(result).toBe(pdfError);
    });
  });

  describe('Error Logging', () => {
    it('should log recoverable errors as warnings', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const error = new PDFGenerationError('Test', 'generation', true);

      ErrorHandler.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log non-recoverable errors as errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new PDFGenerationError('Test', 'generation', false);

      ErrorHandler.logError(error);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Fallback Decision', () => {
    it('should recommend fallback for recoverable errors with strategy', () => {
      const error = new PDFGenerationError('Test', 'generation', true, 'legacy');
      const shouldFallback = ErrorHandler.shouldFallback(error);
      expect(shouldFallback).toBe(true);
    });

    it('should not recommend fallback for non-recoverable errors', () => {
      const error = new PDFGenerationError('Test', 'generation', false);
      const shouldFallback = ErrorHandler.shouldFallback(error);
      expect(shouldFallback).toBe(false);
    });

    it('should not recommend fallback without strategy', () => {
      const error = new PDFGenerationError('Test', 'generation', true);
      const shouldFallback = ErrorHandler.shouldFallback(error);
      expect(shouldFallback).toBe(false);
    });
  });

  describe('Recovery Plan Creation', () => {
    it('should create comprehensive recovery plan', () => {
      const error = new PDFGenerationError('Test', 'network', true, 'legacy');
      const plan = ErrorHandler.createRecoveryPlan(error, 1);

      expect(plan).toHaveProperty('retryWithSameStrategy');
      expect(plan).toHaveProperty('fallbackStrategy');
      expect(plan).toHaveProperty('userAction');
      expect(plan).toHaveProperty('technicalDetails');
    });

    it('should adjust retry strategy based on attempt count', () => {
      const error = new PDFGenerationError('Test', 'network', true, 'legacy');
      
      const plan1 = ErrorHandler.createRecoveryPlan(error, 1);
      const plan3 = ErrorHandler.createRecoveryPlan(error, 3);

      expect(plan1.retryWithSameStrategy).toBe(true);
      expect(plan3.retryWithSameStrategy).toBe(false);
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics', () => {
      const error1 = new PDFGenerationError('Test 1', 'browser');
      const error2 = new PDFGenerationError('Test 2', 'network');

      ErrorHandler.logError(error1);
      ErrorHandler.logError(error2);

      const stats = ErrorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(2);
      expect(stats.errorsByCategory.browser).toBe(1);
      expect(stats.errorsByCategory.network).toBe(1);
    });

    it('should identify common patterns', () => {
      // Add multiple similar errors
      for (let i = 0; i < 3; i++) {
        const error = new PDFGenerationError('Timeout error', 'generation');
        ErrorHandler.logError(error);
      }

      const stats = ErrorHandler.getErrorStatistics();
      expect(stats.commonPatterns).toContain('Frequent generation errors');
    });
  });

  describe('System Stability', () => {
    it('should detect unstable system', () => {
      // Add multiple critical errors quickly
      for (let i = 0; i < 4; i++) {
        const error = new PDFGenerationError('Critical error', 'generation', false);
        ErrorHandler.logError(error);
      }

      const isUnstable = ErrorHandler.isSystemUnstable();
      expect(isUnstable).toBe(true);
    });

    it('should provide system recommendations', () => {
      const error = new PDFGenerationError('Browser error', 'browser');
      ErrorHandler.logError(error);

      const recommendation = ErrorHandler.getSystemRecommendation();
      expect(typeof recommendation).toBe('string');
      expect(recommendation.length).toBeGreaterThan(0);
    });
  });

  describe('History Management', () => {
    it('should clear error history', () => {
      const error = new PDFGenerationError('Test', 'generation');
      ErrorHandler.logError(error);

      let stats = ErrorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(1);

      ErrorHandler.clearErrorHistory();
      stats = ErrorHandler.getErrorStatistics();
      expect(stats.totalErrors).toBe(0);
    });
  });
});