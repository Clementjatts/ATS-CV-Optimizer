// Tests for PDF Performance Optimizer

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFPerformanceOptimizer, PDFGenerationCache } from '../../../services/pdf-performance-optimizer';
import { PDFConfiguration } from '../../../types/pdf';

describe('PDFPerformanceOptimizer', () => {
  let optimizer: PDFPerformanceOptimizer;
  let mockElement: HTMLElement;
  let mockConfig: PDFConfiguration;

  beforeEach(() => {
    optimizer = new PDFPerformanceOptimizer();
    
    // Create mock element
    mockElement = document.createElement('div');
    mockElement.innerHTML = `
      <h1>Test CV</h1>
      <p>Some content</p>
      <img src="test.jpg" alt="test" />
    `;
    document.body.appendChild(mockElement);

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
  });

  describe('optimizeConfiguration', () => {
    it('should optimize configuration for high complexity content', () => {
      // Create complex element
      const complexElement = document.createElement('div');
      for (let i = 0; i < 150; i++) {
        const div = document.createElement('div');
        div.textContent = `Element ${i}`;
        complexElement.appendChild(div);
      }

      const result = optimizer.optimizeConfiguration(complexElement, mockConfig);

      expect(result.appliedOptimizations.length).toBeGreaterThan(0);
      expect(result.expectedImprovement).toBeGreaterThan(0);
      expect(result.optimizedConfig.resolution).toBeLessThanOrEqual(mockConfig.resolution);
    });

    it('should not over-optimize simple content', () => {
      const result = optimizer.optimizeConfiguration(mockElement, mockConfig);

      expect(result.expectedImprovement).toBeLessThan(0.5);
    });

    it('should respect memory constraints', () => {
      const result = optimizer.optimizeConfiguration(
        mockElement, 
        mockConfig,
        { maxTime: 5000, maxMemory: 10 * 1024 * 1024 } // 10MB limit
      );

      if (result.appliedOptimizations.length > 0) {
        expect(result.optimizedConfig.resolution).toBeLessThanOrEqual(mockConfig.resolution);
      }
    });
  });

  describe('profileGeneration', () => {
    it('should profile generation performance', async () => {
      const mockGenerationFn = vi.fn().mockImplementation(async () => {
        // Add a small delay to simulate actual generation time
        await new Promise(resolve => setTimeout(resolve, 10));
        return { success: true };
      });

      const metrics = await optimizer.profileGeneration(
        mockElement,
        mockConfig,
        mockGenerationFn
      );

      expect(metrics.generationTime).toBeGreaterThan(0);
      expect(metrics.totalElements).toBeGreaterThan(0);
      expect(mockGenerationFn).toHaveBeenCalledWith(mockElement, mockConfig);
    });
  });

  describe('lazyLoadDependencies', () => {
    it('should load modern strategy dependencies', async () => {
      await expect(optimizer.lazyLoadDependencies('modern')).resolves.not.toThrow();
    });

    it('should load legacy strategy dependencies', async () => {
      await expect(optimizer.lazyLoadDependencies('legacy')).resolves.not.toThrow();
    });
  });

  describe('getPerformanceStats', () => {
    it('should return performance statistics', () => {
      const stats = optimizer.getPerformanceStats();

      expect(stats).toHaveProperty('averageTime');
      expect(stats).toHaveProperty('averageMemory');
      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('trends');
    });
  });
});

describe('PDFGenerationCache', () => {
  let cache: PDFGenerationCache;

  beforeEach(() => {
    cache = new PDFGenerationCache();
  });

  describe('font caching', () => {
    it('should cache and retrieve fonts', () => {
      const fontData = { family: 'Arial', data: 'mock-font-data' };
      
      cache.cacheFont('Arial', fontData);
      const retrieved = cache.getCachedFont('Arial');

      expect(retrieved).toEqual(fontData);
    });

    it('should return null for uncached fonts', () => {
      const retrieved = cache.getCachedFont('NonExistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('image caching', () => {
    it('should cache and retrieve images', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const processedData = 'data:image/jpeg;base64,mock-data';
      
      cache.cacheImage(imageUrl, processedData);
      const retrieved = cache.getCachedImage(imageUrl);

      expect(retrieved).toBe(processedData);
    });

    it('should return null for uncached images', () => {
      const retrieved = cache.getCachedImage('https://example.com/nonexistent.jpg');
      expect(retrieved).toBeNull();
    });
  });

  describe('configuration caching', () => {
    it('should cache and retrieve configurations', () => {
      const config = { format: 'letter', resolution: 300 } as any;
      const key = 'test-config';
      
      cache.cacheConfiguration(key, config);
      const retrieved = cache.getCachedConfiguration(key);

      expect(retrieved).toEqual(config);
    });
  });

  describe('cache management', () => {
    it('should provide cache statistics', () => {
      cache.cacheFont('Arial', { family: 'Arial' });
      cache.cacheImage('test.jpg', 'data:image/jpeg;base64,test');
      
      const stats = cache.getStats();

      expect(stats.fontCacheSize).toBe(1);
      expect(stats.imageCacheSize).toBe(1);
      expect(stats.totalSize).toBe(2);
    });

    it('should clear all caches', () => {
      cache.cacheFont('Arial', { family: 'Arial' });
      cache.cacheImage('test.jpg', 'data:image/jpeg;base64,test');
      
      cache.clearAll();
      
      const stats = cache.getStats();
      expect(stats.totalSize).toBe(0);
    });
  });
});