// PDF Configuration Management System
// Handles PDF configuration validation, sanitization, and user preferences

import {
  PDFConfiguration,
  PDFOptions,
  MarginConfig,
  DocumentMetadata,
  FontConfiguration,
  CompressionSettings,
  PageFormat,
  GenerationStrategy,
  ValidationResult
} from '../types/pdf';
import {
  DEFAULT_MARGINS,
  PAGE_FORMATS,
  DPI_SETTINGS,
  TIMEOUTS,
  DEFAULT_METADATA,
  FONT_CONFIGS,
  FILE_SIZE_LIMITS,
  MEMORY_LIMITS
} from '../constants/pdf-constants';
import { PDFGenerationError } from '../utils/errors';

/**
 * Configuration manager for PDF generation system
 * Handles validation, sanitization, and user preference management
 */
export class PDFConfigurationManager {
  private static readonly STORAGE_KEY = 'pdf-generation-preferences';
  private userPreferences: Partial<PDFConfiguration> | null = null;

  constructor() {
    this.loadUserPreferences();
  }

  /**
   * Create a complete PDF configuration from options and user preferences
   */
  createConfiguration(options: PDFOptions, strategy?: GenerationStrategy): PDFConfiguration {
    const baseConfig = this.getDefaultConfiguration();
    const userPrefs = this.getUserPreferences();
    
    // Merge configurations in priority order: options > user preferences > defaults
    const config: PDFConfiguration = {
      ...baseConfig,
      ...userPrefs,
      
      // Override with provided options
      format: options.format,
      margins: this.validateMargins(options.margins),
      metadata: this.mergeMetadata(baseConfig.metadata, userPrefs.metadata, options.metadata),
      resolution: DPI_SETTINGS[options.quality],
      strategy: strategy || userPrefs.strategy || baseConfig.strategy,
      timeout: strategy ? TIMEOUTS[strategy] : (userPrefs.timeout || baseConfig.timeout)
    };

    // Validate the final configuration
    const validation = this.validateConfiguration(config);
    if (!validation.isValid) {
      throw new PDFGenerationError(
        `Invalid configuration: ${validation.errors.join(', ')}`,
        'content',
        false
      );
    }

    return this.sanitizeConfiguration(config);
  }

  /**
   * Validate PDF configuration
   */
  validateConfiguration(config: PDFConfiguration): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate page format
    if (!PAGE_FORMATS[config.format]) {
      errors.push(`Invalid page format: ${config.format}`);
    }

    // Validate margins
    const marginValidation = this.validateMargins(config.margins);
    if (marginValidation !== config.margins) {
      warnings.push('Margins were adjusted to valid ranges');
    }

    // Validate resolution
    if (config.resolution < 72 || config.resolution > 600) {
      errors.push(`Resolution must be between 72 and 600 DPI, got ${config.resolution}`);
    }

    // Validate image quality
    if (config.imageQuality < 0 || config.imageQuality > 1) {
      errors.push(`Image quality must be between 0 and 1, got ${config.imageQuality}`);
    }

    // Validate timeout
    if (config.timeout < 5000 || config.timeout > 300000) {
      warnings.push('Timeout should be between 5 seconds and 5 minutes');
    }

    // Validate retry attempts
    if (config.retryAttempts < 0 || config.retryAttempts > 10) {
      warnings.push('Retry attempts should be between 0 and 10');
    }

    // Validate fonts
    if (config.fonts.length > 20) {
      warnings.push('Too many fonts may impact performance');
      suggestions.push('Consider reducing the number of fonts');
    }

    // Performance warnings
    if (config.resolution > 300 && config.imageQuality > 0.9) {
      warnings.push('High resolution and quality settings may slow generation');
      suggestions.push('Consider reducing resolution or image quality for faster generation');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Sanitize configuration values to ensure they're within valid ranges
   */
  sanitizeConfiguration(config: PDFConfiguration): PDFConfiguration {
    return {
      ...config,
      margins: this.validateMargins(config.margins),
      resolution: Math.max(72, Math.min(600, config.resolution)),
      imageQuality: Math.max(0, Math.min(1, config.imageQuality)),
      timeout: Math.max(5000, Math.min(300000, config.timeout)),
      retryAttempts: Math.max(0, Math.min(10, config.retryAttempts)),
      compression: this.sanitizeCompressionSettings(config.compression),
      fonts: this.sanitizeFontConfigurations(config.fonts)
    };
  }

  /**
   * Get user preferences from storage
   */
  getUserPreferences(): Partial<PDFConfiguration> {
    if (this.userPreferences) {
      return this.userPreferences;
    }
    
    return this.loadUserPreferences();
  }

  /**
   * Save user preferences to storage
   */
  saveUserPreferences(preferences: Partial<PDFConfiguration>): void {
    try {
      // Validate preferences before saving
      const testConfig = this.createConfiguration({
        filename: 'test.pdf',
        quality: 'medium',
        format: 'letter',
        margins: DEFAULT_MARGINS,
        metadata: {
          title: 'Test',
          author: 'Test',
          creator: DEFAULT_METADATA.creator,
          producer: DEFAULT_METADATA.producer
        }
      });

      // If validation passes, save preferences
      this.userPreferences = preferences;
      localStorage.setItem(PDFConfigurationManager.STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
      throw new PDFGenerationError(
        'Invalid preferences provided',
        'content',
        false
      );
    }
  }

  /**
   * Reset user preferences to defaults
   */
  resetUserPreferences(): void {
    this.userPreferences = null;
    localStorage.removeItem(PDFConfigurationManager.STORAGE_KEY);
  }

  /**
   * Get configuration optimized for specific use cases
   */
  getOptimizedConfiguration(useCase: 'speed' | 'quality' | 'size' | 'compatibility'): Partial<PDFConfiguration> {
    const baseConfig = this.getDefaultConfiguration();

    switch (useCase) {
      case 'speed':
        return {
          ...baseConfig,
          resolution: DPI_SETTINGS.low,
          imageQuality: 0.7,
          compression: {
            text: true,
            images: true,
            level: 'high'
          },
          timeout: TIMEOUTS.modern * 0.5
        };

      case 'quality':
        return {
          ...baseConfig,
          resolution: DPI_SETTINGS.high,
          imageQuality: 0.95,
          compression: {
            text: false,
            images: false,
            level: 'none'
          },
          timeout: TIMEOUTS.modern * 2
        };

      case 'size':
        return {
          ...baseConfig,
          resolution: DPI_SETTINGS.low,
          imageQuality: 0.6,
          compression: {
            text: true,
            images: true,
            level: 'high'
          }
        };

      case 'compatibility':
        return {
          ...baseConfig,
          resolution: DPI_SETTINGS.medium,
          imageQuality: 0.8,
          compression: {
            text: true,
            images: true,
            level: 'medium'
          },
          strategy: 'legacy'
        };

      default:
        return baseConfig;
    }
  }

  // Private methods

  /**
   * Get default PDF configuration
   */
  private getDefaultConfiguration(): PDFConfiguration {
    return {
      format: 'letter',
      orientation: 'portrait',
      margins: { ...DEFAULT_MARGINS },
      resolution: DPI_SETTINGS.medium,
      compression: {
        text: true,
        images: true,
        level: 'medium'
      },
      imageQuality: 0.85,
      fonts: [
        {
          family: FONT_CONFIGS.primary.family,
          variants: ['normal', 'bold'],
          fallbacks: [...FONT_CONFIGS.primary.fallbacks],
          embedSubset: true
        }
      ],
      colors: {
        mode: 'rgb'
      },
      metadata: { 
        title: 'Professional CV',
        author: 'CV Owner',
        ...DEFAULT_METADATA 
      },
      strategy: 'modern',
      timeout: TIMEOUTS.modern,
      retryAttempts: 3
    };
  }

  /**
   * Load user preferences from storage
   */
  private loadUserPreferences(): Partial<PDFConfiguration> {
    try {
      const stored = localStorage.getItem(PDFConfigurationManager.STORAGE_KEY);
      if (stored) {
        const preferences = JSON.parse(stored) as Partial<PDFConfiguration>;
        this.userPreferences = preferences;
        return preferences;
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
    
    this.userPreferences = {};
    return {};
  }

  /**
   * Validate and sanitize margins
   */
  private validateMargins(margins: MarginConfig): MarginConfig {
    const sanitized = { ...margins };
    
    // Ensure margins are within reasonable bounds (0.1 to 2 inches)
    sanitized.top = Math.max(0.1, Math.min(2, sanitized.top));
    sanitized.right = Math.max(0.1, Math.min(2, sanitized.right));
    sanitized.bottom = Math.max(0.1, Math.min(2, sanitized.bottom));
    sanitized.left = Math.max(0.1, Math.min(2, sanitized.left));
    
    return sanitized;
  }

  /**
   * Merge metadata objects with precedence
   */
  private mergeMetadata(
    base: DocumentMetadata,
    user?: Partial<DocumentMetadata>,
    options?: Partial<DocumentMetadata>
  ): DocumentMetadata {
    return {
      ...base,
      ...user,
      ...options,
      // Always preserve system metadata
      creator: DEFAULT_METADATA.creator,
      producer: DEFAULT_METADATA.producer
    };
  }

  /**
   * Sanitize compression settings
   */
  private sanitizeCompressionSettings(compression: CompressionSettings): CompressionSettings {
    return {
      text: Boolean(compression.text),
      images: Boolean(compression.images),
      level: ['none', 'low', 'medium', 'high'].includes(compression.level) 
        ? compression.level 
        : 'medium'
    };
  }

  /**
   * Sanitize font configurations
   */
  private sanitizeFontConfigurations(fonts: FontConfiguration[]): FontConfiguration[] {
    return fonts.slice(0, 20).map(font => ({
      family: font.family.trim(),
      variants: font.variants.slice(0, 10),
      fallbacks: font.fallbacks.slice(0, 5),
      embedSubset: Boolean(font.embedSubset)
    }));
  }
}

/**
 * Utility functions for configuration management
 */
export class ConfigurationUtils {
  /**
   * Create filename from user data with sanitization
   */
  static createFilename(firstName?: string, lastName?: string, suffix: string = 'CV'): string {
    const sanitize = (str: string) => str
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    let filename = '';
    
    if (firstName) {
      filename += sanitize(firstName);
    }
    
    if (lastName) {
      if (filename) filename += '_';
      filename += sanitize(lastName);
    }
    
    if (!filename) {
      filename = 'CV';
    }
    
    filename += `_${suffix}`;
    
    // Ensure filename is not too long
    if (filename.length > 100) {
      filename = filename.substring(0, 97) + '...';
    }
    
    return `${filename}.pdf`;
  }

  /**
   * Estimate memory usage for given configuration
   */
  static estimateMemoryUsage(config: PDFConfiguration, elementSize: { width: number; height: number }): number {
    const pixelCount = elementSize.width * elementSize.height;
    const dpiMultiplier = config.resolution / 96; // 96 DPI is standard screen resolution
    const actualPixels = pixelCount * dpiMultiplier * dpiMultiplier;
    
    // Estimate 4 bytes per pixel (RGBA) plus overhead
    const estimatedBytes = actualPixels * 4 * 1.5; // 1.5x for overhead
    
    return Math.round(estimatedBytes);
  }

  /**
   * Check if configuration is suitable for given constraints
   */
  static validateConstraints(
    config: PDFConfiguration, 
    constraints: { maxMemory?: number; maxTime?: number; maxFileSize?: number }
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (constraints.maxMemory && config.resolution > 200) {
      const estimatedMemory = config.resolution * config.resolution * 100; // Rough estimate
      if (estimatedMemory > constraints.maxMemory) {
        errors.push('Configuration may exceed memory limits');
      }
    }
    
    if (constraints.maxTime && config.timeout > constraints.maxTime) {
      warnings.push('Timeout exceeds recommended maximum');
    }
    
    if (constraints.maxFileSize && config.imageQuality > 0.9 && config.compression.level === 'none') {
      warnings.push('Configuration may produce large files');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: []
    };
  }
}