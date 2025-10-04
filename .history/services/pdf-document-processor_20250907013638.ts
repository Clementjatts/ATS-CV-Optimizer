// PDF Document Processing Layer - HTML content extraction and optimization for PDF generation

import { PDFConfiguration, ValidationResult } from '../types/pdf';
import { PDFGenerationError } from '../utils/errors';

/**
 * Interface for processed document content ready for PDF generation
 */
export interface ProcessedDocument {
  html: string;
  css: string;
  structure: DocumentStructure;
  metadata: ProcessingMetadata;
}

/**
 * Document structure information for layout optimization
 */
export interface DocumentStructure {
  sections: DocumentSection[];
  totalHeight: number;
  estimatedPages: number;
  hasImages: boolean;
  hasComplexLayouts: boolean;
}

/**
 * Individual document section information
 */
export interface DocumentSection {
  id: string;
  type: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'other';
  element: HTMLElement;
  height: number;
  priority: number; // For page break decisions
  canBreak: boolean; // Whether this section can be split across pages
}

/**
 * Processing metadata and statistics
 */
export interface ProcessingMetadata {
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  optimizations: string[];
  warnings: string[];
  processingTime: number;
}

/**
 * CSS processing options for PDF optimization
 */
export interface CSSProcessingOptions {
  removeAnimations: boolean;
  optimizeForPrint: boolean;
  embedFonts: boolean;
  compressStyles: boolean;
  removeUnusedStyles: boolean;
}

/**
 * Page break configuration
 */
export interface PageBreakConfig {
  avoidOrphans: boolean;
  minSectionHeight: number;
  preferredBreakPoints: string[];
  avoidBreakInside: string[];
}

/**
 * Main document processor class for PDF generation
 */
export class PDFDocumentProcessor {
  private readonly defaultCSSOptions: CSSProcessingOptions = {
    removeAnimations: true,
    optimizeForPrint: true,
    embedFonts: true,
    compressStyles: true,
    removeUnusedStyles: true
  };

  private readonly defaultPageBreakConfig: PageBreakConfig = {
    avoidOrphans: true,
    minSectionHeight: 100,
    preferredBreakPoints: ['section', '.page-break', 'h1', 'h2'],
    avoidBreakInside: ['.work-experience', '.education-item', '.certification']
  };

  /**
   * Extract and process CV content from React component for PDF generation
   */
  async extractCVContent(element: HTMLElement): Promise<ProcessedDocument> {
    const startTime = Date.now();
    
    try {
      // Validate input element
      this.validateElement(element);
      
      // Clone element to avoid modifying original
      const clonedElement = this.cloneElementForProcessing(element);
      
      // Extract and clean HTML content
      const cleanedHTML = this.cleanHTMLContent(clonedElement);
      
      // Process CSS for PDF optimization
      const processedCSS = this.processCSSForPDF(clonedElement);
      
      // Analyze document structure
      const structure = this.analyzeDocumentStructure(clonedElement);
      
      // Create processing metadata
      const metadata: ProcessingMetadata = {
        originalSize: {
          width: element.offsetWidth,
          height: element.offsetHeight
        },
        processedSize: {
          width: clonedElement.offsetWidth,
          height: clonedElement.offsetHeight
        },
        optimizations: [],
        warnings: [],
        processingTime: Date.now() - startTime
      };
      
      return {
        html: cleanedHTML,
        css: processedCSS,
        structure,
        metadata
      };
      
    } catch (error) {
      throw new PDFGenerationError(
        `Failed to extract CV content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'content',
        true
      );
    }
  }

  /**
   * Sanitize and optimize HTML content for PDF conversion
   */
  sanitizeHTML(html: string): string {
    // Create a temporary container for processing
    const container = document.createElement('div');
    container.innerHTML = html;
    
    // Remove potentially problematic elements
    this.removeProblematicElements(container);
    
    // Optimize attributes for PDF
    this.optimizeAttributes(container);
    
    // Clean up whitespace and formatting
    this.cleanupFormatting(container);
    
    return container.innerHTML;
  }

  /**
   * Create CSS processing pipeline for PDF-specific styling
   */
  processCSSForPDF(element: HTMLElement, options: Partial<CSSProcessingOptions> = {}): string {
    const config = { ...this.defaultCSSOptions, ...options };
    
    // Extract computed styles
    const computedStyles = this.extractComputedStyles(element);
    
    // Apply PDF-specific optimizations
    let processedCSS = computedStyles;
    
    if (config.removeAnimations) {
      processedCSS = this.removeAnimations(processedCSS);
    }
    
    if (config.optimizeForPrint) {
      processedCSS = this.optimizeForPrint(processedCSS);
    }
    
    if (config.compressStyles) {
      processedCSS = this.compressStyles(processedCSS);
    }
    
    return processedCSS;
  }

  /**
   * Validate content structure and provide correction suggestions
   */
  validateContentStructure(element: HTMLElement): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check for required sections
    const requiredSections = ['header', 'summary', 'experience'];
    const foundSections = this.findSections(element);
    
    for (const section of requiredSections) {
      if (!foundSections.includes(section)) {
        warnings.push(`Missing recommended section: ${section}`);
        suggestions.push(`Consider adding a ${section} section for better ATS compatibility`);
      }
    }
    
    // Check for accessibility issues
    this.validateAccessibility(element, warnings, suggestions);
    
    // Check for PDF-specific issues
    this.validatePDFCompatibility(element, warnings, suggestions);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Optimize layout for PDF constraints and page breaks
   */
  optimizeLayoutForPDF(element: HTMLElement, config: PDFConfiguration): HTMLElement {
    const optimizedElement = element.cloneNode(true) as HTMLElement;
    
    // Apply PDF-specific styling
    this.applyPDFStyling(optimizedElement, config);
    
    // Optimize spacing and margins
    this.optimizeSpacing(optimizedElement, config);
    
    // Handle responsive elements
    this.handleResponsiveElements(optimizedElement, config);
    
    return optimizedElement;
  }

  // Private helper methods

  /**
   * Validate that the element is suitable for PDF processing
   */
  private validateElement(element: HTMLElement): void {
    if (!element) {
      throw new Error('No element provided');
    }
    
    if (!element.offsetWidth || !element.offsetHeight) {
      throw new Error('Element has no visible dimensions');
    }
    
    if (!element.innerHTML.trim()) {
      throw new Error('Element contains no content');
    }
  }

  /**
   * Clone element for safe processing without affecting original
   */
  private cloneElementForProcessing(element: HTMLElement): HTMLElement {
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Ensure clone is properly styled
    const computedStyle = window.getComputedStyle(element);
    clone.style.cssText = computedStyle.cssText;
    
    return clone;
  }

  /**
   * Clean HTML content for PDF generation
   */
  private cleanHTMLContent(element: HTMLElement): string {
    // Remove script tags and event handlers
    this.removeScripts(element);
    
    // Remove interactive elements that don't work in PDF
    this.removeInteractiveElements(element);
    
    // Optimize images for PDF
    this.optimizeImages(element);
    
    // Clean up CSS classes and IDs
    this.cleanupCSSReferences(element);
    
    return element.outerHTML;
  }

  /**
   * Remove script tags and event handlers
   */
  private removeScripts(element: HTMLElement): void {
    // Remove script tags
    const scripts = element.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handler attributes
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }

  /**
   * Remove interactive elements that don't work in PDF
   */
  private removeInteractiveElements(element: HTMLElement): void {
    const interactiveSelectors = [
      'button:not([type="button"])',
      'input',
      'textarea',
      'select',
      'video',
      'audio',
      'iframe',
      'embed',
      'object'
    ];
    
    interactiveSelectors.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => {
        // Replace with static content or remove
        if (el.textContent?.trim()) {
          const span = document.createElement('span');
          span.textContent = el.textContent;
          span.className = el.className;
          el.parentNode?.replaceChild(span, el);
        } else {
          el.remove();
        }
      });
    });
  }

  /**
   * Optimize images for PDF embedding
   */
  private optimizeImages(element: HTMLElement): void {
    const images = element.querySelectorAll('img');
    
    images.forEach(img => {
      // Ensure images have proper dimensions
      if (!img.width && !img.height) {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
      
      // Add loading="eager" for PDF generation
      img.loading = 'eager';
      
      // Remove srcset for consistency
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
    });
  }

  /**
   * Clean up CSS classes and IDs for PDF
   */
  private cleanupCSSReferences(element: HTMLElement): void {
    const allElements = element.querySelectorAll('*');
    
    allElements.forEach(el => {
      // Remove framework-specific classes that might cause issues
      const classList = Array.from(el.classList);
      const cleanedClasses = classList.filter(cls => 
        !cls.startsWith('hover:') &&
        !cls.startsWith('focus:') &&
        !cls.startsWith('active:') &&
        !cls.includes('transition')
      );
      
      el.className = cleanedClasses.join(' ');
    });
  }

  /**
   * Remove problematic elements that can cause PDF generation issues
   */
  private removeProblematicElements(container: HTMLElement): void {
    const problematicSelectors = [
      'noscript',
      'template',
      'slot',
      '[hidden]',
      '.sr-only',
      '.screen-reader-only'
    ];
    
    problematicSelectors.forEach(selector => {
      const elements = container.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  /**
   * Optimize HTML attributes for PDF generation
   */
  private optimizeAttributes(container: HTMLElement): void {
    const allElements = container.querySelectorAll('*');
    
    allElements.forEach(el => {
      // Remove data attributes that aren't needed
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('data-') && 
            !attr.name.includes('pdf') && 
            !attr.name.includes('print')) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Remove accessibility attributes that don't apply to PDF
      const accessibilityAttrs = ['aria-hidden', 'role', 'tabindex'];
      accessibilityAttrs.forEach(attr => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
    });
  }

  /**
   * Clean up formatting and whitespace
   */
  private cleanupFormatting(container: HTMLElement): void {
    // Remove excessive whitespace
    const textNodes = this.getTextNodes(container);
    textNodes.forEach(node => {
      if (node.textContent) {
        node.textContent = node.textContent.replace(/\s+/g, ' ').trim();
      }
    });
    
    // Remove empty elements
    const allElements = container.querySelectorAll('*');
    allElements.forEach(el => {
      if (!el.textContent?.trim() && 
          !el.querySelector('img, svg, canvas') &&
          !['br', 'hr'].includes(el.tagName.toLowerCase())) {
        el.remove();
      }
    });
  }

  /**
   * Get all text nodes in an element
   */
  private getTextNodes(element: HTMLElement): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }
    
    return textNodes;
  }

  /**
   * Extract computed styles from element
   */
  private extractComputedStyles(element: HTMLElement): string {
    const styles: string[] = [];
    const computedStyle = window.getComputedStyle(element);
    
    // Extract relevant CSS properties
    const relevantProperties = [
      'font-family', 'font-size', 'font-weight', 'line-height',
      'color', 'background-color', 'margin', 'padding',
      'border', 'width', 'height', 'display', 'position'
    ];
    
    relevantProperties.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'initial' && value !== 'inherit') {
        styles.push(`${prop}: ${value};`);
      }
    });
    
    return styles.join(' ');
  }

  /**
   * Remove CSS animations and transitions
   */
  private removeAnimations(css: string): string {
    return css
      .replace(/animation[^;]*;/g, '')
      .replace(/transition[^;]*;/g, '')
      .replace(/transform[^;]*;/g, '');
  }

  /**
   * Optimize CSS for print media
   */
  private optimizeForPrint(css: string): string {
    // Add print-specific styles
    const printStyles = `
      @media print {
        * { -webkit-print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; }
        .page-break { page-break-before: always; }
        .no-break { page-break-inside: avoid; }
      }
    `;
    
    return css + printStyles;
  }

  /**
   * Compress CSS by removing unnecessary whitespace
   */
  private compressStyles(css: string): string {
    return css
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .trim();
  }

  /**
   * Analyze document structure for layout optimization
   */
  private analyzeDocumentStructure(element: HTMLElement): DocumentStructure {
    const sections = this.identifySections(element);
    const totalHeight = element.offsetHeight;
    const estimatedPages = Math.ceil(totalHeight / 1056); // 11 inches at 96 DPI
    
    return {
      sections,
      totalHeight,
      estimatedPages,
      hasImages: element.querySelectorAll('img').length > 0,
      hasComplexLayouts: this.hasComplexLayouts(element)
    };
  }

  /**
   * Identify document sections for page break optimization
   */
  private identifySections(element: HTMLElement): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const sectionElements = element.querySelectorAll('section, .section, header, .header');
    
    sectionElements.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      const section: DocumentSection = {
        id: htmlEl.id || `section-${index}`,
        type: this.determineSectionType(htmlEl),
        element: htmlEl,
        height: htmlEl.offsetHeight,
        priority: this.getSectionPriority(htmlEl),
        canBreak: this.canSectionBreak(htmlEl)
      };
      
      sections.push(section);
    });
    
    return sections;
  }

  /**
   * Determine the type of a document section
   */
  private determineSectionType(element: HTMLElement): DocumentSection['type'] {
    const classList = element.className.toLowerCase();
    const textContent = element.textContent?.toLowerCase() || '';
    
    if (classList.includes('header') || element.tagName.toLowerCase() === 'header') {
      return 'header';
    }
    
    if (classList.includes('summary') || textContent.includes('summary')) {
      return 'summary';
    }
    
    if (classList.includes('experience') || textContent.includes('experience')) {
      return 'experience';
    }
    
    if (classList.includes('education') || textContent.includes('education')) {
      return 'education';
    }
    
    if (classList.includes('skills') || textContent.includes('skills')) {
      return 'skills';
    }
    
    if (classList.includes('certification') || textContent.includes('certification')) {
      return 'certifications';
    }
    
    return 'other';
  }

  /**
   * Get section priority for page break decisions
   */
  private getSectionPriority(element: HTMLElement): number {
    const type = this.determineSectionType(element);
    
    const priorities = {
      header: 1,
      summary: 2,
      experience: 3,
      skills: 4,
      education: 5,
      certifications: 6,
      other: 7
    };
    
    return priorities[type] || 7;
  }

  /**
   * Check if a section can be broken across pages
   */
  private canSectionBreak(element: HTMLElement): boolean {
    const type = this.determineSectionType(element);
    const height = element.offsetHeight;
    
    // Don't break short sections or headers
    if (height < 200 || type === 'header') {
      return false;
    }
    
    // Experience sections can usually be broken
    if (type === 'experience' && height > 400) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if element has complex layouts that might cause issues
   */
  private hasComplexLayouts(element: HTMLElement): boolean {
    const complexSelectors = [
      '.grid',
      '.flex',
      '[style*="position: absolute"]',
      '[style*="position: fixed"]',
      '.overlay',
      '.modal'
    ];
    
    return complexSelectors.some(selector => 
      element.querySelector(selector) !== null
    );
  }

  /**
   * Find sections in the document
   */
  private findSections(element: HTMLElement): string[] {
    const sections: string[] = [];
    const sectionElements = element.querySelectorAll('section, .section, header, .header');
    
    sectionElements.forEach(el => {
      const type = this.determineSectionType(el as HTMLElement);
      if (!sections.includes(type)) {
        sections.push(type);
      }
    });
    
    return sections;
  }

  /**
   * Validate accessibility for PDF generation
   */
  private validateAccessibility(element: HTMLElement, warnings: string[], suggestions: string[]): void {
    // Check for proper heading structure
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      warnings.push('No heading elements found');
      suggestions.push('Add proper heading structure for better document organization');
    }
    
    // Check for alt text on images
    const images = element.querySelectorAll('img');
    images.forEach(img => {
      if (!img.alt) {
        warnings.push('Image missing alt text');
        suggestions.push('Add descriptive alt text to images for accessibility');
      }
    });
  }

  /**
   * Validate PDF-specific compatibility
   */
  private validatePDFCompatibility(element: HTMLElement, warnings: string[], suggestions: string[]): void {
    // Check for problematic CSS
    const computedStyle = window.getComputedStyle(element);
    
    if (computedStyle.position === 'fixed' || computedStyle.position === 'sticky') {
      warnings.push('Fixed or sticky positioning detected');
      suggestions.push('Consider using static positioning for PDF generation');
    }
    
    // Check for viewport units
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        rules.forEach(rule => {
          if (rule.cssText.includes('vw') || rule.cssText.includes('vh')) {
            warnings.push('Viewport units detected in CSS');
            suggestions.push('Consider using fixed units (px, pt, in) for PDF generation');
          }
        });
      } catch {
        // Ignore cross-origin stylesheet access errors
      }
    });
  }

  /**
   * Apply PDF-specific styling to element
   */
  private applyPDFStyling(element: HTMLElement, config: PDFConfiguration): void {
    // Set fixed width for consistent layout
    const pageWidth = config.format === 'letter' ? '8.5in' : '210mm';
    element.style.width = pageWidth;
    element.style.maxWidth = pageWidth;
    
    // Apply margins
    element.style.margin = `${config.margins.top}in ${config.margins.right}in ${config.margins.bottom}in ${config.margins.left}in`;
    
    // Ensure proper font rendering
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '11pt';
    element.style.lineHeight = '1.4';
    
    // Set background for proper rendering
    element.style.backgroundColor = 'white';
    element.style.color = 'black';
  }

  /**
   * Optimize spacing for PDF layout
   */
  private optimizeSpacing(element: HTMLElement, config: PDFConfiguration): void {
    const allElements = element.querySelectorAll('*');
    
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      
      // Convert relative units to absolute
      if (computedStyle.marginTop.includes('em') || computedStyle.marginTop.includes('rem')) {
        htmlEl.style.marginTop = '12pt';
      }
      
      if (computedStyle.marginBottom.includes('em') || computedStyle.marginBottom.includes('rem')) {
        htmlEl.style.marginBottom = '12pt';
      }
    });
  }

  /**
   * Handle responsive elements for PDF layout
   */
  private handleResponsiveElements(element: HTMLElement, config: PDFConfiguration): void {
    // Remove responsive classes that might cause issues
    const responsiveClasses = [
      'sm:', 'md:', 'lg:', 'xl:', '2xl:',
      'mobile', 'tablet', 'desktop'
    ];
    
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      const classList = Array.from(el.classList);
      const filteredClasses = classList.filter(cls => 
        !responsiveClasses.some(responsive => cls.includes(responsive))
      );
      
      el.className = filteredClasses.join(' ');
    });
    
    // Set fixed layouts for grid and flex containers
    const gridElements = element.querySelectorAll('.grid, [style*="display: grid"]');
    gridElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = 'block';
    });
    
    const flexElements = element.querySelectorAll('.flex, [style*="display: flex"]');
    flexElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.display = 'block';
    });
  }
}