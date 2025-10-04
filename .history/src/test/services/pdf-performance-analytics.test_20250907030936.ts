// Tests for PDF Performance Analytics

import { describe, it, expect, beforeEach } from 'vitest';
import { PDFPerformanceAnalytics } from '../../../services/pdf-performance-analytics';
import { GenerationEvent } from '../../../services/pdf-performance-monitor';

describe('PDFPerformanceAnalytics', () => {
  let analytics: PDFPerformanceAnalytics;
  let mockEvents: GenerationEvent[];

  beforeEach(() => {
    analytics = new PDFPerformanceAnalytics();
    
    // Create mock events
    mockEvents = [
      {
        id: 'event1',
        timestamp: Date.now() - 60000, // 1 minute ago
        strategy: 'modern',
        duration: 2500,
        success: true,
        fileSize: 1024 * 1024, // 1MB
        elementComplexity: {
          totalElements: 50,
          imageCount: 2,
          textNodes: 30,
          estimatedSize: 500000,
          hasComplexCSS: false
        },
        browserInfo: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          platform: 'MacIntel',
          memoryLimit: 4 * 1024 * 1024 * 1024, // 4GB
          canvasSupport: true,
          webglSupport: true
        },
        performanceMetrics: {
          canvasRenderTime: 1000,
          pdfCreationTime: 1500,
          fontLoadingTime: 200,
          imageProcessingTime: 300,
          memoryUsage: 50 * 1024 * 1024, // 50MB
          peakMemoryUsage: 60 * 1024 * 1024, // 60MB
          gcCount: 1
        }
      },
      {
        id: 'event2',
        timestamp: Date.now() - 30000, // 30 seconds ago
        strategy: 'modern',
        duration: 3000,
        success: false,
        fileSize: 0,
        errorType: 'memory',
        elementComplexity: {
          totalElements: 100,
          imageCount: 5,
          textNodes: 60,
          estimatedSize: 1000000,
          hasComplexCSS: true
        },
        browserInfo: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          platform: 'Win32',
          memoryLimit: 2 * 1024 * 1024 * 1024, // 2GB
          canvasSupport: true,
          webglSupport: false
        },
        performanceMetrics: {
          canvasRenderTime: 1500,
          pdfCreationTime: 0,
          fontLoadingTime: 300,
          imageProcessingTime: 500,
          memoryUsage: 80 * 1024 * 1024, // 80MB
          peakMemoryUsage: 100 * 1024 * 1024, // 100MB
          gcCount: 2
        }
      }
    ];

    analytics.updateData(mockEvents, []);
  });

  describe('generateReport', () => {
    it('should generate comprehensive analytics report', () => {
      const report = analytics.generateReport();

      expect(report).toHaveProperty('timeRange');
      expect(report).toHaveProperty('totalGenerations');
      expect(report).toHaveProperty('performanceMetrics');
      expect(report).toHaveProperty('strategyAnalysis');
      expect(report).toHaveProperty('errorAnalysis');
      expect(report).toHaveProperty('userBehaviorInsights');
      expect(report).toHaveProperty('recommendations');

      expect(report.totalGenerations).toBe(2);
    });

    it('should calculate detailed performance metrics', () => {
      const report = analytics.generateReport();
      const metrics = report.performanceMetrics;

      expect(metrics.generationTime.mean).toBeGreaterThan(0);
      expect(metrics.generationTime.median).toBeGreaterThan(0);
      expect(metrics.successRate.overall).toBe(0.5); // 1 success out of 2
      expect(metrics.memoryUsage.mean).toBeGreaterThan(0);
    });

    it('should analyze strategies', () => {
      const report = analytics.generateReport();
      const strategyAnalysis = report.strategyAnalysis;

      expect(strategyAnalysis.usage.modern).toBe(2);
      expect(strategyAnalysis.performance.modern.successRate).toBe(0.5);
      expect(strategyAnalysis.reliability.modern).toBe(0.5);
    });

    it('should analyze errors', () => {
      const report = analytics.generateReport();
      const errorAnalysis = report.errorAnalysis;

      expect(errorAnalysis.totalErrors).toBe(1);
      expect(errorAnalysis.errorsByType.memory).toBe(1);
      expect(errorAnalysis.errorsByStrategy.modern).toBe(1);
    });
  });

  describe('getPerformanceTrends', () => {
    it('should calculate generation time trends', () => {
      const trends = analytics.getPerformanceTrends('generationTime', 'hour');

      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0]).toHaveProperty('timestamp');
      expect(trends[0]).toHaveProperty('value');
    });

    it('should calculate success rate trends', () => {
      const trends = analytics.getPerformanceTrends('successRate', 'day');

      expect(Array.isArray(trends)).toBe(true);
      trends.forEach(trend => {
        expect(trend.value).toBeGreaterThanOrEqual(0);
        expect(trend.value).toBeLessThanOrEqual(1);
      });
    });

    it('should calculate file size trends', () => {
      const trends = analytics.getPerformanceTrends('fileSize', 'hour');

      expect(Array.isArray(trends)).toBe(true);
      trends.forEach(trend => {
        expect(trend.value).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('analyzeByUserSegments', () => {
    it('should analyze performance by browser types', () => {
      const segments = analytics.analyzeByUserSegments();

      expect(segments).toHaveProperty('browserTypes');
      expect(segments).toHaveProperty('platforms');
      expect(segments).toHaveProperty('memoryLevels');

      expect(segments.browserTypes.Chrome).toBeDefined();
      expect(segments.platforms.MacIntel).toBeDefined();
      expect(segments.memoryLevels.High).toBeDefined();
    });

    it('should calculate metrics for each segment', () => {
      const segments = analytics.analyzeByUserSegments();
      const chromeMetrics = segments.browserTypes.Chrome;

      expect(chromeMetrics).toHaveProperty('averageTime');
      expect(chromeMetrics).toHaveProperty('successRate');
      expect(chromeMetrics).toHaveProperty('averageFileSize');
      expect(chromeMetrics).toHaveProperty('memoryEfficiency');
    });
  });

  describe('getPredictiveInsights', () => {
    it('should provide predictive insights', () => {
      const insights = analytics.getPredictiveInsights();

      expect(insights).toHaveProperty('expectedFailureRate');
      expect(insights).toHaveProperty('recommendedMaintenanceWindow');
      expect(insights).toHaveProperty('capacityRecommendations');
      expect(insights).toHaveProperty('riskFactors');

      expect(insights.expectedFailureRate).toBeGreaterThanOrEqual(0);
      expect(insights.expectedFailureRate).toBeLessThanOrEqual(1);
      expect(Array.isArray(insights.capacityRecommendations)).toBe(true);
      expect(Array.isArray(insights.riskFactors)).toBe(true);
    });

    it('should recommend maintenance window', () => {
      const insights = analytics.getPredictiveInsights();

      if (insights.recommendedMaintenanceWindow) {
        expect(insights.recommendedMaintenanceWindow.start).toBeLessThan(
          insights.recommendedMaintenanceWindow.end
        );
      }
    });
  });

  describe('exportAnalyticsData', () => {
    it('should export data as JSON', () => {
      const exported = analytics.exportAnalyticsData('json');
      const parsed = JSON.parse(exported);

      expect(parsed).toHaveProperty('timeRange');
      expect(parsed).toHaveProperty('totalGenerations');
      expect(parsed).toHaveProperty('performanceMetrics');
    });

    it('should export data as CSV', () => {
      const exported = analytics.exportAnalyticsData('csv');

      expect(typeof exported).toBe('string');
      expect(exported).toContain('Metric,Value');
      expect(exported).toContain('Total Generations');
    });
  });

  describe('edge cases', () => {
    it('should handle empty events gracefully', () => {
      analytics.updateData([], []);
      const report = analytics.generateReport();

      expect(report.totalGenerations).toBe(0);
      expect(report.performanceMetrics.generationTime.mean).toBe(0);
      expect(report.performanceMetrics.successRate.overall).toBe(0);
    });

    it('should handle single event', () => {
      analytics.updateData([mockEvents[0]], []);
      const report = analytics.generateReport();

      expect(report.totalGenerations).toBe(1);
      expect(report.performanceMetrics.successRate.overall).toBe(1);
    });

    it('should handle all failed events', () => {
      const failedEvents = mockEvents.map(event => ({ ...event, success: false }));
      analytics.updateData(failedEvents, []);
      const report = analytics.generateReport();

      expect(report.performanceMetrics.successRate.overall).toBe(0);
      expect(report.errorAnalysis.totalErrors).toBe(2);
    });
  });

  describe('recommendations', () => {
    it('should generate performance recommendations for slow generation', () => {
      const slowEvents = mockEvents.map(event => ({
        ...event,
        duration: 8000, // 8 seconds
        success: true
      }));
      
      analytics.updateData(slowEvents, []);
      const report = analytics.generateReport();

      const perfRecommendations = report.recommendations.filter(r => r.type === 'performance');
      expect(perfRecommendations.length).toBeGreaterThan(0);
      expect(perfRecommendations[0].title).toContain('Optimize Generation Speed');
    });

    it('should generate reliability recommendations for low success rate', () => {
      const failedEvents = mockEvents.map(event => ({ ...event, success: false }));
      analytics.updateData(failedEvents, []);
      const report = analytics.generateReport();

      const reliabilityRecommendations = report.recommendations.filter(r => r.type === 'reliability');
      expect(reliabilityRecommendations.length).toBeGreaterThan(0);
      expect(reliabilityRecommendations[0].title).toContain('Improve Success Rate');
    });
  });
});