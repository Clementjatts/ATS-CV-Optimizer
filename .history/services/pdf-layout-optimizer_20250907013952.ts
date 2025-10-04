// PDF Layout Optimizer - Layout adjustment functions for PDF constraints

import { PDFConfiguration, PageFormat } from '../types/pdf';
import { ProcessedDocument } from './pdf-document-processor';

/**
 * Layout optimization result
 */
export interface LayoutOptimizationResult {
  optimizedElement: HTMLElement;
  adjustments: LayoutAdjustment[];
  metrics: LayoutMetrics;
  warnings: string[];
}

/**
 * Individual layout adjustment
 */
export interface LayoutAdjustment {
  type: 'margin' | 'spacing' | 'font' | 'responsive' | 'print';
  element: HTMLElement;
  property: string;
  originalValue: string;
  newValue: string;
  reason: string;
}

/**
 * Layout metrics for optimization tracking
 */
export interface LayoutMetrics {
  originalDimensions: { width: number; height: number };
  optimizedDimensions: { width: number; height: number };
  scaleFactor: number;
  adjustmentCount: number;
  optimizationTime: number;
}

/**
 * Margin optimization configuration
 */
export interface MarginOptimization {
  preserveRatios: boolean;
  minMargin: number;
  maxMargin: number;
  autoAdjust: boolean;
}

/**
 * Spacing optimization configuration
 */
export interface SpacingOptimization {
  compactMode: boolean;
  preserveHierarchy: boolean;
  minLineHeight: number;
  maxLineHeight: number;
}

/**
 * Responsive layout handling configuration
 */
export interface ResponsiveHandling {
  breakpoints: { [key: string]: number };
  targetWidth: number;
  preserveAspectRatio: boolean;
  handleGridLayouts: boolean;
  handleFlexLayouts: boolean;
}

/**
 * Print-specific styling configuration
 */
export interface PrintStyling {
  colorMode: 'color' | 'grayscale' | 'blackwhite';
  backgroundHandling: 'preserve' | 'remove' | 'convert';
  fontOptimization: boolean;
  imageOptimization: boolean;
}

/**
 * Main layout optimizer class
 */
export class PDFLayoutOptimizer {
  private readonly pageFormats: { [key in PageFormat]: { width: number; height: number } } = {
    letter: { width: 612, height: 792 }, // 8.5" x 11" in points
    a4: { width: 595, height: 842 }      // A4 in points
  };

  /**
   * Optimize layout for PDF constraints and page sizes
   */
  optimizeLayout(
    element: HTMLElement, 
    config: PDFConfiguration,
    document?: ProcessedDocument
  ): LayoutOptimizationResult {
    const startTime = Date.now();
    const adjustments: LayoutAdjustment[] = [];
    
    // Clone element for safe optimization
    const optimizedElement = this.cloneElementForOptimization(element);
    
    // Record original dimensions
    const originalDimensions = {
      width: element.offsetWidth,
      height: element.offsetHeight
    };
    
    // Apply PDF-specific layout constraints
    this.applyPDFConstraints(optimizedElement, config, adjustments);
    
    // Optimize margins and spacing
    this.optimizeMargins(optimizedElement, config, adjustments);
    this.optimizeSpacing(optimizedElement, config, adjustments);
    
    // Handle responsive layout elements
    this.handleResponsiveLayouts(optimizedElement, config, adjustments);
    
    // Apply print-specific styling
    this.applyPrintStyling(optimizedElement, config, adjustments);
    
    // Calculate final dimensions and metrics
    const optimizedDimensions = {
      width: optimizedElement.offsetWidth,
      height: optimizedElement.offsetHeight
    };
    
    const scaleFactor = optimizedDimensions.width / originalDimensions.width;
    
    const metrics: LayoutMetrics = {
      originalDimensions,
      optimizedDimensions,
      scaleFactor,
      adjustmentCount: adjustments.length,
      optimizationTime: Date.now() - startTime
    };
    
    // Generate warnings for potential issues
    const warnings = this.generateLayoutWarnings(optimizedElement, config, metrics);
    
    return {
      optimizedElement,
      adjustments,
      metrics,
      warnings
    };
  }

  /**
   * Optimize margins for PDF page constraints
   */
  optimizeMargins(
    element: HTMLElement, 
    config: PDFConfiguration,
    adjustments: LayoutAdjustment[]
  ): void {
    const marginConfig: MarginOptimization = {
      preserveRatios: true,
      minMargin: 0.25, // inches
      maxMargin: 1.5,  // inches
      autoAdjust: true
    };
    
    // Convert page margins to pixels (96 DPI)
    const pageMargins = {
      top: config.margins.top * 96,
      right: config.margins.right * 96,
      bottom: config.margins.bottom * 96,
      left: config.margins.left * 96
    };
    
    // Set container margins
    this.setElementMargins(element, pageMargins, adjustments);
    
    // Optimize internal element margins
    this.optimizeInternalMargins(element, marginConfig, adjustments);
  }

  /**
   * Optimize spacing for better PDF layout
   */
  optimizeSpacing(
    element: HTMLElement,
    config: PDFConfiguration,
    adjustments: LayoutAdjustment[]
  ): void {
    const spacingConfig: SpacingOptimization = {
      compactMode: false,
      preserveHierarchy: true,
      minLineHeight: 1.2,
      maxLineHeight: 1.6
    };
    
    // Optimize line heights
    this.optimizeLineHeights(element, spacingConfig, adjustments);
    
    // Optimize element spacing
    this.optimizeElementSpacing(element, spacingConfig, adjustments);
    
    // Optimize section spacing
    this.optimizeSectionSpacing(element, spacingConfig, adjustments);
  }

  /**
   * Handle responsive layout elements for fixed PDF layout
   */
  handleResponsiveLayouts(
    element: HTMLElement,
    config: PDFConfiguration,
    adjustments: LayoutAdjustment[]
  ): void {
    const pageFormat = this.pageFormats[config.format];
    const targetWidth = pageFormat.width - (config.margins.left + config.margins.right) * 72; // Convert to points
    
    const responsiveConfig: ResponsiveHandling = {
      breakpoints: {
        'sm': 640,
        'md': 768,
        'lg': 1024,
        'xl': 1280
      },
      targetWidth: targetWidth,
      preserveAspectRatio: true,
      handleGridLayouts: true,
      handleFlexLayouts: true
    };
    
    // Convert grid layouts to block layouts
    if (responsiveConfig.handleGridLayouts) {
      this.convertGridLayouts(element, responsiveConfig, adjustments);
    }
    
    // Convert flex layouts to block layouts
    if (responsiveConfig.handleFlexLayouts) {
      this.convertFlexLayouts(element, responsiveConfig, adjustments);
    }
    
    // Remove responsive classes
    this.removeResponsiveClasses(element, responsiveConfig, adjustments);
    
    // Set fixed widths
    this.setFixedWidths(element, responsiveConfig, adjustments);
  }

  /**
   * Apply print-specific styling optimizations
   */
  applyPrintStyling(
    element: HTMLElement,
    config: PDFConfiguration,
    adjustments: LayoutAdjustment[]
  ): void {
    const printConfig: PrintStyling = {
      colorMode: 'color',
      backgroundHandling: 'preserve',
      fontOptimization: true,
      imageOptimization: true
    };
    
    // Optimize fonts for print
    if (printConfig.fontOptimization) {
      this.optimizeFontsForPrint(element, adjustments);
    }
    
    // Handle background colors and images
    this.handleBackgrounds(element, printConfig, adjustments);
    
    // Optimize images for print
    if (printConfig.imageOptimization) {
      this.optimizeImagesForPrint(element, adjustments);
    }
    
    // Add print-specific CSS
    this.addPrintCSS(element, adjustments);
  }

  /**
   * Create responsive layout handling for different page sizes
   */
  createResponsiveLayout(
    element: HTMLElement,
    targetFormat: PageFormat,
    config: PDFConfiguration
  ): HTMLElement {
    const responsiveElement = element.cloneNode(true) as HTMLElement;
    const pageFormat = this.pageFormats[targetFormat];
    
    // Calculate available content area
    const contentWidth = pageFormat.width - (config.margins.left + config.margins.right) * 72;
    const contentHeight = pageFormat.height - (config.margins.top + config.margins.bottom) * 72;
    
    // Set container dimensions
    responsiveElement.style.width = `${contentWidth}pt`;
    responsiveElement.style.maxWidth = `${contentWidth}pt`;
    responsiveElement.style.minHeight = `${contentHeight}pt`;
    
    // Apply responsive adjustments
    this.applyResponsiveAdjustments(responsiveElement, contentWidth, contentHeight);
    
    return responsiveElement;
  }

  // Private helper methods

  /**
   * Clone element for safe optimization
   */
  private cloneElementForOptimization(element: HTMLElement): HTMLElement {
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Ensure clone maintains computed styles
    const computedStyle = window.getComputedStyle(element);
    clone.style.cssText = computedStyle.cssText;
    
    // Add to document temporarily for accurate measurements
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '-9999px';
    document.body.appendChild(clone);
    
    return clone;
  }

  /**
   * Apply PDF-specific layout constraints
   */
  private applyPDFConstraints(
    element: HTMLElement,
    config: PDFConfiguration,
    adjustments: LayoutAdjustment[]
  ): void {
    const pageFormat = this.pageFormats[config.format];
    
    // Set fixed page dimensions
    const contentWidth = pageFormat.width - (config.margins.left + config.margins.right) * 72;
    
    adjustments.push({
      type: 'responsive',
      element,
      property: 'width',
      originalValue: element.style.width || 'auto',
      newValue: `${contentWidth}pt`,
      reason: 'PDF page width constraint'
    });
    
    element.style.width = `${contentWidth}pt`;
    element.style.maxWidth = `${contentWidth}pt`;
    element.style.boxSizing = 'border-box';
    
    // Ensure proper positioning
    element.style.position = 'relative';
    element.style.overflow = 'visible';
  }

  /**
   * Set element margins
   */
  private setElementMargins(
    element: HTMLElement,
    margins: { top: number; right: number; bottom: number; left: number },
    adjustments: LayoutAdjustment[]
  ): void {
    const originalMargin = element.style.margin || '0';
    const newMargin = `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`;
    
    adjustments.push({
      type: 'margin',
      element,
      property: 'margin',
      originalValue: originalMargin,
      newValue: newMargin,
      reason: 'PDF page margin optimization'
    });
    
    element.style.margin = newMargin;
  }

  /**
   * Optimize internal element margins
   */
  private optimizeInternalMargins(
    element: HTMLElement,
    config: MarginOptimization,
    adjustments: LayoutAdjustment[]
  ): void {
    const allElements = element.querySelectorAll('*');
    
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Optimize margin-bottom for better spacing
      const currentMarginBottom = parseFloat(computedStyle.marginBottom) || 0;
      if (currentMarginBottom > 24) { // More than 24px
        const optimizedMargin = Math.max(currentMarginBottom * 0.75, 12);
        
        adjustments.push({
          type: 'margin',
          element: htmlEl,
          property: 'margin-bottom',
          originalValue: `${currentMarginBottom}px`,
          newValue: `${optimizedMargin}px`,
          reason: 'Margin optimization for PDF layout'
        });
        
        htmlEl.style.marginBottom = `${optimizedMargin}px`;
      }
    });
  }

  /**
   * Optimize line heights for better readability
   */
  private optimizeLineHeights(
    element: HTMLElement,
    config: SpacingOptimization,
    adjustments: LayoutAdjustment[]
  ): void {
    const textElements = element.querySelectorAll('p, div, span, li, td, th');
    
    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      const currentLineHeight = computedStyle.lineHeight;
      
      // Only adjust if line height is not already optimized
      if (currentLineHeight === 'normal' || parseFloat(currentLineHeight) < config.minLineHeight) {
        const optimizedLineHeight = config.minLineHeight;
        
        adjustments.push({
          type: 'spacing',
          element: htmlEl,
          property: 'line-height',
          originalValue: currentLineHeight,
          newValue: optimizedLineHeight.toString(),
          reason: 'Line height optimization for PDF readability'
        });
        
        htmlEl.style.lineHeight = optimizedLineHeight.toString();
      }
    });
  }

  /**
   * Optimize spacing between elements
   */
  private optimizeElementSpacing(
    element: HTMLElement,
    config: SpacingOptimization,
    adjustments: LayoutAdjustment[]
  ): void {
    const spacingElements = element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, div');
    
    spacingElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Optimize margin-top for headings
      if (htmlEl.tagName.match(/^H[1-6]$/)) {
        const currentMarginTop = parseFloat(computedStyle.marginTop) || 0;
        const optimizedMarginTop = Math.min(currentMarginTop, 18); // Max 18px for headings
        
        if (currentMarginTop !== optimizedMarginTop) {
          adjustments.push({
            type: 'spacing',
            element: htmlEl,
            property: 'margin-top',
            originalValue: `${currentMarginTop}px`,
            newValue: `${optimizedMarginTop}px`,
            reason: 'Heading spacing optimization'
          });
          
          htmlEl.style.marginTop = `${optimizedMarginTop}px`;
        }
      }
    });
  }

  /**
   * Optimize spacing between sections
   */
  private optimizeSectionSpacing(
    element: HTMLElement,
    config: SpacingOptimization,
    adjustments: LayoutAdjustment[]
  ): void {
    const sections = element.querySelectorAll('section, .section');
    
    sections.forEach(section => {
      const htmlSection = section as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlSection);
      const currentMarginBottom = parseFloat(computedStyle.marginBottom) || 0;
      
      // Standardize section spacing
      const optimizedSpacing = 24; // 24px between sections
      
      if (Math.abs(currentMarginBottom - optimizedSpacing) > 2) {
        adjustments.push({
          type: 'spacing',
          element: htmlSection,
          property: 'margin-bottom',
          originalValue: `${currentMarginBottom}px`,
          newValue: `${optimizedSpacing}px`,
          reason: 'Section spacing standardization'
        });
        
        htmlSection.style.marginBottom = `${optimizedSpacing}px`;
      }
    });
  }

  /**
   * Convert CSS Grid layouts to block layouts
   */
  private convertGridLayouts(
    element: HTMLElement,
    config: ResponsiveHandling,
    adjustments: LayoutAdjustment[]
  ): void {
    const gridElements = element.querySelectorAll('.grid, [style*="display: grid"], [style*="display:grid"]');
    
    gridElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      adjustments.push({
        type: 'responsive',
        element: htmlEl,
        property: 'display',
        originalValue: computedStyle.display,
        newValue: 'block',
        reason: 'Convert grid layout to block for PDF'
      });
      
      htmlEl.style.display = 'block';
      
      // Remove grid-specific properties
      htmlEl.style.gridTemplateColumns = '';
      htmlEl.style.gridTemplateRows = '';
      htmlEl.style.gridGap = '';
      htmlEl.style.gap = '';
    });
  }

  /**
   * Convert Flexbox layouts to block layouts
   */
  private convertFlexLayouts(
    element: HTMLElement,
    config: ResponsiveHandling,
    adjustments: LayoutAdjustment[]
  ): void {
    const flexElements = element.querySelectorAll('.flex, [style*="display: flex"], [style*="display:flex"]');
    
    flexElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Check if this is a horizontal flex layout that should be preserved
      const flexDirection = computedStyle.flexDirection;
      if (flexDirection === 'row' && htmlEl.children.length <= 3) {
        // Keep as flex for simple horizontal layouts
        return;
      }
      
      adjustments.push({
        type: 'responsive',
        element: htmlEl,
        property: 'display',
        originalValue: computedStyle.display,
        newValue: 'block',
        reason: 'Convert flex layout to block for PDF'
      });
      
      htmlEl.style.display = 'block';
      
      // Remove flex-specific properties
      htmlEl.style.flexDirection = '';
      htmlEl.style.flexWrap = '';
      htmlEl.style.justifyContent = '';
      htmlEl.style.alignItems = '';
    });
  }

  /**
   * Remove responsive CSS classes
   */
  private removeResponsiveClasses(
    element: HTMLElement,
    config: ResponsiveHandling,
    adjustments: LayoutAdjustment[]
  ): void {
    const allElements = element.querySelectorAll('*');
    
    allElements.forEach(el => {
      const classList = Array.from(el.classList);
      const responsiveClasses = classList.filter(cls => 
        Object.keys(config.breakpoints).some(bp => cls.startsWith(`${bp}:`))
      );
      
      if (responsiveClasses.length > 0) {
        adjustments.push({
          type: 'responsive',
          element: el as HTMLElement,
          property: 'class',
          originalValue: el.className,
          newValue: classList.filter(cls => !responsiveClasses.includes(cls)).join(' '),
          reason: 'Remove responsive classes for PDF'
        });
        
        responsiveClasses.forEach(cls => el.classList.remove(cls));
      }
    });
  }

  /**
   * Set fixed widths for consistent layout
   */
  private setFixedWidths(
    element: HTMLElement,
    config: ResponsiveHandling,
    adjustments: LayoutAdjustment[]
  ): void {
    const containerElements = element.querySelectorAll('div, section, article, main');
    
    containerElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Set max-width to prevent overflow
      if (!htmlEl.style.maxWidth && computedStyle.width === 'auto') {
        adjustments.push({
          type: 'responsive',
          element: htmlEl,
          property: 'max-width',
          originalValue: computedStyle.maxWidth,
          newValue: '100%',
          reason: 'Set max-width for PDF layout'
        });
        
        htmlEl.style.maxWidth = '100%';
      }
    });
  }

  /**
   * Optimize fonts for print quality
   */
  private optimizeFontsForPrint(
    element: HTMLElement,
    adjustments: LayoutAdjustment[]
  ): void {
    const textElements = element.querySelectorAll('*');
    
    textElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Ensure minimum font size for readability
      const fontSize = parseFloat(computedStyle.fontSize);
      if (fontSize < 10) {
        adjustments.push({
          type: 'font',
          element: htmlEl,
          property: 'font-size',
          originalValue: computedStyle.fontSize,
          newValue: '10pt',
          reason: 'Minimum font size for print readability'
        });
        
        htmlEl.style.fontSize = '10pt';
      }
      
      // Use print-safe fonts
      const fontFamily = computedStyle.fontFamily;
      if (fontFamily.includes('system-ui') || fontFamily.includes('-apple-system')) {
        adjustments.push({
          type: 'font',
          element: htmlEl,
          property: 'font-family',
          originalValue: fontFamily,
          newValue: 'Arial, sans-serif',
          reason: 'Use print-safe font family'
        });
        
        htmlEl.style.fontFamily = 'Arial, sans-serif';
      }
    });
  }

  /**
   * Handle background colors and images for print
   */
  private handleBackgrounds(
    element: HTMLElement,
    config: PrintStyling,
    adjustments: LayoutAdjustment[]
  ): void {
    const elementsWithBackground = element.querySelectorAll('*');
    
    elementsWithBackground.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Handle background colors
      if (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          computedStyle.backgroundColor !== 'transparent') {
        
        if (config.backgroundHandling === 'remove') {
          adjustments.push({
            type: 'print',
            element: htmlEl,
            property: 'background-color',
            originalValue: computedStyle.backgroundColor,
            newValue: 'transparent',
            reason: 'Remove background color for print'
          });
          
          htmlEl.style.backgroundColor = 'transparent';
        }
      }
      
      // Handle background images
      if (computedStyle.backgroundImage !== 'none') {
        if (config.backgroundHandling === 'remove') {
          adjustments.push({
            type: 'print',
            element: htmlEl,
            property: 'background-image',
            originalValue: computedStyle.backgroundImage,
            newValue: 'none',
            reason: 'Remove background image for print'
          });
          
          htmlEl.style.backgroundImage = 'none';
        }
      }
    });
  }

  /**
   * Optimize images for print quality
   */
  private optimizeImagesForPrint(
    element: HTMLElement,
    adjustments: LayoutAdjustment[]
  ): void {
    const images = element.querySelectorAll('img');
    
    images.forEach(img => {
      const computedStyle = window.getComputedStyle(img);
      
      // Ensure images don't exceed page width
      if (!img.style.maxWidth) {
        adjustments.push({
          type: 'print',
          element: img,
          property: 'max-width',
          originalValue: computedStyle.maxWidth,
          newValue: '100%',
          reason: 'Prevent image overflow in print'
        });
        
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
      
      // Add print-specific image properties
      img.style.pageBreakInside = 'avoid';
    });
  }

  /**
   * Add print-specific CSS rules
   */
  private addPrintCSS(
    element: HTMLElement,
    adjustments: LayoutAdjustment[]
  ): void {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .page-break {
          page-break-before: always !important;
          break-before: page !important;
        }
        
        .no-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        img {
          max-width: 100% !important;
          height: auto !important;
        }
      }
    `;
    
    adjustments.push({
      type: 'print',
      element: style,
      property: 'css-rules',
      originalValue: '',
      newValue: style.textContent,
      reason: 'Add print-specific CSS rules'
    });
    
    element.appendChild(style);
  }

  /**
   * Apply responsive adjustments for specific dimensions
   */
  private applyResponsiveAdjustments(
    element: HTMLElement,
    contentWidth: number,
    contentHeight: number
  ): void {
    // Scale down if content is too wide
    const currentWidth = element.offsetWidth;
    if (currentWidth > contentWidth) {
      const scaleFactor = contentWidth / currentWidth;
      element.style.transform = `scale(${scaleFactor})`;
      element.style.transformOrigin = 'top left';
    }
    
    // Adjust font sizes proportionally
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      const fontSize = parseFloat(computedStyle.fontSize);
      
      // Ensure readable font sizes
      if (fontSize < 9) {
        htmlEl.style.fontSize = '9pt';
      } else if (fontSize > 18) {
        htmlEl.style.fontSize = '18pt';
      }
    });
  }

  /**
   * Generate warnings for potential layout issues
   */
  private generateLayoutWarnings(
    element: HTMLElement,
    config: PDFConfiguration,
    metrics: LayoutMetrics
  ): string[] {
    const warnings: string[] = [];
    
    // Check for excessive scaling
    if (metrics.scaleFactor < 0.8) {
      warnings.push('Content was scaled down significantly to fit page width');
    }
    
    // Check for very tall content
    const pageFormat = this.pageFormats[config.format];
    const maxHeight = pageFormat.height - (config.margins.top + config.margins.bottom) * 72;
    
    if (metrics.optimizedDimensions.height > maxHeight * 3) {
      warnings.push('Content is very tall and may require multiple pages');
    }
    
    // Check for potential overflow elements
    const overflowElements = element.querySelectorAll('[style*="overflow: hidden"]');
    if (overflowElements.length > 0) {
      warnings.push('Some elements have hidden overflow which may cause content loss');
    }
    
    // Check for fixed positioning
    const fixedElements = element.querySelectorAll('[style*="position: fixed"]');
    if (fixedElements.length > 0) {
      warnings.push('Fixed positioned elements may not render correctly in PDF');
    }
    
    return warnings;
  }
}