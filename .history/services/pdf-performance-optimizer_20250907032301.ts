// PDF Performance Optimizer - Optimizes PDF generation speed and memory usage

import {
  PDFOptions,
  PDFConfiguration,
  GenerationStrategy,
  BrowserCapabilities
} from '../types/pdf';
import { PDFGenerationError } from '../utils/errors';

export interface PerformanceMetrics {
  generationTime: number;
  memoryUsage: number;
  canvasRenderTime: number;
  pdfCreationTime: number;
  imageProcessingTime: number;
  fontLoadingTime: number;
  totalElements: number;
  imageCount: number;
  textNodes: number;
}

export interface OptimizationResult {
  optimizedConfig: PDFConfiguration;
  expectedImprovement: number;
  appliedOptimizations: string[];
  warnings: string[];
}

export interface MemoryProfile {
  initialMemory: number;
  peakMemory: number;
  finalMemory: number;
  memoryLeaks: boolean;
  gcSuggested: boolean;
}

/**
 * Performance optimizer for PDF generation
 * Profiles generation process and applies optimizations
 */
export class PDFPerformanceOptimizer {
  private performanceHistory: PerformanceMetrics[] = [];
  private memoryBaseline: number = 0;
  private optimizationCache = new Map<string, OptimizationResult>();

  constructor() {
    this.initializeMemoryBaseline();
  }

  /**
   * Profile PDF generation performance
   */
  async profileGeneration(
    element: HTMLElement,
    config: PDFConfiguration,
    generationFn: (el: HTMLElement, cfg: PDFConfiguration) => Promise<any>
  ): Promise<PerformanceMetrics> {
    const startTime = performance.now();
    const startMemory = this.getCurrentMemoryUsage();

    // Profile different phases
    const canvasStartTime = performance.now();
    const elementMetrics = this.analyzeElement(element);
    const canvasRenderTime = performance.now() - canvasStartTime;

    const pdfStartTime = performance.now();
    
    // Execute generation with memory monitoring
    const memoryMonitor = this.startMemoryMonitoring();
    
    try {
      await generationFn(element, config);
    } finally {
      this.stopMemoryMonitoring(memoryMonitor);
    }

    const pdfCreationTime = performance.now() - pdfStartTime;
    const totalTime = performance.now() - startTime;
    const endMemory = this.getCurrentMemoryUsage();

    const metrics: PerformanceMetrics = {
      generationTime: totalTime,
      memoryUsage: endMemory - startMemory,
      canvasRenderTime,
      pdfCreationTime,
      imageProcessingTime: 0, // Will be updated by image processor
      fontLoadingTime: 0, // Will be updated by font manager
      totalElements: elementMetrics.totalElements,
      imageCount: elementMetrics.imageCount,
      textNodes: elementMetrics.textNodes
    };

    this.performanceHistory.push(metrics);
    return metrics;
  }

  /**
   * Optimize configuration for better performance
   */
  optimizeConfiguration(
    element: HTMLElement,
    baseConfig: PDFConfiguration,
    targetPerformance?: { maxTime: number; maxMemory: number }
  ): OptimizationResult {
    const cacheKey = this.generateCacheKey(element, baseConfig);
    
    // Check cache first
    if (this.optimizationCache.has(cacheKey)) {
      return this.optimizationCache.get(cacheKey)!;
    }

    const optimizedConfig = { ...baseConfig };
    const appliedOptimizations: string[] = [];
    const warnings: string[] = [];
    let expectedImprovement = 0;

    // Analyze element complexity
    const complexity = this.analyzeComplexity(element);
    
    // Apply resolution optimization
    if (complexity.isHighComplexity && baseConfig.resolution > 200) {
      optimizedConfig.resolution = Math.max(150, baseConfig.resolution * 0.8);
      appliedOptimizations.push('Reduced resolution for complex content');
      expectedImprovement += 0.3;
    }

    // Apply image quality optimization
    if (complexity.imageCount > 5 && baseConfig.imageQuality > 0.8) {
      optimizedConfig.imageQuality = Math.max(0.7, baseConfig.imageQuality - 0.1);
      appliedOptimizations.push('Reduced image quality for multiple images');
      expectedImprovement += 0.2;
    }

    // Apply compression optimization
    if (complexity.totalSize > 1000000) { // > 1MB estimated
      optimizedConfig.compression = {
        ...optimizedConfig.compression,
        level: 'high',
        images: true,
        text: true
      };
      appliedOptimizations.push('Enabled aggressive compression for large content');
      expectedImprovement += 0.25;
    }

    // Apply timeout optimization
    if (targetPerformance?.maxTime) {
      const estimatedTime = this.estimateGenerationTime(complexity);
      if (estimatedTime > targetPerformance.maxTime) {
        optimizedConfig.timeout = Math.max(5000, targetPerformance.maxTime * 0.9);
        warnings.push('Reduced timeout may cause generation failures for complex content');
      }
    }

    // Apply memory optimization
    if (targetPerformance?.maxMemory) {
      const estimatedMemory = this.estimateMemoryUsage(complexity);
      if (estimatedMemory > targetPerformance.maxMemory) {
        // Reduce canvas size to save memory
        optimizedConfig.resolution = Math.max(96, optimizedConfig.resolution * 0.7);
        appliedOptimizations.push('Reduced resolution to fit memory constraints');
        warnings.push('Lower resolution may affect PDF quality');
        expectedImprovement += 0.4;
      }
    }

    const result: OptimizationResult = {
      optimizedConfig,
      expectedImprovement,
      appliedOptimizations,
      warnings
    };

    // Cache the result
    this.optimizationCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Implement lazy loading for PDF dependencies
   */
  async lazyLoadDependencies(strategy: GenerationStrategy): Promise<void> {
    const loadStartTime = performance.now();

    try {
      switch (strategy) {
        case 'modern':
          await this.lazyLoadModernDependencies();
          break;
        case 'fallback':
          await this.lazyLoadFallbackDependencies();
          break;
        case 'legacy':
          await this.lazyLoadLegacyDependencies();
          break;
      }

      const loadTime = performance.now() - loadStartTime;
      console.log(`Dependencies loaded in ${loadTime.toFixed(2)}ms for strategy: ${strategy}`);
    } catch (error) {
      throw new PDFGenerationError(
        `Failed to load dependencies for ${strategy} strategy: ${error.message}`,
        'generation',
        true
      );
    }
  }

  /**
   * Implement caching for repeated operations
   */
  setupGenerationCache(): PDFGenerationCache {
    return new PDFGenerationCache();
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    averageTime: number;
    averageMemory: number;
    successRate: number;
    trends: any;
  } {
    if (this.performanceHistory.length === 0) {
      return {
        averageTime: 0,
        averageMemory: 0,
        successRate: 0,
        trends: {}
      };
    }

    const totalTime = this.performanceHistory.reduce((sum, m) => sum + m.generationTime, 0);
    const totalMemory = this.performanceHistory.reduce((sum, m) => sum + m.memoryUsage, 0);
    
    return {
      averageTime: totalTime / this.performanceHistory.length,
      averageMemory: totalMemory / this.performanceHistory.length,
      successRate: 1.0, // Will be updated with actual success tracking
      trends: this.calculateTrends()
    };
  }

  /**
   * Monitor memory usage during generation
   */
  createMemoryProfile(): MemoryProfile {
    const initialMemory = this.getCurrentMemoryUsage();
    
    return {
      initialMemory,
      peakMemory: initialMemory,
      finalMemory: initialMemory,
      memoryLeaks: false,
      gcSuggested: false
    };
  }

  /**
   * Suggest garbage collection if needed
   */
  suggestGarbageCollection(): boolean {
    const currentMemory = this.getCurrentMemoryUsage();
    const memoryIncrease = currentMemory - this.memoryBaseline;
    
    // Suggest GC if memory usage increased by more than 50MB
    return memoryIncrease > 50 * 1024 * 1024;
  }

  /**
   * Clear performance history and caches
   */
  clearPerformanceData(): void {
    this.performanceHistory = [];
    this.optimizationCache.clear();
    this.initializeMemoryBaseline();
  }

  // Private methods

  private initializeMemoryBaseline(): void {
    this.memoryBaseline = this.getCurrentMemoryUsage();
  }

  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  private analyzeElement(element: HTMLElement): {
    totalElements: number;
    imageCount: number;
    textNodes: number;
  } {
    const allElements = element.querySelectorAll('*');
    const images = element.querySelectorAll('img');
    
    // Count text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let textNodes = 0;
    while (walker.nextNode()) {
      textNodes++;
    }

    return {
      totalElements: allElements.length,
      imageCount: images.length,
      textNodes
    };
  }

  private analyzeComplexity(element: HTMLElement): {
    isHighComplexity: boolean;
    totalElements: number;
    imageCount: number;
    totalSize: number;
    estimatedRenderTime: number;
  } {
    const metrics = this.analyzeElement(element);
    const rect = element.getBoundingClientRect();
    const totalSize = rect.width * rect.height;
    
    // Estimate render time based on complexity
    const baseTime = 1000; // 1 second base
    const elementFactor = metrics.totalElements * 2;
    const imageFactor = metrics.imageCount * 500;
    const sizeFactor = totalSize / 10000;
    
    const estimatedRenderTime = baseTime + elementFactor + imageFactor + sizeFactor;
    
    return {
      isHighComplexity: metrics.totalElements > 100 || metrics.imageCount > 3 || totalSize > 500000,
      totalElements: metrics.totalElements,
      imageCount: metrics.imageCount,
      totalSize,
      estimatedRenderTime
    };
  }

  private estimateGenerationTime(complexity: any): number {
    return complexity.estimatedRenderTime + 2000; // Add 2 seconds for PDF creation
  }

  private estimateMemoryUsage(complexity: any): number {
    // Rough estimation: 1MB per 100 elements + 2MB per image + size factor
    const elementMemory = (complexity.totalElements / 100) * 1024 * 1024;
    const imageMemory = complexity.imageCount * 2 * 1024 * 1024;
    const sizeMemory = complexity.totalSize / 1000; // 1KB per 1000 pixels
    
    return elementMemory + imageMemory + sizeMemory;
  }

  private generateCacheKey(element: HTMLElement, config: PDFConfiguration): string {
    const elementHash = this.hashElement(element);
    const configHash = this.hashConfig(config);
    return `${elementHash}-${configHash}`;
  }

  private hashElement(element: HTMLElement): string {
    // Simple hash based on element structure
    const rect = element.getBoundingClientRect();
    const childCount = element.children.length;
    return `${rect.width}x${rect.height}-${childCount}`;
  }

  private hashConfig(config: PDFConfiguration): string {
    return `${config.format}-${config.resolution}-${config.imageQuality}`;
  }

  private startMemoryMonitoring(): NodeJS.Timeout {
    return setInterval(() => {
      // Memory monitoring logic would go here
      // For now, just a placeholder
    }, 100);
  }

  private stopMemoryMonitoring(monitor: NodeJS.Timeout): void {
    clearInterval(monitor);
  }

  private calculateTrends(): any {
    if (this.performanceHistory.length < 2) {
      return {};
    }

    const recent = this.performanceHistory.slice(-10);
    const older = this.performanceHistory.slice(-20, -10);
    
    if (older.length === 0) {
      return {};
    }

    const recentAvg = recent.reduce((sum, m) => sum + m.generationTime, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.generationTime, 0) / older.length;
    
    return {
      timeImprovement: ((olderAvg - recentAvg) / olderAvg) * 100,
      isImproving: recentAvg < olderAvg
    };
  }

  private async lazyLoadModernDependencies(): Promise<void> {
    // Lazy load jsPDF and html2canvas
    const [jsPDF, html2canvas] = await Promise.all([
      import('jspdf'),
      import('html2canvas')
    ]);
    
    // Pre-warm the modules
    new jsPDF.default();
  }

  private async lazyLoadFallbackDependencies(): Promise<void> {
    // Lazy load fallback dependencies (would be server-side modules)
    // For now, just a placeholder
  }

  private async lazyLoadLegacyDependencies(): Promise<void> {
    // Lazy load html2pdf.js
    await import('html2pdf.js');
  }
}

/**
 * Cache for PDF generation operations
 */
export class PDFGenerationCache {
  private fontCache = new Map<string, any>();
  private imageCache = new Map<string, string>();
  private configCache = new Map<string, PDFConfiguration>();
  private maxCacheSize = 50;

  /**
   * Cache font loading results
   */
  cacheFont(fontFamily: string, fontData: any): void {
    if (this.fontCache.size >= this.maxCacheSize) {
      const firstKey = this.fontCache.keys().next().value;
      this.fontCache.delete(firstKey);
    }
    this.fontCache.set(fontFamily, fontData);
  }

  /**
   * Get cached font
   */
  getCachedFont(fontFamily: string): any | null {
    return this.fontCache.get(fontFamily) || null;
  }

  /**
   * Cache processed image
   */
  cacheImage(imageUrl: string, processedDataUrl: string): void {
    if (this.imageCache.size >= this.maxCacheSize) {
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }
    this.imageCache.set(imageUrl, processedDataUrl);
  }

  /**
   * Get cached image
   */
  getCachedImage(imageUrl: string): string | null {
    return this.imageCache.get(imageUrl) || null;
  }

  /**
   * Cache configuration
   */
  cacheConfiguration(key: string, config: PDFConfiguration): void {
    if (this.configCache.size >= this.maxCacheSize) {
      const firstKey = this.configCache.keys().next().value;
      this.configCache.delete(firstKey);
    }
    this.configCache.set(key, config);
  }

  /**
   * Get cached configuration
   */
  getCachedConfiguration(key: string): PDFConfiguration | null {
    return this.configCache.get(key) || null;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.fontCache.clear();
    this.imageCache.clear();
    this.configCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    fontCacheSize: number;
    imageCacheSize: number;
    configCacheSize: number;
    totalSize: number;
  } {
    return {
      fontCacheSize: this.fontCache.size,
      imageCacheSize: this.imageCache.size,
      configCacheSize: this.configCache.size,
      totalSize: this.fontCache.size + this.imageCache.size + this.configCache.size
    };
  }
}