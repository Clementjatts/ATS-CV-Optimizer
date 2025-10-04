// Advanced Font Management for PDF Generation
// Handles font detection, loading, embedding, and fallback management

import jsPDF from 'jspdf';
import { FontConfiguration } from '../types/pdf';
import { FONT_CONFIGS } from '../constants/pdf-constants';
import { PDFGenerationError } from '../utils/errors';

export interface FontInfo {
  family: string;
  variant: string;
  weight: string;
  style: string;
  loaded: boolean;
  embedded: boolean;
  fallbackUsed?: string;
}

export interface FontLoadResult {
  success: boolean;
  loadedFonts: FontInfo[];
  failedFonts: string[];
  fallbacksUsed: string[];
}

export class PDFFontManager {
  private loadedFonts: Map<string, FontInfo> = new Map();
  private fontCache: Map<string, ArrayBuffer> = new Map();
  private fallbackChain: Map<string, string[]> = new Map();

  constructor() {
    this.initializeFallbackChains();
  }

  /**
   * Detect and analyze fonts used in an HTML element
   */
  async detectFontsInElement(element: HTMLElement): Promise<FontInfo[]> {
    const detectedFonts: FontInfo[] = [];
    const fontSet = new Set<string>();

    // Walk through all elements and collect font information
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const el = node as HTMLElement;
      const computedStyle = window.getComputedStyle(el);
      
      const fontFamily = computedStyle.fontFamily;
      const fontWeight = computedStyle.fontWeight;
      const fontStyle = computedStyle.fontStyle;
      
      if (fontFamily && !fontSet.has(fontFamily)) {
        fontSet.add(fontFamily);
        
        const fontInfo = await this.analyzeFontFamily(fontFamily, fontWeight, fontStyle);
        detectedFonts.push(fontInfo);
      }
    }

    return detectedFonts;
  }

  /**
   * Load and prepare fonts for PDF embedding
   */
  async loadFontsForPDF(fonts: FontInfo[]): Promise<FontLoadResult> {
    const loadedFonts: FontInfo[] = [];
    const failedFonts: string[] = [];
    const fallbacksUsed: string[] = [];

    for (const font of fonts) {
      try {
        const loadResult = await this.loadFont(font);
        
        if (loadResult.success) {
          loadedFonts.push(loadResult.fontInfo);
          this.loadedFonts.set(font.family, loadResult.fontInfo);
        } else {
          failedFonts.push(font.family);
          
          // Try fallback fonts
          const fallback = await this.loadFallbackFont(font);
          if (fallback) {
            loadedFonts.push(fallback);
            fallbacksUsed.push(fallback.family);
            this.loadedFonts.set(font.family, fallback);
          }
        }
      } catch (error) {
        console.warn(`Failed to load font ${font.family}:`, error);
        failedFonts.push(font.family);
      }
    }

    return {
      success: loadedFonts.length > 0,
      loadedFonts,
      failedFonts,
      fallbacksUsed
    };
  }

  /**
   * Embed fonts into jsPDF document
   */
  async embedFontsInPDF(pdf: jsPDF, fonts: FontInfo[]): Promise<void> {
    for (const font of fonts) {
      if (font.loaded && !font.embedded) {
        try {
          await this.embedFontInPDF(pdf, font);
          font.embedded = true;
        } catch (error) {
          console.warn(`Failed to embed font ${font.family}:`, error);
          
          // Use system fallback
          this.applySystemFallback(pdf, font);
        }
      }
    }
  }

  /**
   * Get optimal font for PDF rendering
   */
  getOptimalFont(requestedFont: string): FontInfo | null {
    // Check if we have the exact font loaded
    if (this.loadedFonts.has(requestedFont)) {
      return this.loadedFonts.get(requestedFont)!;
    }

    // Check fallback chain
    const fallbacks = this.fallbackChain.get(requestedFont);
    if (fallbacks) {
      for (const fallback of fallbacks) {
        if (this.loadedFonts.has(fallback)) {
          return this.loadedFonts.get(fallback)!;
        }
      }
    }

    // Return default font
    return this.loadedFonts.get('Arial') || null;
  }

  /**
   * Optimize font subset for PDF embedding
   */
  async optimizeFontSubset(font: FontInfo, usedCharacters: Set<string>): Promise<ArrayBuffer | null> {
    try {
      // Get font data
      const fontData = this.fontCache.get(font.family);
      if (!fontData) {
        return null;
      }

      // For now, return the full font
      // In a production implementation, this would create a subset
      // containing only the used characters
      return fontData;
    } catch (error) {
      console.warn(`Failed to optimize font subset for ${font.family}:`, error);
      return null;
    }
  }

  /**
   * Validate font compatibility with PDF/A standards
   */
  validateFontCompatibility(font: FontInfo): boolean {
    // Check if font is embeddable and PDF/A compatible
    const compatibleFonts = [
      'Arial', 'Helvetica', 'Times', 'Times New Roman', 'Courier', 'Courier New',
      'Calibri', 'Verdana', 'Georgia', 'Trebuchet MS'
    ];

    return compatibleFonts.some(compatible => 
      font.family.toLowerCase().includes(compatible.toLowerCase())
    );
  }

  /**
   * Get font metrics for layout calculations
   */
  getFontMetrics(font: FontInfo, fontSize: number): FontMetrics {
    // Approximate font metrics based on common font characteristics
    const baseMetrics = this.getBaseFontMetrics(font.family);
    
    return {
      ascent: baseMetrics.ascent * fontSize,
      descent: baseMetrics.descent * fontSize,
      lineHeight: baseMetrics.lineHeight * fontSize,
      xHeight: baseMetrics.xHeight * fontSize,
      capHeight: baseMetrics.capHeight * fontSize,
      averageWidth: baseMetrics.averageWidth * fontSize
    };
  }

  // Private methods

  private async analyzeFontFamily(
    fontFamily: string, 
    fontWeight: string, 
    fontStyle: string
  ): Promise<FontInfo> {
    // Parse font family (remove quotes and get first font)
    const cleanFamily = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    
    // Check if font is available
    const isLoaded = await this.checkFontAvailability(cleanFamily);
    
    return {
      family: cleanFamily,
      variant: this.getFontVariant(fontWeight, fontStyle),
      weight: fontWeight,
      style: fontStyle,
      loaded: isLoaded,
      embedded: false
    };
  }

  private async checkFontAvailability(fontFamily: string): Promise<boolean> {
    if (!document.fonts) {
      return this.checkFontAvailabilityFallback(fontFamily);
    }

    try {
      // Use Font Loading API if available
      const font = new FontFace(fontFamily, 'url()');
      await font.load();
      return true;
    } catch {
      // Check if font is already loaded
      return document.fonts.check(`12px "${fontFamily}"`);
    }
  }

  private checkFontAvailabilityFallback(fontFamily: string): boolean {
    // Fallback method using canvas text measurement
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return false;

    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    
    // Measure with fallback font
    context.font = `${testSize} monospace`;
    const fallbackWidth = context.measureText(testString).width;
    
    // Measure with requested font
    context.font = `${testSize} "${fontFamily}", monospace`;
    const testWidth = context.measureText(testString).width;
    
    // If widths differ, the font is likely available
    return Math.abs(testWidth - fallbackWidth) > 1;
  }

  private async loadFont(font: FontInfo): Promise<{ success: boolean; fontInfo: FontInfo }> {
    try {
      if (document.fonts && document.fonts.load) {
        // Use Font Loading API
        const fontFace = `${font.weight} ${font.style} 12px "${font.family}"`;
        await document.fonts.load(fontFace);
        
        font.loaded = true;
        return { success: true, fontInfo: font };
      } else {
        // Fallback: assume font is available if it passes basic check
        font.loaded = await this.checkFontAvailability(font.family);
        return { success: font.loaded, fontInfo: font };
      }
    } catch (error) {
      return { success: false, fontInfo: font };
    }
  }

  private async loadFallbackFont(originalFont: FontInfo): Promise<FontInfo | null> {
    const fallbacks = this.fallbackChain.get(originalFont.family) || 
                     FONT_CONFIGS.primary.fallbacks;

    for (const fallbackFamily of fallbacks) {
      const fallbackFont: FontInfo = {
        family: fallbackFamily,
        variant: originalFont.variant,
        weight: originalFont.weight,
        style: originalFont.style,
        loaded: false,
        embedded: false,
        fallbackUsed: originalFont.family
      };

      const result = await this.loadFont(fallbackFont);
      if (result.success) {
        return result.fontInfo;
      }
    }

    return null;
  }

  private async embedFontInPDF(pdf: jsPDF, font: FontInfo): Promise<void> {
    try {
      // For standard fonts, jsPDF handles them automatically
      const standardFonts = ['helvetica', 'times', 'courier'];
      const normalizedFamily = font.family.toLowerCase();
      
      if (standardFonts.some(std => normalizedFamily.includes(std))) {
        // Set the font in jsPDF
        const pdfFontName = this.mapToPDFFontName(font.family);
        const pdfStyle = this.mapToPDFStyle(font.weight, font.style);
        
        pdf.setFont(pdfFontName, pdfStyle);
        return;
      }

      // For custom fonts, we would need to load and embed the font file
      // This is a simplified implementation
      console.warn(`Custom font embedding not fully implemented for: ${font.family}`);
      
      // Use fallback
      this.applySystemFallback(pdf, font);
    } catch (error) {
      throw new PDFGenerationError(
        `Failed to embed font ${font.family}: ${error.message}`,
        'generation',
        true
      );
    }
  }

  private applySystemFallback(pdf: jsPDF, font: FontInfo): void {
    // Map to closest standard PDF font
    let pdfFont = 'helvetica';
    const family = font.family.toLowerCase();
    
    if (family.includes('times') || family.includes('serif')) {
      pdfFont = 'times';
    } else if (family.includes('courier') || family.includes('mono')) {
      pdfFont = 'courier';
    }
    
    const pdfStyle = this.mapToPDFStyle(font.weight, font.style);
    pdf.setFont(pdfFont, pdfStyle);
  }

  private mapToPDFFontName(fontFamily: string): string {
    const family = fontFamily.toLowerCase();
    
    if (family.includes('times')) return 'times';
    if (family.includes('courier')) return 'courier';
    if (family.includes('helvetica') || family.includes('arial')) return 'helvetica';
    
    return 'helvetica'; // Default fallback
  }

  private mapToPDFStyle(weight: string, style: string): string {
    const isBold = weight === 'bold' || parseInt(weight) >= 600;
    const isItalic = style === 'italic' || style === 'oblique';
    
    if (isBold && isItalic) return 'bolditalic';
    if (isBold) return 'bold';
    if (isItalic) return 'italic';
    
    return 'normal';
  }

  private getFontVariant(weight: string, style: string): string {
    const isBold = weight === 'bold' || parseInt(weight) >= 600;
    const isItalic = style === 'italic' || style === 'oblique';
    
    if (isBold && isItalic) return 'bold-italic';
    if (isBold) return 'bold';
    if (isItalic) return 'italic';
    
    return 'regular';
  }

  private initializeFallbackChains(): void {
    // Initialize common font fallback chains
    this.fallbackChain.set('Calibri', ['Arial', 'Helvetica', 'sans-serif']);
    this.fallbackChain.set('Arial', ['Helvetica', 'sans-serif']);
    this.fallbackChain.set('Helvetica', ['Arial', 'sans-serif']);
    this.fallbackChain.set('Times New Roman', ['Times', 'serif']);
    this.fallbackChain.set('Times', ['Times New Roman', 'serif']);
    this.fallbackChain.set('Courier New', ['Courier', 'monospace']);
    this.fallbackChain.set('Courier', ['Courier New', 'monospace']);
    this.fallbackChain.set('Verdana', ['Arial', 'Helvetica', 'sans-serif']);
    this.fallbackChain.set('Georgia', ['Times New Roman', 'Times', 'serif']);
    this.fallbackChain.set('Trebuchet MS', ['Arial', 'Helvetica', 'sans-serif']);
  }

  private getBaseFontMetrics(fontFamily: string): BaseFontMetrics {
    // Approximate metrics for common fonts
    const metrics: Record<string, BaseFontMetrics> = {
      'Arial': {
        ascent: 0.905,
        descent: 0.212,
        lineHeight: 1.14,
        xHeight: 0.518,
        capHeight: 0.716,
        averageWidth: 0.5
      },
      'Helvetica': {
        ascent: 0.932,
        descent: 0.213,
        lineHeight: 1.14,
        xHeight: 0.523,
        capHeight: 0.718,
        averageWidth: 0.5
      },
      'Times New Roman': {
        ascent: 0.891,
        descent: 0.216,
        lineHeight: 1.14,
        xHeight: 0.448,
        capHeight: 0.662,
        averageWidth: 0.45
      },
      'Courier New': {
        ascent: 0.829,
        descent: 0.171,
        lineHeight: 1.14,
        xHeight: 0.423,
        capHeight: 0.571,
        averageWidth: 0.6
      }
    };

    return metrics[fontFamily] || metrics['Arial'];
  }
}

// Type definitions
interface FontMetrics {
  ascent: number;
  descent: number;
  lineHeight: number;
  xHeight: number;
  capHeight: number;
  averageWidth: number;
}

interface BaseFontMetrics {
  ascent: number;
  descent: number;
  lineHeight: number;
  xHeight: number;
  capHeight: number;
  averageWidth: number;
}