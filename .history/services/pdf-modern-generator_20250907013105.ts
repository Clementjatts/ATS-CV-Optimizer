// Modern PDF Generator - Primary Strategy Implementation
// Uses jsPDF + html2canvas for high-quality PDF generation

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  PDFOptions,
  PDFResult,
  GenerationMetadata,
  QualityMetrics,
  BrowserCapabilities,
  PDFConfiguration
} from '../types/pdf';
import {
  PAGE_FORMATS,
  DPI_SETTINGS,
  DEFAULT_MARGINS,
  QUALITY_THRESHOLDS,
  FONT_CONFIGS
} from '../constants/pdf-constants';
import { PDFGenerationError } from '../utils/errors';
import { PDFFontManager, FontInfo } from './pdf-font-manager';

export class ModernPDFGenerator {
  private config: PDFConfiguration;
  private startTime: number = 0;
  private fontManager: PDFFontManager;

  constructor(config?: Partial<PDFConfiguration>) {
    this.config = this.createDefaultConfig(config);
    this.fontManager = new PDFFontManager();
  }

  /**
   * Generate PDF from HTML element using modern strategy
   */
  async generatePDF(element: HTMLElement, options: PDFOptions): Promise<PDFResult> {
    this.startTime = Date.now();
    
    try {
      // Validate browser capabilities
      const capabilities = this.validateBrowserSupport();
      if (!capabilities.supportsCanvas) {
        throw new PDFGenerationError(
          'Browser does not support canvas rendering',
          'browser',
          false
        );
      }

      // Detect and load fonts
      const detectedFonts = await this.fontManager.detectFontsInElement(element);
      const fontLoadResult = await this.fontManager.loadFontsForPDF(detectedFonts);
      
      // Prepare element for PDF generation
      const preparedElement = await this.prepareElementForPDF(element);
      
      // Capture element as high-resolution canvas
      const canvas = await this.captureElementAsCanvas(preparedElement, options);
      
      // Extract text content for ATS compatibility
      const textContent = this.extractTextContent(element);
      
      // Create PDF document
      const pdf = this.createPDFDocument(options);
      
      // Add canvas image to PDF
      await this.addCanvasImageToPDF(pdf, canvas, options);
      
      // Add invisible text layer for ATS compatibility
      this.addTextLayerToPDF(pdf, textContent, options);
      
      // Add vector graphics for borders and shapes
      this.addVectorGraphics(pdf, element, options);
      
      // Generate final PDF blob
      const blob = this.generatePDFBlob(pdf);
      
      // Calculate quality metrics
      const quality = await this.calculateQualityMetrics(blob, textContent);
      
      // Create generation metadata
      const metadata = this.createGenerationMetadata(blob, quality);
      
      return {
        success: true,
        blob,
        metadata
      };
      
    } catch (error) {
      return this.handleGenerationError(error);
    }
  }

  /**
   * Validate browser support for modern PDF generation
   */
  validateBrowserSupport(): BrowserCapabilities {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    return {
      supportsCanvas: !!context,
      supportsWebGL: !!canvas.getContext('webgl'),
      supportsWorkers: typeof Worker !== 'undefined',
      supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
      maxCanvasSize: this.getMaxCanvasSize(),
      memoryLimit: this.estimateMemoryLimit()
    };
  }

  /**
   * Prepare HTML element for optimal PDF generation
   */
  private async prepareElementForPDF(element: HTMLElement): Promise<HTMLElement> {
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Apply PDF-specific styling
    this.applyPDFStyling(clonedElement);
    
    // Optimize fonts for PDF rendering
    await this.optimizeFontsForPDF(clonedElement);
    
    // Ensure all images are loaded
    await this.ensureImagesLoaded(clonedElement);
    
    return clonedElement;
  }

  /**
   * Capture HTML element as high-resolution canvas
   */
  private async captureElementAsCanvas(
    element: HTMLElement, 
    options: PDFOptions
  ): Promise<HTMLCanvasElement> {
    const dpi = DPI_SETTINGS[options.quality];
    const scale = dpi / 96; // 96 DPI is standard screen resolution
    
    const canvasOptions = {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    };

    try {
      const canvas = await html2canvas(element, canvasOptions);
      
      // Validate canvas size
      if (canvas.width === 0 || canvas.height === 0) {
        throw new PDFGenerationError(
          'Generated canvas has invalid dimensions',
          'generation',
          true
        );
      }
      
      return canvas;
    } catch (error) {
      throw new PDFGenerationError(
        `Canvas generation failed: ${error.message}`,
        'generation',
        true
      );
    }
  }

  /**
   * Extract text content from element for ATS compatibility
   */
  private extractTextContent(element: HTMLElement): TextContentMap {
    const textMap: TextContentMap = new Map();
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const textNode = node as Text;
      const text = textNode.textContent?.trim();
      
      if (text && text.length > 0) {
        const rect = this.getTextNodeBoundingRect(textNode);
        if (rect) {
          textMap.set(text, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            fontSize: this.getComputedFontSize(textNode.parentElement),
            fontFamily: this.getComputedFontFamily(textNode.parentElement)
          });
        }
      }
    }

    return textMap;
  }

  /**
   * Create PDF document with proper configuration
   */
  private createPDFDocument(options: PDFOptions): jsPDF {
    const format = PAGE_FORMATS[options.format];
    const orientation = format.width > format.height ? 'landscape' : 'portrait';
    
    const pdf = new jsPDF({
      orientation,
      unit: 'in',
      format: [format.width, format.height],
      compress: true
    });

    // Set document metadata
    pdf.setProperties({
      title: options.metadata.title,
      subject: options.metadata.subject || 'Professional CV',
      author: options.metadata.author,
      keywords: options.metadata.keywords?.join(', ') || '',
      creator: options.metadata.creator,
      producer: options.metadata.producer
    });

    return pdf;
  }

  /**
   * Add canvas image to PDF document
   */
  private async addCanvasImageToPDF(
    pdf: jsPDF, 
    canvas: HTMLCanvasElement, 
    options: PDFOptions
  ): Promise<void> {
    const format = PAGE_FORMATS[options.format];
    const margins = options.margins;
    
    // Calculate image dimensions to fit within margins
    const availableWidth = format.width - margins.left - margins.right;
    const availableHeight = format.height - margins.top - margins.bottom;
    
    const canvasAspectRatio = canvas.width / canvas.height;
    const availableAspectRatio = availableWidth / availableHeight;
    
    let imageWidth, imageHeight;
    
    if (canvasAspectRatio > availableAspectRatio) {
      // Canvas is wider, fit to width
      imageWidth = availableWidth;
      imageHeight = availableWidth / canvasAspectRatio;
    } else {
      // Canvas is taller, fit to height
      imageHeight = availableHeight;
      imageWidth = availableHeight * canvasAspectRatio;
    }
    
    // Convert canvas to image data
    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Add image to PDF
    pdf.addImage(
      imageData,
      'JPEG',
      margins.left,
      margins.top,
      imageWidth,
      imageHeight,
      undefined,
      'FAST'
    );
  }

  /**
   * Add invisible text layer for ATS compatibility
   */
  private addTextLayerToPDF(
    pdf: jsPDF, 
    textContent: TextContentMap, 
    options: PDFOptions
  ): void {
    const format = PAGE_FORMATS[options.format];
    const margins = options.margins;
    
    // Set text rendering mode to invisible (mode 3)
    pdf.internal.write('3 Tr');
    
    textContent.forEach((position, text) => {
      // Convert pixel coordinates to PDF coordinates
      const pdfX = margins.left + (position.x / 96); // Convert pixels to inches
      const pdfY = margins.top + (position.y / 96);
      
      // Set font size (convert from pixels to points)
      const fontSize = position.fontSize * 0.75; // Convert pixels to points
      pdf.setFontSize(fontSize);
      
      // Add invisible text at the correct position
      pdf.text(text, pdfX, pdfY);
    });
    
    // Reset text rendering mode to normal (mode 0)
    pdf.internal.write('0 Tr');
  }

  /**
   * Add vector graphics for borders and simple shapes
   */
  private addVectorGraphics(
    pdf: jsPDF, 
    element: HTMLElement, 
    options: PDFOptions
  ): void {
    // Find elements with borders, lines, or simple shapes
    const elementsWithBorders = element.querySelectorAll('*');
    
    elementsWithBorders.forEach((el) => {
      const computedStyle = window.getComputedStyle(el as Element);
      const borderWidth = parseFloat(computedStyle.borderWidth);
      
      if (borderWidth > 0) {
        this.addBorderToPDF(pdf, el as HTMLElement, computedStyle, options);
      }
    });
  }

  /**
   * Add border as vector graphics to PDF
   */
  private addBorderToPDF(
    pdf: jsPDF,
    element: HTMLElement,
    style: CSSStyleDeclaration,
    options: PDFOptions
  ): void {
    const rect = element.getBoundingClientRect();
    const margins = options.margins;
    
    // Convert to PDF coordinates
    const x = margins.left + (rect.left / 96);
    const y = margins.top + (rect.top / 96);
    const width = rect.width / 96;
    const height = rect.height / 96;
    
    // Set border properties
    const borderWidth = parseFloat(style.borderWidth) / 96;
    const borderColor = this.parseCSSColor(style.borderColor);
    
    pdf.setLineWidth(borderWidth);
    pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
    
    // Draw rectangle border
    pdf.rect(x, y, width, height);
  }

  /**
   * Generate PDF blob from jsPDF document
   */
  private generatePDFBlob(pdf: jsPDF): Blob {
    const pdfData = pdf.output('arraybuffer');
    return new Blob([pdfData], { type: 'application/pdf' });
  }

  /**
   * Calculate quality metrics for generated PDF
   */
  private async calculateQualityMetrics(
    blob: Blob, 
    textContent: TextContentMap
  ): Promise<QualityMetrics> {
    // For now, return estimated metrics
    // In a full implementation, this would analyze the actual PDF
    return {
      textExtractability: textContent.size > 0 ? 0.95 : 0.5,
      layoutFidelity: 0.90,
      atsCompatibility: true,
      pdfCompliance: ['PDF/A-1b']
    };
  }

  /**
   * Create generation metadata
   */
  private createGenerationMetadata(
    blob: Blob, 
    quality: QualityMetrics
  ): GenerationMetadata {
    return {
      strategy: 'modern',
      duration: Date.now() - this.startTime,
      fileSize: blob.size,
      pageCount: 1, // For now, assuming single page
      warnings: []
    };
  }

  /**
   * Handle generation errors
   */
  private handleGenerationError(error: any): PDFResult {
    const duration = Date.now() - this.startTime;
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      metadata: {
        strategy: 'modern',
        duration,
        fileSize: 0,
        pageCount: 0,
        warnings: [error.message]
      }
    };
  }

  // Helper methods
  private createDefaultConfig(config?: Partial<PDFConfiguration>): PDFConfiguration {
    return {
      format: 'letter',
      orientation: 'portrait',
      margins: DEFAULT_MARGINS,
      resolution: DPI_SETTINGS.high,
      compression: {
        text: true,
        images: true,
        level: 'medium'
      },
      imageQuality: 0.95,
      fonts: [
        {
          family: FONT_CONFIGS.primary.family,
          variants: ['normal', 'bold'],
          fallbacks: FONT_CONFIGS.primary.fallbacks,
          embedSubset: true
        }
      ],
      colors: {
        mode: 'rgb'
      },
      metadata: {
        title: 'Professional CV',
        author: 'CV Owner',
        creator: 'ATS CV Optimizer',
        producer: 'Modern PDF Generator'
      },
      strategy: 'modern',
      timeout: 30000,
      retryAttempts: 2,
      ...config
    };
  }

  private getMaxCanvasSize(): number {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    
    // Test maximum canvas size
    let size = 32767;
    while (size > 1024) {
      canvas.width = size;
      canvas.height = size;
      ctx.fillRect(0, 0, 1, 1);
      if (ctx.getImageData(0, 0, 1, 1).data[3] === 255) {
        return size;
      }
      size = Math.floor(size / 2);
    }
    return 1024;
  }

  private estimateMemoryLimit(): number {
    // Estimate available memory (simplified)
    return 100 * 1024 * 1024; // 100MB default
  }

  private applyPDFStyling(element: HTMLElement): void {
    // Apply PDF-specific styles
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#000000';
    
    // Ensure proper font rendering
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.webkitFontSmoothing = 'antialiased';
      htmlEl.style.mozOsxFontSmoothing = 'grayscale';
    });
  }

  private async optimizeFontsForPDF(element: HTMLElement): Promise<void> {
    // Ensure fonts are loaded and ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  }

  private async ensureImagesLoaded(element: HTMLElement): Promise<void> {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails
        }
      });
    });
    
    await Promise.all(imagePromises);
  }

  private getTextNodeBoundingRect(textNode: Text): DOMRect | null {
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const rect = range.getBoundingClientRect();
    range.detach();
    
    return rect.width > 0 && rect.height > 0 ? rect : null;
  }

  private getComputedFontSize(element: Element | null): number {
    if (!element) return 12;
    const style = window.getComputedStyle(element);
    return parseFloat(style.fontSize) || 12;
  }

  private getComputedFontFamily(element: Element | null): string {
    if (!element) return 'Arial';
    const style = window.getComputedStyle(element);
    return style.fontFamily || 'Arial';
  }

  private parseCSSColor(color: string): { r: number; g: number; b: number } {
    // Simple RGB color parser
    const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgb) {
      return {
        r: parseInt(rgb[1]),
        g: parseInt(rgb[2]),
        b: parseInt(rgb[3])
      };
    }
    
    // Default to black
    return { r: 0, g: 0, b: 0 };
  }
}

// Type definitions for text content mapping
type TextContentMap = Map<string, TextPosition>;

interface TextPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
}