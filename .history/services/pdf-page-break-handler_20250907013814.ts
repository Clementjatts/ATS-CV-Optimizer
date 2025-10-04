// PDF Page Break Handler - Intelligent page break detection and optimization

import { PDFConfiguration } from '../types/pdf';
import { DocumentSection, DocumentStructure } from './pdf-document-processor';

/**
 * Page break analysis result
 */
export interface PageBreakAnalysis {
  recommendedBreaks: PageBreakPoint[];
  pageLayout: PageLayout[];
  warnings: string[];
  optimizations: string[];
}

/**
 * Individual page break point
 */
export interface PageBreakPoint {
  element: HTMLElement;
  position: number; // Y position in pixels
  type: 'natural' | 'forced' | 'optimized';
  reason: string;
  priority: number;
}

/**
 * Page layout information
 */
export interface PageLayout {
  pageNumber: number;
  startPosition: number;
  endPosition: number;
  height: number;
  sections: DocumentSection[];
  hasOrphans: boolean;
  hasWidows: boolean;
}

/**
 * Page break optimization options
 */
export interface PageBreakOptions {
  pageHeight: number; // in pixels
  marginTop: number;
  marginBottom: number;
  minSectionHeight: number;
  avoidOrphans: boolean;
  avoidWidows: boolean;
  preferredBreakElements: string[];
  avoidBreakElements: string[];
}

/**
 * Content flow management for multi-page documents
 */
export interface ContentFlow {
  totalPages: number;
  pageContents: PageContent[];
  overflowHandling: OverflowStrategy;
}

/**
 * Individual page content
 */
export interface PageContent {
  pageNumber: number;
  elements: HTMLElement[];
  estimatedHeight: number;
  actualHeight?: number;
  hasOverflow: boolean;
}

/**
 * Overflow handling strategies
 */
export type OverflowStrategy = 'scale' | 'split' | 'newPage' | 'compress';

/**
 * Header and footer configuration
 */
export interface HeaderFooterConfig {
  header?: {
    content: string;
    height: number;
    showOnFirstPage: boolean;
  };
  footer?: {
    content: string;
    height: number;
    showPageNumbers: boolean;
    pageNumberFormat: string;
  };
}

/**
 * Main page break handler class
 */
export class PDFPageBreakHandler {
  private readonly defaultOptions: PageBreakOptions = {
    pageHeight: 1056, // 11 inches at 96 DPI
    marginTop: 48, // 0.5 inch
    marginBottom: 48, // 0.5 inch
    minSectionHeight: 100,
    avoidOrphans: true,
    avoidWidows: true,
    preferredBreakElements: ['section', '.page-break', 'h1', 'h2', '.section-break'],
    avoidBreakElements: ['.no-break', '.work-experience', '.education-item', '.keep-together']
  };

  /**
   * Analyze and optimize page breaks for the document
   */
  analyzePageBreaks(
    element: HTMLElement, 
    structure: DocumentStructure, 
    config: PDFConfiguration
  ): PageBreakAnalysis {
    const options = this.createPageBreakOptions(config);
    
    // Calculate available page height
    const availableHeight = options.pageHeight - options.marginTop - options.marginBottom;
    
    // Find natural break points
    const naturalBreaks = this.findNaturalBreakPoints(element, options);
    
    // Optimize break points to avoid orphans and widows
    const optimizedBreaks = this.optimizeBreakPoints(naturalBreaks, structure, options);
    
    // Create page layout
    const pageLayout = this.createPageLayout(element, optimizedBreaks, availableHeight);
    
    // Generate warnings and optimization suggestions
    const warnings = this.generateWarnings(pageLayout, structure);
    const optimizations = this.generateOptimizations(pageLayout, structure);
    
    return {
      recommendedBreaks: optimizedBreaks,
      pageLayout,
      warnings,
      optimizations
    };
  }

  /**
   * Apply intelligent page breaks to prevent orphaned content
   */
  applyPageBreaks(element: HTMLElement, analysis: PageBreakAnalysis): HTMLElement {
    const processedElement = element.cloneNode(true) as HTMLElement;
    
    // Apply page break markers
    analysis.recommendedBreaks.forEach(breakPoint => {
      this.insertPageBreak(processedElement, breakPoint);
    });
    
    // Add page break CSS
    this.addPageBreakCSS(processedElement);
    
    // Handle section-aware breaking
    this.applySectionAwareBreaking(processedElement, analysis);
    
    return processedElement;
  }

  /**
   * Create content flow management for multi-page documents
   */
  createContentFlow(
    element: HTMLElement, 
    analysis: PageBreakAnalysis,
    options: Partial<PageBreakOptions> = {}
  ): ContentFlow {
    const config = { ...this.defaultOptions, ...options };
    const pageContents: PageContent[] = [];
    
    // Split content into pages based on break analysis
    analysis.pageLayout.forEach((page, index) => {
      const pageElements = this.extractPageElements(element, page);
      const estimatedHeight = this.calculateElementsHeight(pageElements);
      
      pageContents.push({
        pageNumber: index + 1,
        elements: pageElements,
        estimatedHeight,
        hasOverflow: estimatedHeight > config.pageHeight
      });
    });
    
    // Determine overflow handling strategy
    const overflowHandling = this.determineOverflowStrategy(pageContents);
    
    return {
      totalPages: pageContents.length,
      pageContents,
      overflowHandling
    };
  }

  /**
   * Add page numbering and header/footer support
   */
  addHeadersAndFooters(
    element: HTMLElement, 
    config: HeaderFooterConfig,
    totalPages: number
  ): HTMLElement {
    const processedElement = element.cloneNode(true) as HTMLElement;
    
    // Add header if configured
    if (config.header) {
      this.addHeader(processedElement, config.header, totalPages);
    }
    
    // Add footer if configured
    if (config.footer) {
      this.addFooter(processedElement, config.footer, totalPages);
    }
    
    return processedElement;
  }

  /**
   * Optimize content for better page flow
   */
  optimizeContentFlow(element: HTMLElement, flow: ContentFlow): HTMLElement {
    const optimizedElement = element.cloneNode(true) as HTMLElement;
    
    // Handle overflow pages
    flow.pageContents.forEach((page, index) => {
      if (page.hasOverflow) {
        this.handlePageOverflow(optimizedElement, page, flow.overflowHandling);
      }
    });
    
    // Optimize spacing between pages
    this.optimizeInterPageSpacing(optimizedElement, flow);
    
    // Add page break indicators
    this.addPageBreakIndicators(optimizedElement, flow);
    
    return optimizedElement;
  }

  // Private helper methods

  /**
   * Create page break options from PDF configuration
   */
  private createPageBreakOptions(config: PDFConfiguration): PageBreakOptions {
    const pageHeight = config.format === 'letter' ? 1056 : 1123; // 11" or A4 at 96 DPI
    
    return {
      ...this.defaultOptions,
      pageHeight,
      marginTop: config.margins.top * 96, // Convert inches to pixels
      marginBottom: config.margins.bottom * 96
    };
  }

  /**
   * Find natural break points in the document
   */
  private findNaturalBreakPoints(element: HTMLElement, options: PageBreakOptions): PageBreakPoint[] {
    const breakPoints: PageBreakPoint[] = [];
    
    // Find preferred break elements
    options.preferredBreakElements.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        const rect = htmlEl.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativeTop = rect.top - elementRect.top;
        
        breakPoints.push({
          element: htmlEl,
          position: relativeTop,
          type: 'natural',
          reason: `Natural break at ${selector}`,
          priority: this.getBreakPriority(selector)
        });
      });
    });
    
    // Add forced breaks at page boundaries
    const availableHeight = options.pageHeight - options.marginTop - options.marginBottom;
    let currentPage = 1;
    let currentPosition = availableHeight;
    
    while (currentPosition < element.offsetHeight) {
      const nearestElement = this.findNearestElement(element, currentPosition);
      if (nearestElement) {
        breakPoints.push({
          element: nearestElement,
          position: currentPosition,
          type: 'forced',
          reason: `Page ${currentPage} boundary`,
          priority: 5
        });
      }
      
      currentPage++;
      currentPosition += availableHeight;
    }
    
    // Sort by position
    return breakPoints.sort((a, b) => a.position - b.position);
  }

  /**
   * Optimize break points to avoid orphans and widows
   */
  private optimizeBreakPoints(
    breakPoints: PageBreakPoint[], 
    structure: DocumentStructure, 
    options: PageBreakOptions
  ): PageBreakPoint[] {
    const optimized: PageBreakPoint[] = [];
    
    breakPoints.forEach(breakPoint => {
      // Check if this break would create orphans or widows
      if (this.wouldCreateOrphan(breakPoint, structure, options)) {
        // Try to find a better break point
        const betterBreak = this.findBetterBreakPoint(breakPoint, structure, options);
        if (betterBreak) {
          optimized.push({
            ...betterBreak,
            type: 'optimized',
            reason: `Optimized to avoid orphan: ${breakPoint.reason}`
          });
        } else {
          optimized.push(breakPoint);
        }
      } else if (this.wouldCreateWidow(breakPoint, structure, options)) {
        // Try to find a better break point
        const betterBreak = this.findBetterBreakPoint(breakPoint, structure, options);
        if (betterBreak) {
          optimized.push({
            ...betterBreak,
            type: 'optimized',
            reason: `Optimized to avoid widow: ${breakPoint.reason}`
          });
        } else {
          optimized.push(breakPoint);
        }
      } else {
        optimized.push(breakPoint);
      }
    });
    
    return optimized;
  }

  /**
   * Create page layout based on break points
   */
  private createPageLayout(
    element: HTMLElement, 
    breakPoints: PageBreakPoint[], 
    availableHeight: number
  ): PageLayout[] {
    const pages: PageLayout[] = [];
    let currentPage = 1;
    let startPosition = 0;
    
    breakPoints.forEach((breakPoint, index) => {
      const endPosition = breakPoint.position;
      const height = endPosition - startPosition;
      
      // Find sections in this page range
      const sectionsInRange = this.findSectionsInRange(element, startPosition, endPosition);
      
      pages.push({
        pageNumber: currentPage,
        startPosition,
        endPosition,
        height,
        sections: sectionsInRange,
        hasOrphans: this.checkForOrphans(sectionsInRange, height),
        hasWidows: this.checkForWidows(sectionsInRange, height)
      });
      
      startPosition = endPosition;
      currentPage++;
    });
    
    // Add final page if needed
    if (startPosition < element.offsetHeight) {
      const sectionsInRange = this.findSectionsInRange(element, startPosition, element.offsetHeight);
      pages.push({
        pageNumber: currentPage,
        startPosition,
        endPosition: element.offsetHeight,
        height: element.offsetHeight - startPosition,
        sections: sectionsInRange,
        hasOrphans: false,
        hasWidows: false
      });
    }
    
    return pages;
  }

  /**
   * Generate warnings for page layout issues
   */
  private generateWarnings(pageLayout: PageLayout[], structure: DocumentStructure): string[] {
    const warnings: string[] = [];
    
    pageLayout.forEach(page => {
      if (page.hasOrphans) {
        warnings.push(`Page ${page.pageNumber} has orphaned content`);
      }
      
      if (page.hasWidows) {
        warnings.push(`Page ${page.pageNumber} has widow lines`);
      }
      
      if (page.height > 1200) { // Excessive page height
        warnings.push(`Page ${page.pageNumber} is unusually tall and may not fit properly`);
      }
      
      if (page.sections.length === 0) {
        warnings.push(`Page ${page.pageNumber} appears to be empty`);
      }
    });
    
    return warnings;
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizations(pageLayout: PageLayout[], structure: DocumentStructure): string[] {
    const optimizations: string[] = [];
    
    // Check for pages that could be combined
    for (let i = 0; i < pageLayout.length - 1; i++) {
      const currentPage = pageLayout[i];
      const nextPage = pageLayout[i + 1];
      
      if (currentPage.height + nextPage.height < 900) { // Could fit on one page
        optimizations.push(`Pages ${currentPage.pageNumber} and ${nextPage.pageNumber} could potentially be combined`);
      }
    }
    
    // Check for sections that could be better positioned
    structure.sections.forEach(section => {
      if (section.height > 800 && section.canBreak) {
        optimizations.push(`Section "${section.id}" is very long and could benefit from internal breaks`);
      }
    });
    
    return optimizations;
  }

  /**
   * Insert page break marker at specified point
   */
  private insertPageBreak(element: HTMLElement, breakPoint: PageBreakPoint): void {
    const breakMarker = document.createElement('div');
    breakMarker.className = 'pdf-page-break';
    breakMarker.style.cssText = `
      page-break-before: always;
      break-before: page;
      height: 0;
      margin: 0;
      padding: 0;
      border: none;
    `;
    
    // Insert before the break point element
    breakPoint.element.parentNode?.insertBefore(breakMarker, breakPoint.element);
  }

  /**
   * Add page break CSS to the document
   */
  private addPageBreakCSS(element: HTMLElement): void {
    const style = document.createElement('style');
    style.textContent = `
      .pdf-page-break {
        page-break-before: always !important;
        break-before: page !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
      }
      
      .no-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      .keep-together {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      
      @media print {
        .pdf-page-break {
          page-break-before: always !important;
        }
      }
    `;
    
    element.appendChild(style);
  }

  /**
   * Apply section-aware page breaking
   */
  private applySectionAwareBreaking(element: HTMLElement, analysis: PageBreakAnalysis): void {
    // Add no-break classes to elements that shouldn't be split
    const noBreakSelectors = ['.work-experience', '.education-item', '.certification'];
    
    noBreakSelectors.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('no-break');
      });
    });
    
    // Add keep-together classes to related content
    const keepTogetherSelectors = ['h1 + p', 'h2 + p', 'h3 + p'];
    
    keepTogetherSelectors.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => {
        el.classList.add('keep-together');
      });
    });
  }

  /**
   * Get break priority for different selectors
   */
  private getBreakPriority(selector: string): number {
    const priorities: { [key: string]: number } = {
      'section': 1,
      '.page-break': 1,
      'h1': 2,
      'h2': 3,
      '.section-break': 4,
      'h3': 5
    };
    
    return priorities[selector] || 10;
  }

  /**
   * Find the nearest element to a position
   */
  private findNearestElement(container: HTMLElement, position: number): HTMLElement | null {
    const allElements = container.querySelectorAll('*');
    let nearestElement: HTMLElement | null = null;
    let minDistance = Infinity;
    
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = rect.top - containerRect.top;
      const distance = Math.abs(relativeTop - position);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestElement = htmlEl;
      }
    });
    
    return nearestElement;
  }

  /**
   * Check if a break point would create an orphan
   */
  private wouldCreateOrphan(
    breakPoint: PageBreakPoint, 
    structure: DocumentStructure, 
    options: PageBreakOptions
  ): boolean {
    if (!options.avoidOrphans) return false;
    
    // Check if there's very little content before the break
    const contentBefore = breakPoint.position;
    const minContentHeight = options.minSectionHeight;
    
    return contentBefore < minContentHeight;
  }

  /**
   * Check if a break point would create a widow
   */
  private wouldCreateWidow(
    breakPoint: PageBreakPoint, 
    structure: DocumentStructure, 
    options: PageBreakOptions
  ): boolean {
    if (!options.avoidWidows) return false;
    
    // Check if there's very little content after the break
    const totalHeight = structure.totalHeight;
    const contentAfter = totalHeight - breakPoint.position;
    const minContentHeight = options.minSectionHeight;
    
    return contentAfter < minContentHeight;
  }

  /**
   * Find a better break point to avoid orphans/widows
   */
  private findBetterBreakPoint(
    originalBreak: PageBreakPoint, 
    structure: DocumentStructure, 
    options: PageBreakOptions
  ): PageBreakPoint | null {
    // Look for alternative break points within a reasonable range
    const searchRange = 100; // pixels
    const minPosition = originalBreak.position - searchRange;
    const maxPosition = originalBreak.position + searchRange;
    
    // Find elements in the search range
    const container = originalBreak.element.closest('[id="cv-preview"]') as HTMLElement;
    if (!container) return null;
    
    const allElements = container.querySelectorAll('*');
    
    for (const el of allElements) {
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativeTop = rect.top - containerRect.top;
      
      if (relativeTop >= minPosition && relativeTop <= maxPosition) {
        // Check if this would be a better break point
        const testBreak: PageBreakPoint = {
          element: htmlEl,
          position: relativeTop,
          type: 'optimized',
          reason: 'Alternative break point',
          priority: originalBreak.priority + 1
        };
        
        if (!this.wouldCreateOrphan(testBreak, structure, options) &&
            !this.wouldCreateWidow(testBreak, structure, options)) {
          return testBreak;
        }
      }
    }
    
    return null;
  }

  /**
   * Find sections within a position range
   */
  private findSectionsInRange(
    element: HTMLElement, 
    startPosition: number, 
    endPosition: number
  ): DocumentSection[] {
    // This would need to be implemented based on the actual document structure
    // For now, return empty array
    return [];
  }

  /**
   * Check for orphans in page sections
   */
  private checkForOrphans(sections: DocumentSection[], pageHeight: number): boolean {
    // Simple heuristic: if the first section is very short, it might be an orphan
    if (sections.length > 0 && sections[0].height < 50) {
      return true;
    }
    return false;
  }

  /**
   * Check for widows in page sections
   */
  private checkForWidows(sections: DocumentSection[], pageHeight: number): boolean {
    // Simple heuristic: if the last section is very short, it might be a widow
    if (sections.length > 0) {
      const lastSection = sections[sections.length - 1];
      if (lastSection.height < 50) {
        return true;
      }
    }
    return false;
  }

  /**
   * Extract elements for a specific page
   */
  private extractPageElements(element: HTMLElement, page: PageLayout): HTMLElement[] {
    const elements: HTMLElement[] = [];
    const allElements = element.querySelectorAll('*');
    
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const relativeTop = rect.top - elementRect.top;
      
      if (relativeTop >= page.startPosition && relativeTop < page.endPosition) {
        elements.push(htmlEl);
      }
    });
    
    return elements;
  }

  /**
   * Calculate total height of elements
   */
  private calculateElementsHeight(elements: HTMLElement[]): number {
    return elements.reduce((total, el) => total + el.offsetHeight, 0);
  }

  /**
   * Determine overflow handling strategy
   */
  private determineOverflowStrategy(pageContents: PageContent[]): OverflowStrategy {
    const hasOverflow = pageContents.some(page => page.hasOverflow);
    
    if (!hasOverflow) {
      return 'scale';
    }
    
    // For now, default to creating new pages for overflow
    return 'newPage';
  }

  /**
   * Add header to the document
   */
  private addHeader(element: HTMLElement, header: HeaderFooterConfig['header'], totalPages: number): void {
    if (!header) return;
    
    const headerElement = document.createElement('div');
    headerElement.className = 'pdf-header';
    headerElement.innerHTML = header.content;
    headerElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: ${header.height}px;
      background: white;
      border-bottom: 1px solid #ccc;
      padding: 10px;
      z-index: 1000;
    `;
    
    element.insertBefore(headerElement, element.firstChild);
  }

  /**
   * Add footer to the document
   */
  private addFooter(element: HTMLElement, footer: HeaderFooterConfig['footer'], totalPages: number): void {
    if (!footer) return;
    
    const footerElement = document.createElement('div');
    footerElement.className = 'pdf-footer';
    
    let footerContent = footer.content;
    if (footer.showPageNumbers) {
      const pageNumberText = footer.pageNumberFormat
        .replace('{current}', '1')
        .replace('{total}', totalPages.toString());
      footerContent += ` ${pageNumberText}`;
    }
    
    footerElement.innerHTML = footerContent;
    footerElement.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: ${footer.height}px;
      background: white;
      border-top: 1px solid #ccc;
      padding: 10px;
      z-index: 1000;
    `;
    
    element.appendChild(footerElement);
  }

  /**
   * Handle page overflow
   */
  private handlePageOverflow(element: HTMLElement, page: PageContent, strategy: OverflowStrategy): void {
    switch (strategy) {
      case 'scale':
        this.scalePageContent(element, page);
        break;
      case 'split':
        this.splitPageContent(element, page);
        break;
      case 'newPage':
        this.createNewPageForOverflow(element, page);
        break;
      case 'compress':
        this.compressPageContent(element, page);
        break;
    }
  }

  /**
   * Scale page content to fit
   */
  private scalePageContent(element: HTMLElement, page: PageContent): void {
    const scaleFactor = 0.9; // Scale down by 10%
    page.elements.forEach(el => {
      el.style.transform = `scale(${scaleFactor})`;
      el.style.transformOrigin = 'top left';
    });
  }

  /**
   * Split page content across multiple pages
   */
  private splitPageContent(element: HTMLElement, page: PageContent): void {
    // This would implement intelligent content splitting
    // For now, just add a page break in the middle
    const midPoint = Math.floor(page.elements.length / 2);
    if (midPoint > 0 && midPoint < page.elements.length) {
      const breakElement = page.elements[midPoint];
      this.insertPageBreak(element, {
        element: breakElement,
        position: 0,
        type: 'forced',
        reason: 'Overflow handling',
        priority: 10
      });
    }
  }

  /**
   * Create new page for overflow content
   */
  private createNewPageForOverflow(element: HTMLElement, page: PageContent): void {
    // Add page break before overflow content
    if (page.elements.length > 0) {
      const firstOverflowElement = page.elements[0];
      this.insertPageBreak(element, {
        element: firstOverflowElement,
        position: 0,
        type: 'forced',
        reason: 'Overflow to new page',
        priority: 10
      });
    }
  }

  /**
   * Compress page content to fit better
   */
  private compressPageContent(element: HTMLElement, page: PageContent): void {
    page.elements.forEach(el => {
      // Reduce margins and padding slightly
      const computedStyle = window.getComputedStyle(el);
      const currentMargin = parseInt(computedStyle.marginBottom) || 0;
      const currentPadding = parseInt(computedStyle.paddingBottom) || 0;
      
      if (currentMargin > 5) {
        el.style.marginBottom = `${Math.max(currentMargin * 0.8, 5)}px`;
      }
      
      if (currentPadding > 5) {
        el.style.paddingBottom = `${Math.max(currentPadding * 0.8, 5)}px`;
      }
    });
  }

  /**
   * Optimize spacing between pages
   */
  private optimizeInterPageSpacing(element: HTMLElement, flow: ContentFlow): void {
    const pageBreaks = element.querySelectorAll('.pdf-page-break');
    
    pageBreaks.forEach(pageBreak => {
      // Ensure consistent spacing around page breaks
      const htmlBreak = pageBreak as HTMLElement;
      htmlBreak.style.marginTop = '0';
      htmlBreak.style.marginBottom = '0';
    });
  }

  /**
   * Add visual page break indicators for debugging
   */
  private addPageBreakIndicators(element: HTMLElement, flow: ContentFlow): void {
    // Only add indicators in development mode
    if (process.env.NODE_ENV === 'development') {
      const pageBreaks = element.querySelectorAll('.pdf-page-break');
      
      pageBreaks.forEach((pageBreak, index) => {
        const indicator = document.createElement('div');
        indicator.textContent = `--- Page ${index + 2} ---`;
        indicator.style.cssText = `
          color: red;
          font-size: 10px;
          text-align: center;
          margin: 5px 0;
          opacity: 0.5;
        `;
        
        pageBreak.parentNode?.insertBefore(indicator, pageBreak.nextSibling);
      });
    }
  }
}