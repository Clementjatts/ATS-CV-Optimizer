// PDF Performance Monitor - Tracks and reports PDF generation performance

import {
  GenerationStrategy,
  PDFConfiguration,
  PDFResult
} from '../types/pdf';

export interface GenerationEvent {
  id: string;
  timestamp: number;
  strategy: GenerationStrategy;
  duration: number;
  success: boolean;
  fileSize: number;
  errorType?: string;
  elementComplexity: ElementComplexity;
  browserInfo: BrowserInfo;
  performanceMetrics: DetailedMetrics;
}

export interface ElementComplexity {
  totalElements: number;
  imageCount: number;
  textNodes: number;
  estimatedSize: number;
  hasComplexCSS: boolean;
}

export interface BrowserInfo {
  userAgent: string;
  platform: string;
  memoryLimit: number;
  canvasSupport: boolean;
  webglSupport: boolean;
}

export interface DetailedMetrics {
  canvasRenderTime: number;
  pdfCreationTime: number;
  fontLoadingTime: number;
  imageProcessingTime: number;
  memoryUsage: number;
  peakMemoryUsage: number;
  gcCount: number;
}

export interface PerformanceTrends {
  averageGenerationTime: number;
  successRate: number;
  errorRate: number;
  memoryEfficiency: number;
  timeImprovement: number;
  qualityScore: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  metrics: any;
  suggestions: string[];
}

/**
 * Performance monitoring service for PDF generation
 * Tracks metrics, analyzes trends, and provides alerts
 */
export class PDFPerformanceMonitor {
  private events: GenerationEvent[] = [];
  private alerts: PerformanceAlert[] = [];
  private maxEventHistory = 1000;
  private maxAlertHistory = 100;
  private monitoringEnabled = true;
  private alertThresholds = {
    maxGenerationTime: 10000, // 10 seconds
    minSuccessRate: 0.95, // 95%
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    maxFileSize: 5 * 1024 * 1024 // 5MB
  };

  constructor() {
    this.initializeMonitoring();
  }

  /**
   * Track a PDF generation event
   */
  trackGeneration(
    strategy: GenerationStrategy,
    config: PDFConfiguration,
    result: PDFResult,
    element: HTMLElement,
    startTime: number
  ): void {
    if (!this.monitoringEnabled) return;

    const event: GenerationEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      strategy,
      duration: result.metadata.duration,
      success: result.success,
      fileSize: result.metadata.fileSize,
      errorType: result.success ? undefined : this.categorizeError(result.error),
      elementComplexity: this.analyzeElementComplexity(element),
      browserInfo: this.getBrowserInfo(),
      performanceMetrics: this.collectDetailedMetrics(result, startTime)
    };

    this.addEvent(event);
    this.checkForAlerts(event);
  }

  /**
   * Get current performance trends
   */
  getPerformanceTrends(timeWindow?: number): PerformanceTrends {
    const events = this.getEventsInTimeWindow(timeWindow);
    
    if (events.length === 0) {
      return this.getEmptyTrends();
    }

    const successfulEvents = events.filter(e => e.success);
    const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);
    const totalMemory = events.reduce((sum, e) => sum + e.performanceMetrics.memoryUsage, 0);

    return {
      averageGenerationTime: totalDuration / events.length,
      successRate: successfulEvents.length / events.length,
      errorRate: (events.length - successfulEvents.length) / events.length,
      memoryEfficiency: this.calculateMemoryEfficiency(events),
      timeImprovement: this.calculateTimeImprovement(events),
      qualityScore: this.calculateQualityScore(successfulEvents)
    };
  }

  /**
   * Get success rate monitoring data
   */
  getSuccessRateMetrics(): {
    overall: number;
    byStrategy: Record<GenerationStrategy, number>;
    byTimeWindow: { hour: number; day: number; week: number };
    recentFailures: GenerationEvent[];
  } {
    const allEvents = this.events;
    const successfulEvents = allEvents.filter(e => e.success);
    
    // Overall success rate
    const overall = allEvents.length > 0 ? successfulEvents.length / allEvents.length : 0;

    // Success rate by strategy
    const byStrategy = {} as Record<GenerationStrategy, number>;
    const strategies: GenerationStrategy[] = ['modern', 'fallback', 'legacy'];
    
    strategies.forEach(strategy => {
      const strategyEvents = allEvents.filter(e => e.strategy === strategy);
      const strategySuccesses = strategyEvents.filter(e => e.success);
      byStrategy[strategy] = strategyEvents.length > 0 ? strategySuccesses.length / strategyEvents.length : 0;
    });

    // Success rate by time window
    const now = Date.now();
    const hour = this.getSuccessRateForWindow(now - 60 * 60 * 1000);
    const day = this.getSuccessRateForWindow(now - 24 * 60 * 60 * 1000);
    const week = this.getSuccessRateForWindow(now - 7 * 24 * 60 * 60 * 1000);

    // Recent failures
    const recentFailures = allEvents
      .filter(e => !e.success && e.timestamp > now - 24 * 60 * 60 * 1000)
      .slice(-10);

    return {
      overall,
      byStrategy,
      byTimeWindow: { hour, day, week },
      recentFailures
    };
  }

  /**
   * Get file size optimization metrics
   */
  getFileSizeMetrics(): {
    averageSize: number;
    sizeDistribution: { small: number; medium: number; large: number };
    compressionEfficiency: number;
    oversizedFiles: GenerationEvent[];
  } {
    const successfulEvents = this.events.filter(e => e.success && e.fileSize > 0);
    
    if (successfulEvents.length === 0) {
      return {
        averageSize: 0,
        sizeDistribution: { small: 0, medium: 0, large: 0 },
        compressionEfficiency: 0,
        oversizedFiles: []
      };
    }

    const totalSize = successfulEvents.reduce((sum, e) => sum + e.fileSize, 0);
    const averageSize = totalSize / successfulEvents.length;

    // Size distribution (< 1MB = small, 1-3MB = medium, > 3MB = large)
    const small = successfulEvents.filter(e => e.fileSize < 1024 * 1024).length;
    const medium = successfulEvents.filter(e => e.fileSize >= 1024 * 1024 && e.fileSize < 3 * 1024 * 1024).length;
    const large = successfulEvents.filter(e => e.fileSize >= 3 * 1024 * 1024).length;

    const sizeDistribution = {
      small: small / successfulEvents.length,
      medium: medium / successfulEvents.length,
      large: large / successfulEvents.length
    };

    // Compression efficiency (estimated)
    const compressionEfficiency = this.estimateCompressionEfficiency(successfulEvents);

    // Oversized files
    const oversizedFiles = successfulEvents.filter(e => e.fileSize > this.alertThresholds.maxFileSize);

    return {
      averageSize,
      sizeDistribution,
      compressionEfficiency,
      oversizedFiles
    };
  }

  /**
   * Create performance dashboard data
   */
  createPerformanceDashboard(): {
    summary: PerformanceTrends;
    successMetrics: any;
    fileSizeMetrics: any;
    alerts: PerformanceAlert[];
    recommendations: string[];
    healthScore: number;
  } {
    const summary = this.getPerformanceTrends();
    const successMetrics = this.getSuccessRateMetrics();
    const fileSizeMetrics = this.getFileSizeMetrics();
    const recentAlerts = this.getRecentAlerts();
    const recommendations = this.generateRecommendations();
    const healthScore = this.calculateSystemHealthScore();

    return {
      summary,
      successMetrics,
      fileSizeMetrics,
      alerts: recentAlerts,
      recommendations,
      healthScore
    };
  }

  /**
   * Get recent performance alerts
   */
  getRecentAlerts(count = 10): PerformanceAlert[] {
    return this.alerts.slice(-count);
  }

  /**
   * Configure alert thresholds
   */
  setAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  /**
   * Enable or disable monitoring
   */
  setMonitoringEnabled(enabled: boolean): void {
    this.monitoringEnabled = enabled;
  }

  /**
   * Clear performance history
   */
  clearHistory(): void {
    this.events = [];
    this.alerts = [];
  }

  /**
   * Export performance data
   */
  exportData(): {
    events: GenerationEvent[];
    alerts: PerformanceAlert[];
    summary: PerformanceTrends;
    exportTime: number;
  } {
    return {
      events: [...this.events],
      alerts: [...this.alerts],
      summary: this.getPerformanceTrends(),
      exportTime: Date.now()
    };
  }

  // Private methods

  private initializeMonitoring(): void {
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60000); // Every minute

    // Set up memory monitoring
    if ('memory' in performance) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 30000); // Every 30 seconds
    }
  }

  private generateEventId(): string {
    return `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addEvent(event: GenerationEvent): void {
    this.events.push(event);
    
    // Maintain max history size
    if (this.events.length > this.maxEventHistory) {
      this.events = this.events.slice(-this.maxEventHistory);
    }
  }

  private analyzeElementComplexity(element: HTMLElement): ElementComplexity {
    const allElements = element.querySelectorAll('*');
    const images = element.querySelectorAll('img');
    
    // Count text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let textNodes = 0;
    while (walker.nextNode()) {
      textNodes++;
    }

    // Estimate size
    const rect = element.getBoundingClientRect();
    const estimatedSize = rect.width * rect.height;

    // Check for complex CSS
    const hasComplexCSS = this.hasComplexCSS(element);

    return {
      totalElements: allElements.length,
      imageCount: images.length,
      textNodes,
      estimatedSize,
      hasComplexCSS
    };
  }

  private hasComplexCSS(element: HTMLElement): boolean {
    const complexSelectors = [
      'transform', 'filter', 'clip-path', 'mask',
      'box-shadow', 'text-shadow', 'gradient'
    ];

    const allElements = element.querySelectorAll('*');
    
    for (const el of Array.from(allElements)) {
      const style = window.getComputedStyle(el);
      
      for (const prop of complexSelectors) {
        if (style.getPropertyValue(prop) && style.getPropertyValue(prop) !== 'none') {
          return true;
        }
      }
    }

    return false;
  }

  private getBrowserInfo(): BrowserInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      memoryLimit: this.getMemoryLimit(),
      canvasSupport: !!document.createElement('canvas').getContext('2d'),
      webglSupport: !!document.createElement('canvas').getContext('webgl')
    };
  }

  private getMemoryLimit(): number {
    if ('memory' in performance) {
      return (performance as any).memory.jsHeapSizeLimit || 0;
    }
    return 0;
  }

  private collectDetailedMetrics(result: PDFResult, startTime: number): DetailedMetrics {
    const currentMemory = this.getCurrentMemoryUsage();
    
    return {
      canvasRenderTime: 0, // Will be updated by canvas renderer
      pdfCreationTime: result.metadata.duration,
      fontLoadingTime: 0, // Will be updated by font manager
      imageProcessingTime: 0, // Will be updated by image processor
      memoryUsage: currentMemory,
      peakMemoryUsage: currentMemory, // Simplified for now
      gcCount: 0 // Would need more sophisticated tracking
    };
  }

  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  private categorizeError(error?: string): string {
    if (!error) return 'unknown';
    
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('memory') || errorLower.includes('heap')) return 'memory';
    if (errorLower.includes('timeout')) return 'timeout';
    if (errorLower.includes('canvas')) return 'canvas';
    if (errorLower.includes('font')) return 'font';
    if (errorLower.includes('image')) return 'image';
    if (errorLower.includes('network')) return 'network';
    
    return 'generation';
  }

  private getEventsInTimeWindow(timeWindow?: number): GenerationEvent[] {
    if (!timeWindow) return this.events;
    
    const cutoff = Date.now() - timeWindow;
    return this.events.filter(e => e.timestamp >= cutoff);
  }

  private getEmptyTrends(): PerformanceTrends {
    return {
      averageGenerationTime: 0,
      successRate: 0,
      errorRate: 0,
      memoryEfficiency: 0,
      timeImprovement: 0,
      qualityScore: 0
    };
  }

  private calculateMemoryEfficiency(events: GenerationEvent[]): number {
    if (events.length === 0) return 0;
    
    const avgMemoryPerMB = events.reduce((sum, e) => {
      const fileSizeMB = e.fileSize / (1024 * 1024);
      const memoryMB = e.performanceMetrics.memoryUsage / (1024 * 1024);
      return sum + (fileSizeMB > 0 ? memoryMB / fileSizeMB : 0);
    }, 0) / events.length;
    
    // Lower memory per MB is better, so invert the score
    return Math.max(0, 1 - (avgMemoryPerMB / 100));
  }

  private calculateTimeImprovement(events: GenerationEvent[]): number {
    if (events.length < 10) return 0;
    
    const recent = events.slice(-5);
    const older = events.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, e) => sum + e.duration, 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + e.duration, 0) / older.length;
    
    return olderAvg > 0 ? ((olderAvg - recentAvg) / olderAvg) * 100 : 0;
  }

  private calculateQualityScore(events: GenerationEvent[]): number {
    if (events.length === 0) return 0;
    
    // Quality score based on success rate, file size, and generation time
    const avgTime = events.reduce((sum, e) => sum + e.duration, 0) / events.length;
    const avgSize = events.reduce((sum, e) => sum + e.fileSize, 0) / events.length;
    
    const timeScore = Math.max(0, 1 - (avgTime / 10000)); // 10s = 0 score
    const sizeScore = Math.max(0, 1 - (avgSize / (2 * 1024 * 1024))); // 2MB = 0 score
    
    return (timeScore + sizeScore) / 2;
  }

  private getSuccessRateForWindow(cutoff: number): number {
    const events = this.events.filter(e => e.timestamp >= cutoff);
    if (events.length === 0) return 0;
    
    const successful = events.filter(e => e.success);
    return successful.length / events.length;
  }

  private estimateCompressionEfficiency(events: GenerationEvent[]): number {
    // Simplified compression efficiency calculation
    // Based on file size vs element complexity
    if (events.length === 0) return 0;
    
    const avgEfficiency = events.reduce((sum, e) => {
      const complexity = e.elementComplexity.totalElements + e.elementComplexity.imageCount * 10;
      const sizeMB = e.fileSize / (1024 * 1024);
      const efficiency = complexity > 0 ? Math.min(1, sizeMB / (complexity / 100)) : 0;
      return sum + efficiency;
    }, 0) / events.length;
    
    return 1 - avgEfficiency; // Higher efficiency = lower size per complexity
  }

  private checkForAlerts(event: GenerationEvent): void {
    const alerts: PerformanceAlert[] = [];

    // Check generation time
    if (event.duration > this.alertThresholds.maxGenerationTime) {
      alerts.push({
        type: 'warning',
        message: `PDF generation took ${(event.duration / 1000).toFixed(1)}s, exceeding threshold of ${(this.alertThresholds.maxGenerationTime / 1000).toFixed(1)}s`,
        timestamp: Date.now(),
        metrics: { duration: event.duration, threshold: this.alertThresholds.maxGenerationTime },
        suggestions: [
          'Consider reducing PDF quality settings',
          'Optimize element complexity',
          'Enable performance optimizations'
        ]
      });
    }

    // Check memory usage
    if (event.performanceMetrics.memoryUsage > this.alertThresholds.maxMemoryUsage) {
      alerts.push({
        type: 'warning',
        message: `High memory usage detected: ${(event.performanceMetrics.memoryUsage / (1024 * 1024)).toFixed(1)}MB`,
        timestamp: Date.now(),
        metrics: { memoryUsage: event.performanceMetrics.memoryUsage },
        suggestions: [
          'Reduce image quality',
          'Lower PDF resolution',
          'Clear browser cache'
        ]
      });
    }

    // Check file size
    if (event.fileSize > this.alertThresholds.maxFileSize) {
      alerts.push({
        type: 'info',
        message: `Large PDF file generated: ${(event.fileSize / (1024 * 1024)).toFixed(1)}MB`,
        timestamp: Date.now(),
        metrics: { fileSize: event.fileSize },
        suggestions: [
          'Enable compression',
          'Reduce image quality',
          'Optimize content'
        ]
      });
    }

    // Check success rate
    const recentSuccessRate = this.getSuccessRateForWindow(Date.now() - 60 * 60 * 1000); // Last hour
    if (recentSuccessRate < this.alertThresholds.minSuccessRate) {
      alerts.push({
        type: 'error',
        message: `Low success rate detected: ${(recentSuccessRate * 100).toFixed(1)}%`,
        timestamp: Date.now(),
        metrics: { successRate: recentSuccessRate },
        suggestions: [
          'Check browser compatibility',
          'Review error logs',
          'Consider fallback strategies'
        ]
      });
    }

    // Add alerts
    alerts.forEach(alert => this.addAlert(alert));
  }

  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);
    
    // Maintain max alert history
    if (this.alerts.length > this.maxAlertHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertHistory);
    }
  }

  private generateRecommendations(): string[] {
    const trends = this.getPerformanceTrends();
    const recommendations: string[] = [];

    if (trends.averageGenerationTime > 5000) {
      recommendations.push('Consider enabling performance optimizations to reduce generation time');
    }

    if (trends.successRate < 0.95) {
      recommendations.push('Investigate recent failures to improve success rate');
    }

    if (trends.memoryEfficiency < 0.7) {
      recommendations.push('Optimize memory usage by reducing image quality or PDF resolution');
    }

    if (trends.timeImprovement < 0) {
      recommendations.push('Performance is degrading - review recent changes or clear caches');
    }

    if (recommendations.length === 0) {
      recommendations.push('PDF generation performance is optimal');
    }

    return recommendations;
  }

  private calculateSystemHealthScore(): number {
    const trends = this.getPerformanceTrends();
    
    // Weighted health score
    const successWeight = 0.4;
    const timeWeight = 0.3;
    const memoryWeight = 0.2;
    const qualityWeight = 0.1;
    
    const timeScore = Math.max(0, 1 - (trends.averageGenerationTime / 10000));
    
    return (
      trends.successRate * successWeight +
      timeScore * timeWeight +
      trends.memoryEfficiency * memoryWeight +
      trends.qualityScore * qualityWeight
    );
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
    this.events = this.events.filter(e => e.timestamp >= cutoff);
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoff);
  }

  private checkMemoryUsage(): void {
    const currentMemory = this.getCurrentMemoryUsage();
    
    if (currentMemory > this.alertThresholds.maxMemoryUsage) {
      this.addAlert({
        type: 'warning',
        message: `High system memory usage: ${(currentMemory / (1024 * 1024)).toFixed(1)}MB`,
        timestamp: Date.now(),
        metrics: { memoryUsage: currentMemory },
        suggestions: [
          'Clear PDF generation caches',
          'Restart browser if memory usage continues to grow',
          'Reduce concurrent PDF generations'
        ]
      });
    }
  }
}