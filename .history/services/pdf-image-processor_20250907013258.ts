// Image Optimization and Processing for PDF Generation
// Handles image compression, scaling, format conversion, and high-DPI support

import { PDFGenerationError } from '../utils/errors';
import { FILE_SIZE_LIMITS } from '../constants/pdf-constants';

export interface ImageInfo {
  src: string;
  width: number;
  height: number;
  format: string;
  size: number;
  quality: number;
  dpi: number;
}

export interface OptimizedImage {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
  size: number;
  compressionRatio: number;
  optimizations: string[];
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  dpi?: number;
  preserveAspectRatio?: boolean;
  enableCompression?: boolean;
}

export class PDFImageProcessor {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private imageCache: Map<string, OptimizedImage> = new Map();

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new PDFGenerationError(
        'Canvas 2D context not available for image processing',
        'browser',
        false
      );
    }
    this.context = ctx;
  }

  /**
   * Process all images in an HTML element for PDF optimization
   */
  async processImagesInElement(
    element: HTMLElement, 
    options: ImageProcessingOptions = {}
  ): Promise<Map<HTMLImageElement, OptimizedImage>> {
    const images = element.querySelectorAll('img');
    const processedImages = new Map<HTMLImageElement, OptimizedImage>();

    for (const img of Array.from(images)) {
      try {
        const optimized = await this.optimizeImage(img, options);
        processedImages.set(img, optimized);
      } catch (error) {
        console.warn(`Failed to optimize image ${img.src}:`, error);
        // Create fallback optimized image
        const fallback = await this.createFallbackImage(img);
        processedImages.set(img, fallback);
      }
    }

    return processedImages;
  }

  /**
   * Optimize a single image for PDF embedding
   */
  async optimizeImage(
    img: HTMLImageElement, 
    options: ImageProcessingOptions = {}
  ): Promise<OptimizedImage> {
    // Check cache first
    const cacheKey = this.generateCacheKey(img.src, options);
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    // Ensure image is loaded
    await this.ensureImageLoaded(img);

    // Get image info
    const imageInfo = this.getImageInfo(img);

    // Calculate optimal dimensions
    const dimensions = this.calculateOptimalDimensions(imageInfo, options);

    // Process image
    const optimized = await this.processImage(img, dimensions, options);

    // Cache result
    this.imageCache.set(cacheKey, optimized);

    return optimized;
  }

  /**
   * Convert image to optimal format for PDF
   */
  async convertImageFormat(
    img: HTMLImageElement, 
    targetFormat: 'jpeg' | 'png' | 'webp',
    quality: number = 0.9
  ): Promise<OptimizedImage> {
    await this.ensureImageLoaded(img);

    // Set canvas size to image size
    this.canvas.width = img.naturalWidth;
    this.canvas.height = img.naturalHeight;

    // Clear canvas and draw image
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(img, 0, 0);

    // Convert to target format
    const mimeType = `image/${targetFormat}`;
    const dataUrl = this.canvas.toDataURL(mimeType, quality);

    return {
      dataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: targetFormat,
      size: this.estimateDataUrlSize(dataUrl),
      compressionRatio: this.calculateCompressionRatio(img, dataUrl),
      optimizations: [`format-conversion-${targetFormat}`]
    };
  }

  /**
   * Scale image for high-DPI displays and print quality
   */
  async scaleImageForDPI(
    img: HTMLImageElement, 
    targetDPI: number,
    printDPI: number = 300
  ): Promise<OptimizedImage> {
    await this.ensureImageLoaded(img);

    // Calculate scale factor
    const scaleFactor = printDPI / targetDPI;
    const newWidth = Math.round(img.naturalWidth * scaleFactor);
    const newHeight = Math.round(img.naturalHeight * scaleFactor);

    // Validate dimensions
    if (newWidth > 4096 || newHeight > 4096) {
      throw new PDFGenerationError(
        'Scaled image dimensions exceed maximum canvas size',
        'generation',
        true
      );
    }

    // Set canvas size
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    // Enable high-quality scaling
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';

    // Clear and draw scaled image
    this.context.clearRect(0, 0, newWidth, newHeight);
    this.context.drawImage(img, 0, 0, newWidth, newHeight);

    // Generate optimized data URL
    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.95);

    return {
      dataUrl,
      width: newWidth,
      height: newHeight,
      format: 'jpeg',
      size: this.estimateDataUrlSize(dataUrl),
      compressionRatio: this.calculateCompressionRatio(img, dataUrl),
      optimizations: [`dpi-scaling-${targetDPI}-to-${printDPI}`]
    };
  }

  /**
   * Compress image while maintaining quality
   */
  async compressImage(
    img: HTMLImageElement, 
    targetSize: number,
    minQuality: number = 0.5
  ): Promise<OptimizedImage> {
    await this.ensureImageLoaded(img);

    let quality = 0.95;
    let optimized: OptimizedImage;
    const optimizations: string[] = [];

    // Set canvas size
    this.canvas.width = img.naturalWidth;
    this.canvas.height = img.naturalHeight;

    // Draw image
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(img, 0, 0);

    // Iteratively reduce quality until target size is reached
    do {
      const dataUrl = this.canvas.toDataURL('image/jpeg', quality);
      const size = this.estimateDataUrlSize(dataUrl);

      optimized = {
        dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: 'jpeg',
        size,
        compressionRatio: this.calculateCompressionRatio(img, dataUrl),
        optimizations: [...optimizations, `quality-${Math.round(quality * 100)}`]
      };

      if (size <= targetSize || quality <= minQuality) {
        break;
      }

      quality -= 0.05;
    } while (quality > minQuality);

    return optimized;
  }

  /**
   * Apply smart cropping to focus on important content
   */
  async smartCrop(
    img: HTMLImageElement, 
    targetWidth: number, 
    targetHeight: number
  ): Promise<OptimizedImage> {
    await this.ensureImageLoaded(img);

    const sourceAspectRatio = img.naturalWidth / img.naturalHeight;
    const targetAspectRatio = targetWidth / targetHeight;

    let sourceX = 0, sourceY = 0;
    let sourceWidth = img.naturalWidth;
    let sourceHeight = img.naturalHeight;

    // Calculate crop area to maintain aspect ratio
    if (sourceAspectRatio > targetAspectRatio) {
      // Source is wider, crop horizontally
      sourceWidth = img.naturalHeight * targetAspectRatio;
      sourceX = (img.naturalWidth - sourceWidth) / 2;
    } else if (sourceAspectRatio < targetAspectRatio) {
      // Source is taller, crop vertically
      sourceHeight = img.naturalWidth / targetAspectRatio;
      sourceY = (img.naturalHeight - sourceHeight) / 2;
    }

    // Set canvas size
    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;

    // Enable high-quality scaling
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';

    // Clear and draw cropped image
    this.context.clearRect(0, 0, targetWidth, targetHeight);
    this.context.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, targetWidth, targetHeight
    );

    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.9);

    return {
      dataUrl,
      width: targetWidth,
      height: targetHeight,
      format: 'jpeg',
      size: this.estimateDataUrlSize(dataUrl),
      compressionRatio: this.calculateCompressionRatio(img, dataUrl),
      optimizations: ['smart-crop']
    };
  }

  /**
   * Enhance image for better PDF rendering
   */
  async enhanceForPDF(img: HTMLImageElement): Promise<OptimizedImage> {
    await this.ensureImageLoaded(img);

    // Set canvas size
    this.canvas.width = img.naturalWidth;
    this.canvas.height = img.naturalHeight;

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply PDF-specific enhancements
    this.context.imageSmoothingEnabled = false; // Preserve sharp edges
    this.context.drawImage(img, 0, 0);

    // Apply sharpening filter (simplified)
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const enhanced = this.applySharpeningFilter(imageData);
    this.context.putImageData(enhanced, 0, 0);

    const dataUrl = this.canvas.toDataURL('image/jpeg', 0.95);

    return {
      dataUrl,
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: 'jpeg',
      size: this.estimateDataUrlSize(dataUrl),
      compressionRatio: this.calculateCompressionRatio(img, dataUrl),
      optimizations: ['pdf-enhancement', 'sharpening']
    };
  }

  // Private helper methods

  private async ensureImageLoaded(img: HTMLImageElement): Promise<void> {
    if (img.complete && img.naturalWidth > 0) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load failed'));
      };

      // Trigger load if not already loading
      if (!img.src) {
        reject(new Error('Image has no source'));
      }
    });
  }

  private getImageInfo(img: HTMLImageElement): ImageInfo {
    return {
      src: img.src,
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: this.detectImageFormat(img.src),
      size: 0, // Would need to fetch to get actual size
      quality: 1.0,
      dpi: 96 // Default screen DPI
    };
  }

  private detectImageFormat(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'jpeg';
      case 'png':
        return 'png';
      case 'webp':
        return 'webp';
      case 'gif':
        return 'gif';
      default:
        return 'unknown';
    }
  }

  private calculateOptimalDimensions(
    imageInfo: ImageInfo, 
    options: ImageProcessingOptions
  ): { width: number; height: number } {
    let { width, height } = imageInfo;

    // Apply maximum dimensions if specified
    if (options.maxWidth && width > options.maxWidth) {
      height = (height * options.maxWidth) / width;
      width = options.maxWidth;
    }

    if (options.maxHeight && height > options.maxHeight) {
      width = (width * options.maxHeight) / height;
      height = options.maxHeight;
    }

    // Ensure dimensions are integers
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  private async processImage(
    img: HTMLImageElement,
    dimensions: { width: number; height: number },
    options: ImageProcessingOptions
  ): Promise<OptimizedImage> {
    // Set canvas size
    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    // Configure rendering quality
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';

    // Clear and draw image
    this.context.clearRect(0, 0, dimensions.width, dimensions.height);
    this.context.drawImage(img, 0, 0, dimensions.width, dimensions.height);

    // Determine output format and quality
    const format = options.format || 'jpeg';
    const quality = options.quality || 0.9;

    // Generate data URL
    const mimeType = `image/${format}`;
    const dataUrl = this.canvas.toDataURL(mimeType, quality);

    const optimizations: string[] = [];
    
    if (dimensions.width !== img.naturalWidth || dimensions.height !== img.naturalHeight) {
      optimizations.push('resized');
    }
    
    if (format !== this.detectImageFormat(img.src)) {
      optimizations.push(`format-${format}`);
    }
    
    if (quality < 1.0) {
      optimizations.push(`quality-${Math.round(quality * 100)}`);
    }

    return {
      dataUrl,
      width: dimensions.width,
      height: dimensions.height,
      format,
      size: this.estimateDataUrlSize(dataUrl),
      compressionRatio: this.calculateCompressionRatio(img, dataUrl),
      optimizations
    };
  }

  private async createFallbackImage(img: HTMLImageElement): Promise<OptimizedImage> {
    // Create a simple fallback - just convert to JPEG with medium quality
    try {
      await this.ensureImageLoaded(img);
      
      this.canvas.width = img.naturalWidth;
      this.canvas.height = img.naturalHeight;
      
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.drawImage(img, 0, 0);
      
      const dataUrl = this.canvas.toDataURL('image/jpeg', 0.8);
      
      return {
        dataUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: 'jpeg',
        size: this.estimateDataUrlSize(dataUrl),
        compressionRatio: 1.0,
        optimizations: ['fallback']
      };
    } catch {
      // Ultimate fallback - return a placeholder
      return {
        dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A',
        width: 1,
        height: 1,
        format: 'jpeg',
        size: 100,
        compressionRatio: 1.0,
        optimizations: ['placeholder']
      };
    }
  }

  private generateCacheKey(src: string, options: ImageProcessingOptions): string {
    return `${src}-${JSON.stringify(options)}`;
  }

  private estimateDataUrlSize(dataUrl: string): number {
    // Estimate size based on data URL length
    // Base64 encoding adds ~33% overhead
    const base64Data = dataUrl.split(',')[1];
    return Math.round(base64Data.length * 0.75);
  }

  private calculateCompressionRatio(img: HTMLImageElement, dataUrl: string): number {
    // Estimate original size (rough approximation)
    const originalSize = img.naturalWidth * img.naturalHeight * 3; // RGB
    const compressedSize = this.estimateDataUrlSize(dataUrl);
    
    return originalSize > 0 ? compressedSize / originalSize : 1.0;
  }

  private applySharpeningFilter(imageData: ImageData): ImageData {
    // Simple sharpening kernel
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) { // RGB channels only
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * kernel[kernelIdx];
            }
          }
          const outputIdx = (y * width + x) * 4 + c;
          output[outputIdx] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    return new ImageData(output, width, height);
  }
}