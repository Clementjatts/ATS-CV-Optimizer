// PDF Generation Utility Functions

import { BrowserCapabilities, PDFConfiguration, MarginConfig, DocumentMetadata, FontConfiguration } from '../types/pdf';
import { BrowserCompatibilityError } from './errors';

/**
 * Browser capability detection utilities
 */
export class BrowserDetector {
  /**
   * Detect browser capabilities for PDF generation
   */
  static detectCapabilities(): BrowserCapabilities {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return {
      supportsCanvas: !!ctx,
      supportsWebGL: !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl'),
      supportsWorkers: typeof Worker !== 'undefined',
      supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
      maxCanvasSize: this.getMaxCanvasSize(),
      memoryLimit: this.estimateMemoryLimit()
    };
  }

  /**
   * Get maximum canvas size supported by browser
   */
  private static getMaxCanvasSize(): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return 0;

    // Test different sizes to find the maximum
    const testSizes = [32767, 16384, 8192, 4096, 2048];
    
    for (const size of testSizes) {
      canvas.width = size;
      canvas.height = size;
      
      ctx.fillStyle = 'red';
      ctx.fillRect(size - 1, size - 1, 1, 1);
      
      const imageData = ctx.getImageData(size - 1, size - 1, 1, 1);
      if (imageData.data[0] === 255) {
        return size;
      }
    }
    
    return 2048; // Safe fallback
  }

  /**
   * Estimate available memory for PDF generation
   */
  private static estimateMemoryLimit(): number {
    // @ts-ignore - performance.memory is not in all browsers
    const memory = (performance as any).memory;
    
    if (memory && memory.jsHeapSizeLimit) {
      // Use 25% of available heap for PDF generation
      return Math.floor(memory.jsHeapSizeLimit * 0.25);
    }
    
    // Conservative estimate for unknown browsers
    return 50 * 1024 * 1024; // 50MB
  }

  /**
   * Check if browser supports required features
   */
  static validateRequiredFeatures(): void {
    const capabilities = this.detectCapabilities();
    
    if (!capabilities.supportsCanvas) {
      throw new BrowserCompatibilityError('HTML5 Canvas', 'fallback');
    }
    
    if (capabilities.maxCanvasSize < 2048) {
      throw new BrowserCompatibilityError('Sufficient canvas size', 'fallback');
    }
  }
}

/**
 * PDF configuration utilities
 */
export class ConfigurationManager {
  /**
   * Get default PDF configuration
   */
  static getDefaultConfiguration(): PDFConfiguration {
    return {
      format: 'letter',
      orientation: 'portrait',
      margins: {
        top: 0.5,
        right: 0.5,
        bottom: 0.5,
        left: 0.5
      },
      resolution: 300,
      compression: {
        text: true,
        images: true,
        level: 'medium'
      },
      imageQuality: 0.85,
      fonts: [
        {
          family: 'Calibri',
          variants: ['normal', 'bold', 'italic'],
          fallbacks: ['Arial', 'sans-serif'],
          embedSubset: true
        }
      ],
      colors: {
        mode: 'rgb'
      },
      metadata: this.getDefaultMetadata(),
      strategy: 'modern',
      timeout: 30000,
      retryAttempts: 2
    };
  }

  /**
   * Get default document metadata
   */
  static getDefaultMetadata(): DocumentMetadata {
    return {
      title: 'CV Document',
      author: 'ATS CV Optimizer',
      subject: 'Professional CV',
      keywords: ['CV', 'Resume', 'Professional'],
      creator: 'ATS CV Optimizer',
      producer: 'ATS CV Optimizer PDF Generator'
    };
  }

  /**
   * Validate PDF configuration
   */
  static validateConfiguration(config: Partial<PDFConfiguration>): string[] {
    const errors: string[] = [];
    
    if (config.margins) {
      const { top, right, bottom, left } = config.margins;
      if (top < 0 || right < 0 || bottom < 0 || left < 0) {
        errors.push('Margins cannot be negative');
      }
      if (top > 2 || right > 2 || bottom > 2 || left > 2) {
        errors.push('Margins cannot exceed 2 inches');
      }
    }
    
    if (config.resolution && (config.resolution < 72 || config.resolution > 600)) {
      errors.push('Resolution must be between 72 and 600 DPI');
    }
    
    if (config.imageQuality && (config.imageQuality < 0 || config.imageQuality > 1)) {
      errors.push('Image quality must be between 0 and 1');
    }
    
    if (config.timeout && config.timeout < 1000) {
      errors.push('Timeout must be at least 1000ms');
    }
    
    return errors;
  }

  /**
   * Merge configuration with defaults
   */
  static mergeWithDefaults(config: Partial<PDFConfiguration>): PDFConfiguration {
    const defaults = this.getDefaultConfiguration();
    
    return {
      ...defaults,
      ...config,
      margins: { ...defaults.margins, ...config.margins },
      compression: { ...defaults.compression, ...config.compression },
      colors: { ...defaults.colors, ...config.colors },
      metadata: { ...defaults.metadata, ...config.metadata }
    };
  }
}

/**
 * File naming utilities
 */
export class FileNameGenerator {
  /**
   * Generate a professional PDF filename
   */
  static generateFilename(fullName: string, suffix: string = 'CV'): string {
    // Clean and format the name
    const cleanName = this.sanitizeName(fullName);
    
    if (!cleanName) {
      return `${suffix}_${this.getTimestamp()}.pdf`;
    }
    
    const filename = `${cleanName}_${suffix}.pdf`;
    
    // Ensure filename is not too long (max 255 characters for most filesystems)
    return this.truncateFilename(filename, 255);
  }

  /**
   * Sanitize name for filename use
   */
  private static sanitizeName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Truncate filename while preserving extension
   */
  private static truncateFilename(filename: string, maxLength: number): string {
    if (filename.length <= maxLength) {
      return filename;
    }
    
    const extension = '.pdf';
    const nameWithoutExt = filename.slice(0, -extension.length);
    const maxNameLength = maxLength - extension.length;
    
    return nameWithoutExt.slice(0, maxNameLength) + extension;
  }

  /**
   * Get timestamp for unique filenames
   */
  private static getTimestamp(): string {
    return new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  }

  /**
   * Validate filename for cross-platform compatibility
   */
  static validateFilename(filename: string): boolean {
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      return false;
    }
    
    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(filename)) {
      return false;
    }
    
    // Check length
    if (filename.length > 255) {
      return false;
    }
    
    return true;
  }
}

/**
 * Memory management utilities
 */
export class MemoryManager {
  /**
   * Estimate memory usage for PDF generation
   */
  static estimateMemoryUsage(elementWidth: number, elementHeight: number, dpi: number = 300): number {
    // Calculate canvas size needed
    const scaleFactor = dpi / 96; // 96 DPI is standard screen resolution
    const canvasWidth = elementWidth * scaleFactor;
    const canvasHeight = elementHeight * scaleFactor;
    
    // 4 bytes per pixel (RGBA)
    const canvasMemory = canvasWidth * canvasHeight * 4;
    
    // Add overhead for PDF generation (estimated 2x canvas size)
    return canvasMemory * 2;
  }

  /**
   * Check if there's enough memory for PDF generation
   */
  static checkMemoryAvailability(requiredMemory: number): boolean {
    const capabilities = BrowserDetector.detectCapabilities();
    return requiredMemory <= capabilities.memoryLimit;
  }

  /**
   * Clean up resources after PDF generation
   */
  static cleanup(canvas?: HTMLCanvasElement, blobs?: Blob[]): void {
    // Clear canvas
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0;
      canvas.height = 0;
    }
    
    // Revoke blob URLs
    if (blobs) {
      blobs.forEach(blob => {
        if (blob instanceof Blob) {
          URL.revokeObjectURL(URL.createObjectURL(blob));
        }
      });
    }
    
    // Suggest garbage collection (if available)
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }
  }
}