// PDF Document Processing Service - Main integration service for document processing

import { PDFConfiguration, ValidationResult } from '../types/pdf';
import { 
  PDFDocumentProcessor, 
  ProcessedDocument, 
  DocumentStructure 
} from './pdf-document-processor';
import { 
  PDFPageBreakHandler, 
  PageBreakAnalysis, 
  ContentFlow,
  HeaderFooterConfig 
} from './pdf-page-break-handler';
import { 
  PDFLayoutOptimizer, 
  LayoutOptimizationResult 
} from './pdf-layout-optimizer';
import { PDFGenerationError } from '../utils/errors';

/**
 * Complete document processing result
 */
export interface DocumentProcessingResult {
  processedDocument: ProcessedDocument;
  pageBreakAnalysis: PageBreakAnalysis;
  layoutOptimization: LayoutOptimizationResult;
  contentFlow: ContentFlow;
  finalElement: HTMLElement;
  validation: ValidationResult;
  processingMetadata: ProcessingMetadata;
}

/**
 * Processing metadata and statistics
 */
export interface ProcessingMetadata {
  totalProcessingTime: number;
  stagesCompleted: string[];
  optimizationsApplied: number;
  warningsGenerated: number;
  errorsEncountered: string[];
}

/**
 * Document processing options
 */
export interface DocumentProcessingOptions {
  enablePageBreaks: boolean;
  enableLayoutOptimization: boolean;
  enableContentValidation: boolean;
  headerFooterConfig?: HeaderFooterConfig;
  customCSS?: string;
  preserveInteractivity: boolean;
}

/**
 * Main document processing service that coordinates all processing components
 */
export class PDFDocumentProcessingService {
  private documentProcessor: PDFDocumentProcessor;
  private pageBreakHandler: PDFPageBreakHandler;
  private layoutOptimizer: PDFLayoutOptimizer;

  constructor() {
    this.documentProcessor = new PDFDocumentProcessor();
    this.pageBreakHandler = new PDFPageBreakHandler();
    this.layoutOptimizer = new PDFLayoutOptimizer();
  }

  /**
   * Process complete document for PDF generation
   * This is the main entry point that coordinates all processing steps
   */
  async processDocumentForPDF(
    element: HTMLElement,
    config: PDFConfiguration,
    options: Partial<DocumentProcessingOptions> = {}
  ): Promise<DocumentProcessingResult> {
    const startTime = Date.now();
    const processingOptions: DocumentProcessingOptions = {
      enablePageBreaks: true,
      enableLayoutOptimization: true,
      enableContentValidation: true,
      preserveInteractivity: false,
      ...options
    };

    const stagesCompleted: string[] = [];
    const errorsEncountered: string[] = [];
    let optimizationsApplied = 0;
    let warningsGenerated = 0;

    try {
      // Stage 1: Extract and clean HTML content
      const processedDocument = await this.documentProcessor.extractCVContent(element);
      stagesCompleted.push('content-extraction');
      optimizationsApplied += processedDocument.metadata.optimizations.length;
      warningsGenerated += processedDocument.metadata.warnings.length;

      // Stage 2: Validate content structure
      let validation: ValidationResult = { isValid: true, errors: [], warnings: [], suggestions: [] };
      if (processingOptions.enableContentValidation) {
        validation = this.documentProcessor.validateContentStructure(element);
        stagesCompleted.push('content-validation');
        warningsGenerated += validation.warnings.length;
      }

      // Stage 3: Analyze and optimize page breaks
      let pageBreakAnalysis: PageBreakAnalysis;
      let contentFlow: ContentFlow;
      
      if (processingOptions.enablePageBreaks) {
        pageBreakAnalysis = this.pageBreakHandler.analyzePageBreaks(
          element, 
          processedDocument.structure, 
          config
        );
        stagesCompleted.push('page-break-analysis');
        warningsGenerated += pageBreakAnalysis.warnings.length;
        optimizationsApplied += pageBreakAnalysis.optimizations.length;

        // Create content flow management
        contentFlow = this.pageBreakHandler.createContentFlow(element, pageBreakAnalysis);
        stagesCompleted.push('content-flow-creation');
      } else {
        // Create minimal page break analysis
        pageBreakAnalysis = {
          recommendedBreaks: [],
          pageLayout: [],
          warnings: [],
          optimizations: []
        };
        contentFlow = {
          totalPages: 1,
          pageContents: [],
          overflowHandling: 'scale'
        };
      }

      // Stage 4: Optimize layout for PDF constraints
      let layoutOptimization: LayoutOptimizationResult;
      if (processingOptions.enableLayoutOptimization) {
        layoutOptimization = this.layoutOptimizer.optimizeLayout(
          element, 
          config, 
          processedDocument
        );
        stagesCompleted.push('layout-optimization');
        optimizationsApplied += layoutOptimization.adjustments.length;
        warningsGenerated += layoutOptimization.warnings.length;
      } else {
        // Create minimal layout optimization result
        layoutOptimization = {
          optimizedElement: element.cloneNode(true) as HTMLElement,
          adjustments: [],
          metrics: {
            originalDimensions: { width: element.offsetWidth, height: element.offsetHeight },
            optimizedDimensions: { width: element.offsetWidth, height: element.offsetHeight },
            scaleFactor: 1,
            adjustmentCount: 0,
            optimizationTime: 0
          },
          warnings: []
        };
      }

      // Stage 5: Apply page breaks to optimized layout
      let finalElement = layoutOptimization.optimizedElement;
      if (processingOptions.enablePageBreaks && pageBreakAnalysis.recommendedBreaks.length > 0) {
        finalElement = this.pageBreakHandler.applyPageBreaks(finalElement, pageBreakAnalysis);
        stagesCompleted.push('page-break-application');
      }

      // Stage 6: Add headers and footers if configured
      if (processingOptions.headerFooterConfig) {
        finalElement = this.pageBreakHandler.addHeadersAndFooters(
          finalElement,
          processingOptions.headerFooterConfig,
          contentFlow.totalPages
        );
        stagesCompleted.push('header-footer-addition');
      }

      // Stage 7: Final content flow optimization
      if (processingOptions.enablePageBreaks) {
        finalElement = this.pageBreakHandler.optimizeContentFlow(finalElement, contentFlow);
        stagesCompleted.push('content-flow-optimization');
      }

      // Stage 8: Apply custom CSS if provided
      if (processingOptions.customCSS) {
        this.applyCustomCSS(finalElement, processingOptions.customCSS);
        stagesCompleted.push('custom-css-application');
      }

      // Create processing metadata
      const processingMetadata: ProcessingMetadata = {
        totalProcessingTime: Date.now() - startTime,
        stagesCompleted,
        optimizationsApplied,
        warningsGenerated,
        errorsEncountered
      };

      return {
        processedDocument,
        pageBreakAnalysis,
        layoutOptimization,
        contentFlow,
        finalElement,
        validation,
        processingMetadata
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      errorsEncountered.push(errorMessage);
      
      throw new PDFGenerationError(
        `Document processing failed: ${errorMessage}`,
        'content',
        true
      );
    }
  }

  /**
   * Quick process for simple documents (minimal processing)
   */
  async quickProcessDocument(
    element: HTMLElement,
    config: PDFConfiguration
  ): Promise<HTMLElement> {
    try {
      // Basic content extraction and cleaning
      const processedDocument = await this.documentProcessor.extractCVContent(element);
      
      // Basic layout optimization
      const layoutResult = this.layoutOptimizer.optimizeLayout(element, config);
      
      return layoutResult.optimizedElement;
      
    } catch (error) {
      throw new PDFGenerationError(
        `Quick document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'content',
        true
      );
    }
  }

  /**
   * Process document with custom page break points
   */
  async processWithCustomBreaks(
    element: HTMLElement,
    config: PDFConfiguration,
    customBreakPoints: string[]
  ): Promise<HTMLElement> {
    try {
      // Extract content
      const processedDocument = await this.documentProcessor.extractCVContent(element);
      
      // Add custom break points
      this.addCustomBreakPoints(element, customBreakPoints);
      
      // Analyze page breaks with custom points
      const pageBreakAnalysis = this.pageBreakHandler.analyzePageBreaks(
        element,
        processedDocument.structure,
        config
      );
      
      // Apply optimizations
      const layoutResult = this.layoutOptimizer.optimizeLayout(element, config);
      
      // Apply page breaks
      const finalElement = this.pageBreakHandler.applyPageBreaks(
        layoutResult.optimizedElement,
        pageBreakAnalysis
      );
      
      return finalElement;
      
    } catch (error) {
      throw new PDFGenerationError(
        `Custom break processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'content',
        true
      );
    }
  }

  /**
   * Validate document before processing
   */
  validateDocumentForProcessing(element: HTMLElement): ValidationResult {
    return this.documentProcessor.validateContentStructure(element);
  }

  /**
   * Get processing recommendations based on document analysis
   */
  getProcessingRecommendations(element: HTMLElement, config: PDFConfiguration): {
    recommendations: string[];
    estimatedProcessingTime: number;
    complexityScore: number;
  } {
    const recommendations: string[] = [];
    let complexityScore = 1;
    
    // Analyze document complexity
    const elementCount = element.querySelectorAll('*').length;
    const imageCount = element.querySelectorAll('img').length;
    const hasComplexLayouts = element.querySelector('.grid, .flex, [style*="position: absolute"]') !== null;
    
    // Calculate complexity score
    complexityScore += Math.min(elementCount / 100, 3); // Element count factor
    complexityScore += imageCount * 0.5; // Image factor
    if (hasComplexLayouts) complexityScore += 2; // Complex layout factor
    
    // Generate recommendations
    if (elementCount > 200) {
      recommendations.push('Consider enabling page breaks for better performance');
    }
    
    if (imageCount > 5) {
      recommendations.push('Enable image optimization for better file size');
    }
    
    if (hasComplexLayouts) {
      recommendations.push('Enable layout optimization for better PDF compatibility');
    }
    
    if (element.offsetHeight > 2000) {
      recommendations.push('Document is very tall - consider multi-page layout');
    }
    
    // Estimate processing time (in milliseconds)
    const baseTime = 1000; // 1 second base
    const estimatedProcessingTime = baseTime + (complexityScore * 500);
    
    return {
      recommendations,
      estimatedProcessingTime,
      complexityScore
    };
  }

  /**
   * Create processing options based on document characteristics
   */
  createOptimalProcessingOptions(
    element: HTMLElement,
    config: PDFConfiguration
  ): DocumentProcessingOptions {
    const analysis = this.getProcessingRecommendations(element, config);
    
    return {
      enablePageBreaks: element.offsetHeight > 1200 || analysis.complexityScore > 3,
      enableLayoutOptimization: true,
      enableContentValidation: true,
      preserveInteractivity: false,
      headerFooterConfig: undefined // Can be set based on requirements
    };
  }

  // Private helper methods

  /**
   * Apply custom CSS to the processed element
   */
  private applyCustomCSS(element: HTMLElement, customCSS: string): void {
    const style = document.createElement('style');
    style.textContent = customCSS;
    element.appendChild(style);
  }

  /**
   * Add custom break points to the document
   */
  private addCustomBreakPoints(element: HTMLElement, breakPoints: string[]): void {
    breakPoints.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      elements.forEach(el => {
        const breakMarker = document.createElement('div');
        breakMarker.className = 'custom-page-break';
        breakMarker.style.cssText = `
          page-break-before: always;
          break-before: page;
          height: 0;
          margin: 0;
          padding: 0;
        `;
        
        el.parentNode?.insertBefore(breakMarker, el);
      });
    });
  }

  /**
   * Clean up temporary elements and styles
   */
  private cleanupProcessing(element: HTMLElement): void {
    // Remove temporary processing elements
    const tempElements = element.querySelectorAll('.temp-processing, .processing-marker');
    tempElements.forEach(el => el.remove());
    
    // Remove temporary styles
    const tempStyles = element.querySelectorAll('style[data-temp="true"]');
    tempStyles.forEach(style => style.remove());
  }

  /**
   * Create processing summary for debugging
   */
  createProcessingSummary(result: DocumentProcessingResult): string {
    const summary = [
      `Document Processing Summary`,
      `========================`,
      `Total Processing Time: ${result.processingMetadata.totalProcessingTime}ms`,
      `Stages Completed: ${result.processingMetadata.stagesCompleted.join(', ')}`,
      `Optimizations Applied: ${result.processingMetadata.optimizationsApplied}`,
      `Warnings Generated: ${result.processingMetadata.warningsGenerated}`,
      ``,
      `Document Structure:`,
      `- Sections: ${result.processedDocument.structure.sections.length}`,
      `- Estimated Pages: ${result.processedDocument.structure.estimatedPages}`,
      `- Has Images: ${result.processedDocument.structure.hasImages}`,
      `- Has Complex Layouts: ${result.processedDocument.structure.hasComplexLayouts}`,
      ``,
      `Page Break Analysis:`,
      `- Recommended Breaks: ${result.pageBreakAnalysis.recommendedBreaks.length}`,
      `- Page Layout: ${result.pageBreakAnalysis.pageLayout.length} pages`,
      `- Warnings: ${result.pageBreakAnalysis.warnings.length}`,
      ``,
      `Layout Optimization:`,
      `- Adjustments Made: ${result.layoutOptimization.adjustments.length}`,
      `- Scale Factor: ${result.layoutOptimization.metrics.scaleFactor.toFixed(2)}`,
      `- Optimization Time: ${result.layoutOptimization.metrics.optimizationTime}ms`,
      ``,
      `Content Flow:`,
      `- Total Pages: ${result.contentFlow.totalPages}`,
      `- Overflow Strategy: ${result.contentFlow.overflowHandling}`,
      ``
    ];

    if (result.processingMetadata.errorsEncountered.length > 0) {
      summary.push(`Errors Encountered:`);
      result.processingMetadata.errorsEncountered.forEach(error => {
        summary.push(`- ${error}`);
      });
    }

    return summary.join('\n');
  }
}

// Export singleton instance
export const documentProcessingService = new PDFDocumentProcessingService();