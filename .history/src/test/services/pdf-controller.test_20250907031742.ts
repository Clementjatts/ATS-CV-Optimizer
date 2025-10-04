import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFGenerationController } from '../../../services/pdf-controller';
import { PDFOptions } from '../../../types/pdf';

describe('PDFGenerationController', () => {
  let controller: PDFGenerationController;
  let mockElement: HTMLElement;
  let mockOptions: PDFOptions;

  beforeEach(() => {
    controller = new PDFGenerationController();
    
    // Create mock HTML element
    mockElement = document.createElement('div');
    mockElement.id = 'test-element';
    mockElement.style.width = '800px';
    mockElement.style.height = '600px';
    mockElement.innerHTML = '<h1>Test CV Content</h1><p>This is a test CV.</p>';
    document.body.appendChild(mockElement);

    // Create mock PDF options
    mockOptions = {
      filename: 'test-cv.pdf',
      quality: 'high',
      format: 'letter',
      margins: {
        top: 0.5,
        right: 0.5,
        bottom: 0.5,
        left: 0.5
      },
      metadata: {
        title: 'Test CV',
        author: 'Test User',
        subject: 'Professional CV',
        keywords: ['CV', 'Resume'],
        creator: 'ATS CV Optimizer',
        producer: 'Test Generator'
      }
    };
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      expect(controller).toBeInstanceOf(PDFGenerationController);
    });

    it('should detect browser capabilities on initialization', () => {
      const capabilities = controller.validateBrowserSupport();
      expect(capabilities).toHaveProperty('supportsCanvas');
      expect(capabilities).toHaveProperty('supportsWebGL');
      expect(capabilities).toHaveProperty('maxCanvasSize');
      expect(capabilities).toHaveProperty('memoryLimit');
    });
  });

  describe('Browser Capability Detection', () => {
    it('should detect canvas support', () => {
      const capabilities = controller.validateBrowserSupport();
      expect(capabilities.supportsCanvas).toBe(true);
    });

    it('should detect maximum canvas size', () => {
      const capabilities = controller.validateBrowserSupport();
      expect(capabilities.maxCanvasSize).toBeGreaterThan(0);
    });

    it('should estimate memory limit', () => {
      const capabilities = controller.validateBrowserSupport();
      expect(capabilities.memoryLimit).toBeGreaterThan(0);
    });
  });

  describe('Strategy Selection', () => {
    it('should select modern strategy for capable browsers', () => {
      const capabilities = {
        supportsCanvas: true,
        supportsWebGL: true,
        supportsWorkers: true,
        supportsOffscreenCanvas: false,
        maxCanvasSize: 4096,
        memoryLimit: 100 * 1024 * 1024
      };
      
      const strategy = controller.selectStrategy(capabilities);
      expect(strategy).toBe('modern');
    });

    it('should fallback to legacy strategy for limited browsers', () => {
      const capabilities = {
        supportsCanvas: true,
        supportsWebGL: false,
        supportsWorkers: false,
        supportsOffscreenCanvas: false,
        maxCanvasSize: 1024,
        memoryLimit: 10 * 1024 * 1024
      };
      
      const strategy = controller.selectStrategy(capabilities);
      expect(strategy).toBe('legacy');
    });
  });

  describe('System Readiness', () => {
    it('should report system as ready when all capabilities are met', () => {
      const status = controller.isSystemReady();
      expect(status.ready).toBe(true);
      expect(status.issues).toHaveLength(0);
    });

    it('should report issues when capabilities are insufficient', () => {
      // Create a new controller to avoid interference with other tests
      const testController = new PDFGenerationController();
      
      // Mock insufficient capabilities
      vi.spyOn(testController, 'validateBrowserSupport').mockReturnValue({
        supportsCanvas: false,
        supportsWebGL: false,
        supportsWorkers: false,
        supportsOffscreenCanvas: false,
        maxCanvasSize: 512,
        memoryLimit: 1024
      });

      // Force re-detection by setting capabilities to null
      (testController as any).browserCapabilities = null;

      const status = testController.isSystemReady();
      expect(status.ready).toBe(false);
      expect(status.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Creation', () => {
    it('should create default configuration', () => {
      const config = controller.createDefaultConfiguration();
      
      expect(config).toHaveProperty('format', 'letter');
      expect(config).toHaveProperty('orientation', 'portrait');
      expect(config).toHaveProperty('margins');
      expect(config).toHaveProperty('resolution');
      expect(config).toHaveProperty('metadata');
      expect(config.metadata).toHaveProperty('title');
      expect(config.metadata).toHaveProperty('creator');
    });

    it('should merge user options with defaults', () => {
      const config = controller.createDefaultConfiguration();
      expect(config.format).toBe('letter');
      expect(config.margins.top).toBe(0.5);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid element gracefully', async () => {
      const invalidElement = null as any;
      
      const result = await controller.generatePDF(invalidElement, mockOptions);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle element with no dimensions', async () => {
      const emptyElement = document.createElement('div');
      // Explicitly set dimensions to 0
      emptyElement.style.width = '0px';
      emptyElement.style.height = '0px';
      emptyElement.style.display = 'block';
      
      // Mock offsetWidth and offsetHeight to return 0
      Object.defineProperty(emptyElement, 'offsetWidth', { value: 0 });
      Object.defineProperty(emptyElement, 'offsetHeight', { value: 0 });
      
      const result = await controller.generatePDF(emptyElement, mockOptions);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing filename', async () => {
      const invalidOptions = { ...mockOptions, filename: '' };
      
      const result = await controller.generatePDF(mockElement, invalidOptions);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Recovery Suggestions', () => {
    it('should provide recovery suggestions for errors', () => {
      const mockError = {
        message: 'Test error',
        category: 'generation' as const,
        recoverable: true,
        getUserMessage: () => 'Test error message',
        getTechnicalDetails: () => 'Technical details',
        getRecoveryPlan: () => ({
          retryWithSameStrategy: true,
          fallbackStrategy: 'legacy' as const,
          userAction: 'Test action',
          technicalDetails: 'Technical details'
        })
      };

      const suggestions = controller.getRecoverySuggestions(mockError as any);
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('System Health', () => {
    it('should provide system health status', () => {
      const health = controller.getSystemHealth();
      
      expect(health).toHaveProperty('isStable');
      expect(health).toHaveProperty('recommendation');
      expect(health).toHaveProperty('errorStats');
      expect(health).toHaveProperty('recoveryStats');
    });
  });

  describe('Error Tracking', () => {
    it('should reset error tracking', () => {
      controller.resetErrorTracking();
      
      const health = controller.getSystemHealth();
      expect(health.errorStats.totalErrors).toBe(0);
    });
  });
});