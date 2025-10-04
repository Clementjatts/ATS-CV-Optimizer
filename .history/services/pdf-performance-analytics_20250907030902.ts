// PDF Performance Analytics - Advanced analytics and reporting

import {
  GenerationEvent,
  PerformanceTrends,
  PerformanceAlert
} from './pdf-performance-monitor';
import { GenerationStrategy } from '../types/pdf';

export interface AnalyticsReport {
  timeRange: { start: number; end: number };
  totalGenerations: number;
  performanceMetrics: DetailedPerformanceMetrics;
  strategyAnalysis: StrategyAnalysis;
  errorAnalysis: ErrorAnalysis;
  userBehaviorInsights: UserBehaviorInsights;
  recommendations: AnalyticsRecommendation[];
}

export interface DetailedPerformanceMetrics {
  generationTime: {
    mean: number;
    median: number;
    p95: number;
    p99: number;
    trend: 'improving' | 'stable' | 'degrading';
  };
  fileSize: {
    mean: number;
    median: number;
    distribution: { [key: string]: number };
  };
  memoryUsage: {
    mean: number;
    peak: number;
    efficiency: number;
  };
  successRate: {
    overall: number;
    byHour: number[];
    byDayOfWeek: number[];
  };
}

export interface StrategyAnalysis {
  usage: { [strategy in GenerationStrategy]: number };
  performance: { [strategy in GenerationStrategy]: PerformanceMetrics };
  reliability: { [strategy in GenerationStrategy]: number };
  recommendations: { [strategy in GenerationStrategy]: string[] };
}

export interface PerformanceMetrics {
  averageTime: number;
  successRate: number;
  averageFileSize: number;
  memoryEfficiency: number;
}

export interface ErrorAnalysis {
  totalErrors: number;
  errorsByType: { [type: string]: number };
  errorsByStrategy: { [strategy in GenerationStrategy]: number };
  errorTrends: { timestamp: number; count: number }[];
  commonCauses: string[];
  resolutionSuggestions: string[];
}

export interface UserBehaviorInsights {
  peakUsageHours: number[];
  averageSessionDuration: number;
  retryPatterns: {
    averageRetries: number;
    successAfterRetry: number;
  };
  qualityPreferences: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface AnalyticsRecommendation {
  type: 'performance' | 'reliability' | 'user-experience' | 'infrastructure';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  actions: string[];
}

/**
 * Advanced analytics service for PDF generation performance
 * Provides detailed insights, trends, and recommendations
 */
export class PDFPerformanceAnalytics {
  private events: GenerationEvent[] = [];
  private alerts: PerformanceAlert[] = [];

  constructor() {
    // Initialize analytics
  }

  /**
   * Update analytics data with new events and alerts
   */
  updateData(events: GenerationEvent[], alerts: PerformanceAlert[]): void {
    this.events = events;
    this.alerts = alerts;
  }

  /**
   * Generate comprehensive analytics report
   */
  generateReport(timeRange?: { start: number; end: number }): AnalyticsReport {
    const filteredEvents = this.filterEventsByTimeRange(timeRange);
    
    return {
      timeRange: timeRange || this.getDefaultTimeRange(),
      totalGenerations: filteredEvents.length,
      performanceMetrics: this.calculateDetailedMetrics(filteredEvents),
      strategyAnalysis: this.analyzeStrategies(filteredEvents),
      errorAnalysis: this.analyzeErrors(filteredEvents),
      userBehaviorInsights: this.analyzeUserBehavior(filteredEvents),
      recommendations: this.generateRecommendations(filteredEvents)
    };
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(
    metric: 'generationTime' | 'successRate' | 'fileSize' | 'memoryUsage',
    granularity: 'hour' | 'day' | 'week' = 'day'
  ): { timestamp: number; value: number }[] {
    const buckets = this.createTimeBuckets(granularity);
    
    return buckets.map(bucket => {
      const bucketEvents = this.events.filter(e => 
        e.timestamp >= bucket.start && e.timestamp < bucket.end
      );
      
      let value = 0;
      if (bucketEvents.length > 0) {
        switch (metric) {
          case 'generationTime':
            value = bucketEvents.reduce((sum, e) => sum + e.duration, 0) / bucketEvents.length;
            break;
          case 'successRate':
            value = bucketEvents.filter(e => e.success).length / bucketEvents.length;
            break;
          case 'fileSize':
            const successfulEvents = bucketEvents.filter(e => e.success);
            value = successfulEvents.length > 0 
              ? successfulEvents.reduce((sum, e) => sum + e.fileSize, 0) / successfulEvents.length
              : 0;
            break;
          case 'memoryUsage':
            value = bucketEvents.reduce((sum, e) => sum + e.performanceMetrics.memoryUsage, 0) / bucketEvents.length;
            break;
        }
      }
      
      return { timestamp: bucket.start, value };
    });
  }

  /**
   * Analyze performance by user segments
   */
  analyzeByUserSegments(): {
    browserTypes: { [browser: string]: PerformanceMetrics };
    platforms: { [platform: string]: PerformanceMetrics };
    memoryLevels: { [level: string]: PerformanceMetrics };
  } {
    const browserTypes: { [browser: string]: GenerationEvent[] } = {};
    const platforms: { [platform: string]: GenerationEvent[] } = {};
    const memoryLevels: { [level: string]: GenerationEvent[] } = {};

    // Group events by segments
    this.events.forEach(event => {
      // Browser type
      const browser = this.extractBrowserType(event.browserInfo.userAgent);
      if (!browserTypes[browser]) browserTypes[browser] = [];
      browserTypes[browser].push(event);

      // Platform
      const platform = event.browserInfo.platform;
      if (!platforms[platform]) platforms[platform] = [];
      platforms[platform].push(event);

      // Memory level
      const memoryLevel = this.categorizeMemoryLevel(event.browserInfo.memoryLimit);
      if (!memoryLevels[memoryLevel]) memoryLevels[memoryLevel] = [];
      memoryLevels[memoryLevel].push(event);
    });

    return {
      browserTypes: this.calculateMetricsForGroups(browserTypes),
      platforms: this.calculateMetricsForGroups(platforms),
      memoryLevels: this.calculateMetricsForGroups(memoryLevels)
    };
  }

  /**
   * Get predictive insights
   */
  getPredictiveInsights(): {
    expectedFailureRate: number;
    recommendedMaintenanceWindow: { start: number; end: number } | null;
    capacityRecommendations: string[];
    riskFactors: string[];
  } {
    const recentEvents = this.events.slice(-100); // Last 100 events
    const failureRate = recentEvents.filter(e => !e.success).length / recentEvents.length;
    
    // Predict failure rate trend
    const expectedFailureRate = this.predictFailureRate(recentEvents);
    
    // Recommend maintenance window based on usage patterns
    const maintenanceWindow = this.recommendMaintenanceWindow();
    
    // Capacity recommendations
    const capacityRecommendations = this.generateCapacityRecommendations(recentEvents);
    
    // Risk factors
    const riskFactors = this.identifyRiskFactors(recentEvents);

    return {
      expectedFailureRate,
      recommendedMaintenanceWindow: maintenanceWindow,
      capacityRecommendations,
      riskFactors
    };
  }

  /**
   * Export analytics data for external analysis
   */
  exportAnalyticsData(format: 'json' | 'csv' = 'json'): string {
    const report = this.generateReport();
    
    if (format === 'csv') {
      return this.convertToCSV(report);
    }
    
    return JSON.stringify(report, null, 2);
  }

  // Private methods

  private filterEventsByTimeRange(timeRange?: { start: number; end: number }): GenerationEvent[] {
    if (!timeRange) return this.events;
    
    return this.events.filter(e => 
      e.timestamp >= timeRange.start && e.timestamp <= timeRange.end
    );
  }

  private getDefaultTimeRange(): { start: number; end: number } {
    const now = Date.now();
    return {
      start: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      end: now
    };
  }

  private calculateDetailedMetrics(events: GenerationEvent[]): DetailedPerformanceMetrics {
    if (events.length === 0) {
      return this.getEmptyMetrics();
    }

    const successfulEvents = events.filter(e => e.success);
    const times = events.map(e => e.duration).sort((a, b) => a - b);
    const sizes = successfulEvents.map(e => e.fileSize).sort((a, b) => a - b);
    const memoryUsages = events.map(e => e.performanceMetrics.memoryUsage);

    return {
      generationTime: {
        mean: times.reduce((sum, t) => sum + t, 0) / times.length,
        median: this.calculateMedian(times),
        p95: this.calculatePercentile(times, 95),
        p99: this.calculatePercentile(times, 99),
        trend: this.calculateTrend(events.map(e => e.duration))
      },
      fileSize: {
        mean: sizes.reduce((sum, s) => sum + s, 0) / sizes.length || 0,
        median: this.calculateMedian(sizes),
        distribution: this.calculateSizeDistribution(sizes)
      },
      memoryUsage: {
        mean: memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length,
        peak: Math.max(...memoryUsages),
        efficiency: this.calculateMemoryEfficiency(events)
      },
      successRate: {
        overall: successfulEvents.length / events.length,
        byHour: this.calculateSuccessRateByHour(events),
        byDayOfWeek: this.calculateSuccessRateByDayOfWeek(events)
      }
    };
  }

  private analyzeStrategies(events: GenerationEvent[]): StrategyAnalysis {
    const strategies: GenerationStrategy[] = ['modern', 'fallback', 'legacy'];
    const usage: { [strategy in GenerationStrategy]: number } = {} as any;
    const performance: { [strategy in GenerationStrategy]: PerformanceMetrics } = {} as any;
    const reliability: { [strategy in GenerationStrategy]: number } = {} as any;
    const recommendations: { [strategy in GenerationStrategy]: string[] } = {} as any;

    strategies.forEach(strategy => {
      const strategyEvents = events.filter(e => e.strategy === strategy);
      const successfulEvents = strategyEvents.filter(e => e.success);

      usage[strategy] = strategyEvents.length;
      reliability[strategy] = strategyEvents.length > 0 ? successfulEvents.length / strategyEvents.length : 0;
      
      performance[strategy] = {
        averageTime: strategyEvents.length > 0 
          ? strategyEvents.reduce((sum, e) => sum + e.duration, 0) / strategyEvents.length 
          : 0,
        successRate: reliability[strategy],
        averageFileSize: successfulEvents.length > 0
          ? successfulEvents.reduce((sum, e) => sum + e.fileSize, 0) / successfulEvents.length
          : 0,
        memoryEfficiency: this.calculateMemoryEfficiency(strategyEvents)
      };

      recommendations[strategy] = this.generateStrategyRecommendations(strategy, performance[strategy]);
    });

    return { usage, performance, reliability, recommendations };
  }

  private analyzeErrors(events: GenerationEvent[]): ErrorAnalysis {
    const errorEvents = events.filter(e => !e.success);
    const errorsByType: { [type: string]: number } = {};
    const errorsByStrategy: { [strategy in GenerationStrategy]: number } = {
      modern: 0,
      fallback: 0,
      legacy: 0
    };

    errorEvents.forEach(event => {
      const errorType = event.errorType || 'unknown';
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
      errorsByStrategy[event.strategy]++;
    });

    const errorTrends = this.calculateErrorTrends(errorEvents);
    const commonCauses = this.identifyCommonErrorCauses(errorEvents);
    const resolutionSuggestions = this.generateErrorResolutionSuggestions(errorsByType);

    return {
      totalErrors: errorEvents.length,
      errorsByType,
      errorsByStrategy,
      errorTrends,
      commonCauses,
      resolutionSuggestions
    };
  }

  private analyzeUserBehavior(events: GenerationEvent[]): UserBehaviorInsights {
    const peakUsageHours = this.calculatePeakUsageHours(events);
    const qualityPreferences = this.calculateQualityPreferences(events);

    return {
      peakUsageHours,
      averageSessionDuration: 0, // Would need session tracking
      retryPatterns: {
        averageRetries: 0, // Would need retry tracking
        successAfterRetry: 0
      },
      qualityPreferences
    };
  }

  private generateRecommendations(events: GenerationEvent[]): AnalyticsRecommendation[] {
    const recommendations: AnalyticsRecommendation[] = [];
    const metrics = this.calculateDetailedMetrics(events);

    // Performance recommendations
    if (metrics.generationTime.mean > 5000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Optimize Generation Speed',
        description: 'Average generation time exceeds 5 seconds',
        expectedImpact: 'Reduce generation time by 30-50%',
        implementationEffort: 'medium',
        actions: [
          'Enable performance optimizations',
          'Implement caching for repeated operations',
          'Optimize image processing pipeline'
        ]
      });
    }

    // Reliability recommendations
    if (metrics.successRate.overall < 0.95) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        title: 'Improve Success Rate',
        description: 'Success rate is below 95%',
        expectedImpact: 'Increase success rate to >98%',
        implementationEffort: 'medium',
        actions: [
          'Implement better error handling',
          'Add fallback strategies',
          'Improve browser compatibility'
        ]
      });
    }

    // Memory recommendations
    if (metrics.memoryUsage.efficiency < 0.7) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Optimize Memory Usage',
        description: 'Memory efficiency is below optimal levels',
        expectedImpact: 'Reduce memory usage by 20-30%',
        implementationEffort: 'low',
        actions: [
          'Implement memory cleanup',
          'Optimize image processing',
          'Add garbage collection hints'
        ]
      });
    }

    return recommendations;
  }

  // Helper methods

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateTrend(values: number[]): 'improving' | 'stable' | 'degrading' {
    if (values.length < 10) return 'stable';
    
    const recent = values.slice(-5);
    const older = values.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change < -0.1) return 'improving'; // 10% improvement
    if (change > 0.1) return 'degrading'; // 10% degradation
    return 'stable';
  }

  private calculateSizeDistribution(sizes: number[]): { [key: string]: number } {
    const total = sizes.length;
    if (total === 0) return {};
    
    const small = sizes.filter(s => s < 1024 * 1024).length; // < 1MB
    const medium = sizes.filter(s => s >= 1024 * 1024 && s < 3 * 1024 * 1024).length; // 1-3MB
    const large = sizes.filter(s => s >= 3 * 1024 * 1024).length; // > 3MB
    
    return {
      small: small / total,
      medium: medium / total,
      large: large / total
    };
  }

  private calculateMemoryEfficiency(events: GenerationEvent[]): number {
    if (events.length === 0) return 0;
    
    const avgMemoryPerMB = events.reduce((sum, e) => {
      const fileSizeMB = e.fileSize / (1024 * 1024);
      const memoryMB = e.performanceMetrics.memoryUsage / (1024 * 1024);
      return sum + (fileSizeMB > 0 ? memoryMB / fileSizeMB : 0);
    }, 0) / events.length;
    
    return Math.max(0, 1 - (avgMemoryPerMB / 100));
  }

  private calculateSuccessRateByHour(events: GenerationEvent[]): number[] {
    const hourlyRates = new Array(24).fill(0);
    const hourlyCounts = new Array(24).fill(0);
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyCounts[hour]++;
      if (event.success) hourlyRates[hour]++;
    });
    
    return hourlyRates.map((rate, i) => 
      hourlyCounts[i] > 0 ? rate / hourlyCounts[i] : 0
    );
  }

  private calculateSuccessRateByDayOfWeek(events: GenerationEvent[]): number[] {
    const dailyRates = new Array(7).fill(0);
    const dailyCounts = new Array(7).fill(0);
    
    events.forEach(event => {
      const day = new Date(event.timestamp).getDay();
      dailyCounts[day]++;
      if (event.success) dailyRates[day]++;
    });
    
    return dailyRates.map((rate, i) => 
      dailyCounts[i] > 0 ? rate / dailyCounts[i] : 0
    );
  }

  private createTimeBuckets(granularity: 'hour' | 'day' | 'week'): { start: number; end: number }[] {
    const now = Date.now();
    const buckets: { start: number; end: number }[] = [];
    
    let bucketSize: number;
    let bucketCount: number;
    
    switch (granularity) {
      case 'hour':
        bucketSize = 60 * 60 * 1000; // 1 hour
        bucketCount = 24; // Last 24 hours
        break;
      case 'day':
        bucketSize = 24 * 60 * 60 * 1000; // 1 day
        bucketCount = 7; // Last 7 days
        break;
      case 'week':
        bucketSize = 7 * 24 * 60 * 60 * 1000; // 1 week
        bucketCount = 4; // Last 4 weeks
        break;
    }
    
    for (let i = bucketCount - 1; i >= 0; i--) {
      const end = now - (i * bucketSize);
      const start = end - bucketSize;
      buckets.push({ start, end });
    }
    
    return buckets;
  }

  private extractBrowserType(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  }

  private categorizeMemoryLevel(memoryLimit: number): string {
    if (memoryLimit < 1024 * 1024 * 1024) return 'Low'; // < 1GB
    if (memoryLimit < 4 * 1024 * 1024 * 1024) return 'Medium'; // < 4GB
    return 'High'; // >= 4GB
  }

  private calculateMetricsForGroups(groups: { [key: string]: GenerationEvent[] }): { [key: string]: PerformanceMetrics } {
    const result: { [key: string]: PerformanceMetrics } = {};
    
    Object.entries(groups).forEach(([key, events]) => {
      const successfulEvents = events.filter(e => e.success);
      
      result[key] = {
        averageTime: events.length > 0 
          ? events.reduce((sum, e) => sum + e.duration, 0) / events.length 
          : 0,
        successRate: events.length > 0 ? successfulEvents.length / events.length : 0,
        averageFileSize: successfulEvents.length > 0
          ? successfulEvents.reduce((sum, e) => sum + e.fileSize, 0) / successfulEvents.length
          : 0,
        memoryEfficiency: this.calculateMemoryEfficiency(events)
      };
    });
    
    return result;
  }

  private predictFailureRate(events: GenerationEvent[]): number {
    // Simple linear trend prediction
    const recentFailureRates = events.slice(-20).map((_, i, arr) => {
      const window = arr.slice(Math.max(0, i - 4), i + 1);
      return window.filter(e => !e.success).length / window.length;
    });
    
    if (recentFailureRates.length < 2) return 0;
    
    // Calculate trend
    const x = recentFailureRates.map((_, i) => i);
    const y = recentFailureRates;
    const n = x.length;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next value
    return Math.max(0, Math.min(1, slope * n + intercept));
  }

  private recommendMaintenanceWindow(): { start: number; end: number } | null {
    const hourlyUsage = this.calculatePeakUsageHours(this.events);
    
    // Find the hour with lowest usage
    let minUsage = Infinity;
    let minHour = 0;
    
    hourlyUsage.forEach((usage, hour) => {
      if (usage < minUsage) {
        minUsage = usage;
        minHour = hour;
      }
    });
    
    // Recommend 2-hour window starting at the lowest usage hour
    const now = new Date();
    const maintenanceStart = new Date(now);
    maintenanceStart.setHours(minHour, 0, 0, 0);
    
    const maintenanceEnd = new Date(maintenanceStart);
    maintenanceEnd.setHours(maintenanceStart.getHours() + 2);
    
    return {
      start: maintenanceStart.getTime(),
      end: maintenanceEnd.getTime()
    };
  }

  private generateCapacityRecommendations(events: GenerationEvent[]): string[] {
    const recommendations: string[] = [];
    const avgMemoryUsage = events.reduce((sum, e) => sum + e.performanceMetrics.memoryUsage, 0) / events.length;
    
    if (avgMemoryUsage > 50 * 1024 * 1024) { // > 50MB
      recommendations.push('Consider implementing memory optimization strategies');
    }
    
    const avgGenerationTime = events.reduce((sum, e) => sum + e.duration, 0) / events.length;
    if (avgGenerationTime > 5000) { // > 5 seconds
      recommendations.push('Consider scaling up processing resources');
    }
    
    return recommendations;
  }

  private identifyRiskFactors(events: GenerationEvent[]): string[] {
    const riskFactors: string[] = [];
    const failureRate = events.filter(e => !e.success).length / events.length;
    
    if (failureRate > 0.1) {
      riskFactors.push('High failure rate detected');
    }
    
    const memoryUsageIncrease = this.calculateMemoryUsageTrend(events);
    if (memoryUsageIncrease > 0.2) {
      riskFactors.push('Memory usage increasing over time');
    }
    
    return riskFactors;
  }

  private calculateMemoryUsageTrend(events: GenerationEvent[]): number {
    if (events.length < 10) return 0;
    
    const recent = events.slice(-5);
    const older = events.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, e) => sum + e.performanceMetrics.memoryUsage, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.performanceMetrics.memoryUsage, 0) / older.length;
    
    return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
  }

  private calculateErrorTrends(errorEvents: GenerationEvent[]): { timestamp: number; count: number }[] {
    const buckets = this.createTimeBuckets('hour');
    
    return buckets.map(bucket => ({
      timestamp: bucket.start,
      count: errorEvents.filter(e => e.timestamp >= bucket.start && e.timestamp < bucket.end).length
    }));
  }

  private identifyCommonErrorCauses(errorEvents: GenerationEvent[]): string[] {
    const causes: { [cause: string]: number } = {};
    
    errorEvents.forEach(event => {
      const errorType = event.errorType || 'unknown';
      causes[errorType] = (causes[errorType] || 0) + 1;
    });
    
    return Object.entries(causes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cause]) => cause);
  }

  private generateErrorResolutionSuggestions(errorsByType: { [type: string]: number }): string[] {
    const suggestions: string[] = [];
    
    Object.keys(errorsByType).forEach(errorType => {
      switch (errorType) {
        case 'memory':
          suggestions.push('Implement memory optimization and cleanup');
          break;
        case 'timeout':
          suggestions.push('Increase timeout limits or optimize generation speed');
          break;
        case 'canvas':
          suggestions.push('Add canvas size validation and fallback strategies');
          break;
        case 'font':
          suggestions.push('Implement better font loading and fallback mechanisms');
          break;
        default:
          suggestions.push(`Investigate and address ${errorType} errors`);
      }
    });
    
    return suggestions;
  }

  private calculatePeakUsageHours(events: GenerationEvent[]): number[] {
    const hourlyUsage = new Array(24).fill(0);
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      hourlyUsage[hour]++;
    });
    
    return hourlyUsage;
  }

  private calculateQualityPreferences(events: GenerationEvent[]): { high: number; medium: number; low: number } {
    const preferences = { high: 0, medium: 0, low: 0 };
    
    // This would need to be tracked from the actual quality settings used
    // For now, return placeholder data
    const total = events.length;
    if (total === 0) return preferences;
    
    preferences.high = 0.6;
    preferences.medium = 0.3;
    preferences.low = 0.1;
    
    return preferences;
  }

  private generateStrategyRecommendations(strategy: GenerationStrategy, metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.successRate < 0.9) {
      recommendations.push(`Improve ${strategy} strategy reliability`);
    }
    
    if (metrics.averageTime > 5000) {
      recommendations.push(`Optimize ${strategy} strategy performance`);
    }
    
    if (metrics.memoryEfficiency < 0.7) {
      recommendations.push(`Reduce ${strategy} strategy memory usage`);
    }
    
    return recommendations;
  }

  private convertToCSV(report: AnalyticsReport): string {
    // Simple CSV conversion - would need more sophisticated implementation
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Generations', report.totalGenerations.toString()],
      ['Average Generation Time', report.performanceMetrics.generationTime.mean.toString()],
      ['Success Rate', report.performanceMetrics.successRate.overall.toString()],
      ['Average File Size', report.performanceMetrics.fileSize.mean.toString()]
    ];
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private getEmptyMetrics(): DetailedPerformanceMetrics {
    return {
      generationTime: {
        mean: 0,
        median: 0,
        p95: 0,
        p99: 0,
        trend: 'stable'
      },
      fileSize: {
        mean: 0,
        median: 0,
        distribution: {}
      },
      memoryUsage: {
        mean: 0,
        peak: 0,
        efficiency: 0
      },
      successRate: {
        overall: 0,
        byHour: new Array(24).fill(0),
        byDayOfWeek: new Array(7).fill(0)
      }
    };
  }
}