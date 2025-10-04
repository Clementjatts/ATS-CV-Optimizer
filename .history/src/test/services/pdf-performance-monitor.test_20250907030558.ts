// Tests for PDF Performance Monitor

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFPerformanceMonitor } from '../../../services/pdf-performance-monitor';
import { PDFResult, PDFConfiguration } from '../../../types/pdf';

describe('PDFPerformanceMonitor', () => {
  let monitor: PDFPerformanceMonitor;
  let mockElement: HTMLElement;
  let mockConfig: PDFConfiguration;
  let mockResult: PDFResult;

  beforeEach(() => {
    monitor = new PDFPerformanceMonitor();
    
    // Create mock element
    mockElement = document.createElement('div');
    mockElement.innerHTML = `
      <h1>Test CV</h1>
      <p>Some content</p>
      <img src="test.jpg" alt="test" />
    `;

    // Create mock config
    mockConfig = {
      format: 'letter',
      orientation: 'portrait',
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      resolution: 300,
      compression: { text: true, images: true, level: 'medium' },
      imageQuality: 0.85,
      fonts: [],
      colors: { mode: 'rgb' },
      metadata: {
        title: 'Test CV',
        author: 'Test User',
        creator: 'Test',
        producer: 'Test'
      },
      strategy: 'modern',
      timeout: 30000,
      retryAttempts: 3
    };

    // Create mock result
    mockResult = {
      success: true,
      blob: new Blob(['test'], { type: 'application/pdf' }),
      metadata: {
        strategy: 'modern',
        duration: 2500,
        fileSize: 1024 * 1024, // 1MB
        pageCount: 1,
        warnings: []
      }
    };
  });

  describe('trackGeneration', () => {
    it('should track successful generation events', () => {
      const startTime = Date.now() - 2500;
      
      monitor.trackGeneration('modern', mockConfig, mockResult, mockElement, startTime);
      
      const trends = monitor.getPerformanceTrends();
      expect(trends.successRate).toBe(1);
      expect(trends.averageGenerationTime).toBe(2500);
    });

    it('should track failed generation events', () => {
      const failedResult: PDFResult = {
        ...mockResult,
        success: false,
        error: 'Generation failed',
        blob: undefined
      };
      
      const startTime = Date.now() - 3000;
      
      monitor.trackGeneration('modern', mockConfig, failedResult, mockElement, startTime);
      
      const trends = monitor.getPerformanceTrends();
      expect(trends.successRate).toBe(0);
      expect(trends.errorRate).toBe(1);
    });
  });

  describe('getPerformanceTrends', () => {
    it('should return empty trends when no events', () => {
      const trends = monitor.getPerformanceTrends();
      
      expect(trends.averageGenerationTime).toBe(0);
      expect(trends.successRate).toBe(0);
      expect(trends.errorRate).toBe(0);
    });

    it('should calculate trends from multiple events', () => {
      // Add multiple events
      for (let i = 0; i < 5; i++) {
        const result = {
          ...mockResult,
          metadata: {
            ...mockResult.metadata,
            duration: 2000 + i * 500
          }
        };
        
        monitor.trackGeneration('modern', mockConfig, result, mockElement, Date.now());
      }
      
      const trends = monitor.getPerformanceTrends();
      expect(trends.successRate).toBe(1);
      expect(trends.averageGenerationTime).toBeGreaterThan(2000);
    });
  });

  describe('getSuccessRateMetrics', () => {
    it('should calculate success rates by strategy', () => {
      // Add events for different strategies
      monitor.trackGeneration('modern', mockConfig, mockResult, mockElement, Date.now());
      monitor.trackGeneration('legacy', mockConfig, { ...mockResult, success: false }, mockElement, Date.now());
      
      const metrics = monitor.getSuccessRateMetrics();
      
      expect(metrics.byStrategy.modern).toBe(1);
      expect(metrics.byStrategy.legacy).toBe(0);
    });

    it('should track recent failures', () => {
      const failedResult: PDFResult = {
        ...mockResult,
        success: false,
        error: 'Test error'
      };
      
      monitor.trackGeneration('modern', mockConfig, failedResult, mockElement, Date.now());
      
      const metrics = monitor.getSuccessRateMetrics();
      expect(metrics.recentFailures.length).toBe(1);
      expect(metrics.recentFailures[0].success).toBe(false);
    });
  });

  describe('getFileSizeMetrics', () => {
    it('should calculate file size statistics', () => {
      // Add events with different file sizes
      const sizes = [500 * 1024, 1.5 * 1024 * 1024, 4 * 1024 * 1024]; // 500KB, 1.5MB, 4MB
      
      sizes.forEach(size => {
        const result = {
          ...mockResult,
          metadata: { ...mockResult.metadata, fileSize: size }
        };
        monitor.trackGeneration('modern', mockConfig, result, mockElement, Date.now());
      });
      
      const metrics = monitor.getFileSizeMetrics();
      
      expect(metrics.averageSize).toBeGreaterThan(0);
      expect(metrics.sizeDistribution.small).toBeGreaterThan(0);
      expect(metrics.sizeDistribution.medium).toBeGreaterThan(0);
      expect(metrics.sizeDistribution.large).toBeGreaterThan(0);
    });

    it('should identify oversized files', () => {
      const largeResult = {
        ...mockResult,
        metadata: { ...mockResult.metadata, fileSize: 10 * 1024 * 1024 } // 10MB
      };
      
      monitor.trackGeneration('modern', mockConfig, largeResult, mockElement, Date.now());
      
      const metrics = monitor.getFileSizeMetrics();
      expect(metrics.oversizedFiles.length).toBe(1);
    });
  });

  describe('createPerformanceDashboard', () => {
    it('should create comprehensive dashboard data', () => {
      monitor.trackGeneration('modern', mockConfig, mockResult, mockElement, Date.now());
      
      const dashboard = monitor.createPerformanceDashboard();
      
      expect(dashboard).toHaveProperty('summary');
      expect(dashboard).toHaveProperty('successMetrics');
      expect(dashboard).toHaveProperty('fileSizeMetrics');
      expect(dashboard).toHaveProperty('alerts');
      expect(dashboard).toHaveProperty('recommendations');
      expect(dashboard).toHaveProperty('healthScore');
      
      expect(dashboard.healthScore).toBeGreaterThan(0);
      expect(dashboard.healthScore).toBeLessThanOrEqual(1);
    });
  });

  describe('alert system', () => {
    it('should generate alerts for slow generation', () => {
      const slowResult = {
        ...mockResult,
        metadata: { ...mockResult.metadata, duration: 15000 } // 15 seconds
      };
      
      monitor.trackGeneration('modern', mockConfig, slowResult, mockElement, Date.now());
      
      const alerts = monitor.getRecentAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].type).toBe('warning');
    });

    it('should generate alerts for large files', () => {
      const largeResult = {
        ...mockResult,
        metadata: { ...mockResult.metadata, fileSize: 8 * 1024 * 1024 } // 8MB
      };
      
      monitor.trackGeneration('modern', mockConfig, largeResult, mockElement, Date.now());
      
      const alerts = monitor.getRecentAlerts();
      expect(alerts.some(alert => alert.message.includes('Large PDF file'))).toBe(true);
    });
  });

  describe('configuration', () => {
    it('should allow configuring alert thresholds', () => {
      monitor.setAlertThresholds({
        maxGenerationTime: 5000,
        maxFileSize: 2 * 1024 * 1024
      });
      
      const slowResult = {
        ...mockResult,
        metadata: { ...mockResult.metadata, duration: 6000 }
      };
      
      monitor.trackGeneration('modern', mockConfig, slowResult, mockElement, Date.now());
      
      const alerts = monitor.getRecentAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should allow enabling/disabling monitoring', () => {
      monitor.setMonitoringEnabled(false);
      monitor.trackGeneration('modern', mockConfig, mockResult, mockElement, Date.now());
      
      const trends = monitor.getPerformanceTrends();
      expect(trends.averageGenerationTime).toBe(0);
      
      monitor.setMonitoringEnabled(true);
      monitor.trackGeneration('modern', mockConfig, mockResult, mockElement, Date.now());
      
      const newTrends = monitor.getPerformanceTrends();
      expect(newTrends.averageGenerationTime).toBeGreaterThan(0);
    });
  });

  describe('data management', () => {
    it('should clear history', () => {
      monitor.trackGeneration('modern', mockConfig, mockResult, mockElement, Date.now());
      
      let trends = monitor.getPerformanceTrends();
      expect(trends.averageGenerationTime).toBeGreaterThan(0);
      
      monitor.clearHistory();
      
      trends = monitor.getPerformanceTrends();
      expect(trends.averageGenerationTime).toBe(0);
    });

    it('should export data', () => {
      monitor.trackGeneration('modern', mockConfig, mockResult, mockElement, Date.now());
      
      const exported = monitor.exportData();
      
      expect(exported).toHaveProperty('events');
      expect(exported).toHaveProperty('alerts');
      expect(exported).toHaveProperty('summary');
      expect(exported).toHaveProperty('exportTime');
      expect(exported.events.length).toBe(1);
    });
  });
});