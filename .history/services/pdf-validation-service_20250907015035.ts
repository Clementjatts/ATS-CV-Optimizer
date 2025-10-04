// PDF Validation and Compliance Checking Service

import { QualityMetrics, ValidationResult, GenerationResult } from '../types/pdf';

// Browser environment type definitions
interface HTMLElement {
  getBoundingClientRect(): { width: number; height: number; top: number; left: number; bottom: number; right: number };
  textContent: string | null;
}

export interface PDFValidationOptions {
  checkCompliance: boolean;
  validateTextExtraction: boolean;
  checkLayoutIntegrity: boolean;
  validateFileSize: boolean;
  maxFileSize: number; // in bytes
  requiredStandards: string[];
}

export interface ComplianceCheckResult {
  isPDFACompliant: boolean;
  version: string;
  errors: string[];
  warnings: string[];
}

export interface TextExtractionResult {
  extractable: boolean;
  textContent: string;
  extractionScore: number; // 0-1
  issues: string[];
}

export interface LayoutIntegrityResult {
  isValid: boolean;
  fidelityScore: number; // 0-1
  issues: string[];
  pageCount: number;
  dimensions: { width: number; height: number };
}

export interface FileSizeValidationResult {
  isValid: boolean;
  actualSize: number;
  maxAllowedSize: number;
  compressionRatio: number;
  optimizationSuggestions: string[];
}

export class PDFValidationService {
  private readonly defaultOptions: PDFValidationOptions = {
    checkCompliance: true,
    validateTextExtraction: true,
    checkLayoutIntegrity: true,
    validateFileSize: true,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    requiredStandards: ['PDF/A-1b', 'PDF-1.4']
  };

  /**
   * Validates a generated PDF blob against quality and compliance standards
   */
  async validatePDF(
    pdfBlob: Blob, 
    originalElement?: HTMLElement,
    options: Partial<PDFValidationOptions> = {}
  ): Promise<ValidationResult> {
    const validationOptions = { ...this.defaultOptions, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      // File size validation
      if (validationOptions.validateFileSize) {
        const sizeResult = await this.validateFileSize(pdfBlob, validationOptions.maxFileSize);
        if (!sizeResult.isValid) {
          errors.push(`File size ${sizeResult.actualSize} bytes exceeds maximum ${sizeResult.maxAllowedSize} bytes`);
        }
        suggestions.push(...sizeResult.optimizationSuggestions);
      }

      // PDF/A compliance checking
      if (validationOptions.checkCompliance) {
        const complianceResult = await this.checkPDFACompliance(pdfBlob, validationOptions.requiredStandards);
        if (!complianceResult.isPDFACompliant) {
          errors.push(...complianceResult.errors);
        }
        warnings.push(...complianceResult.warnings);
      }

      // Text extraction validation
      if (validationOptions.validateTextExtraction) {
        const textResult = await this.validateTextExtraction(pdfBlob);
        if (!textResult.extractable || textResult.extractionScore < 0.8) {
          errors.push(`Poor text extractability: ${textResult.extractionScore.toFixed(2)}`);
        }
        if (textResult.issues.length > 0) {
          warnings.push(...textResult.issues);
        }
      }

      // Layout integrity validation
      if (validationOptions.checkLayoutIntegrity && originalElement) {
        const layoutResult = await this.validateLayoutIntegrity(pdfBlob, originalElement);
        if (!layoutResult.isValid || layoutResult.fidelityScore < 0.9) {
          errors.push(`Layout fidelity issues detected: ${layoutResult.fidelityScore.toFixed(2)}`);
        }
        warnings.push(...layoutResult.issues);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        suggestions
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        suggestions: ['Try regenerating the PDF with different settings']
      };
    }
  }

  /**
   * Checks PDF/A compliance for ATS compatibility
   */
  private async checkPDFACompliance(
    pdfBlob: Blob, 
    requiredStandards: string[]
  ): Promise<ComplianceCheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Convert blob to ArrayBuffer for analysis
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);

      // Check PDF header
      const header = new TextDecoder().decode(pdfData.slice(0, 8));
      if (!header.startsWith('%PDF-')) {
        errors.push('Invalid PDF header');
        return { isPDFACompliant: false, version: 'unknown', errors, warnings };
      }

      // Extract PDF version
      const version = header.substring(5, 8);
      
      // Basic PDF/A compliance checks
      const pdfString = new TextDecoder('latin1').decode(pdfData);
      
      // Check for required PDF/A elements
      if (!pdfString.includes('/Type /Catalog')) {
        errors.push('Missing document catalog');
      }

      if (!pdfString.includes('/Metadata')) {
        warnings.push('Missing XMP metadata (recommended for PDF/A)');
      }

      // Check for embedded fonts (required for PDF/A)
      const fontPattern = /\/Type\s*\/Font/g;
      const fonts = pdfString.match(fontPattern);
      if (fonts && fonts.length > 0) {
        // Check if fonts are embedded
        if (!pdfString.includes('/FontDescriptor')) {
          warnings.push('Fonts may not be properly embedded');
        }
      }

      // Check for transparency (not allowed in PDF/A-1)
      if (pdfString.includes('/SMask') || pdfString.includes('/ca ') || pdfString.includes('/CA ')) {
        if (requiredStandards.includes('PDF/A-1b')) {
          errors.push('Transparency detected (not allowed in PDF/A-1)');
        }
      }

      // Check for multimedia content (not allowed in PDF/A)
      if (pdfString.includes('/Type /Movie') || pdfString.includes('/Type /Sound')) {
        errors.push('Multimedia content detected (not allowed in PDF/A)');
      }

      return {
        isPDFACompliant: errors.length === 0,
        version,
        errors,
        warnings
      };

    } catch (error) {
      return {
        isPDFACompliant: false,
        version: 'unknown',
        errors: [`Compliance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Validates text extractability for ATS systems
   */
  private async validateTextExtraction(pdfBlob: Blob): Promise<TextExtractionResult> {
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdfString = new TextDecoder('latin1').decode(pdfData);

      const issues: string[] = [];
      let extractionScore = 1.0;

      // Look for text objects in PDF
      const textObjectPattern = /BT\s+.*?ET/gs;
      const textObjects = pdfString.match(textObjectPattern) || [];

      if (textObjects.length === 0) {
        issues.push('No text objects found in PDF');
        extractionScore = 0;
      }

      // Check for proper text encoding
      const unicodePattern = /\/ToUnicode/g;
      const unicodeMaps = pdfString.match(unicodePattern) || [];
      
      if (textObjects.length > 0 && unicodeMaps.length === 0) {
        issues.push('Text may not have proper Unicode mapping');
        extractionScore *= 0.7;
      }

      // Extract visible text content
      let textContent = '';
      const tjPattern = /\[(.*?)\]\s*TJ/g;
      const tjMatches = pdfString.matchAll(tjPattern);
      
      for (const match of tjMatches) {
        textContent += match[1] + ' ';
      }

      // Check for text rendered as images
      const imagePattern = /\/Type\s*\/XObject.*?\/Subtype\s*\/Image/gs;
      const images = pdfString.match(imagePattern) || [];
      
      if (images.length > textObjects.length) {
        issues.push('Document may contain text rendered as images');
        extractionScore *= 0.5;
      }

      // Check text content quality
      if (textContent.trim().length === 0) {
        issues.push('No extractable text content found');
        extractionScore = 0;
      } else if (textContent.length < 50) {
        issues.push('Very little text content detected');
        extractionScore *= 0.8;
      }

      return {
        extractable: extractionScore > 0.5,
        textContent: textContent.trim(),
        extractionScore,
        issues
      };

    } catch (error) {
      return {
        extractable: false,
        textContent: '',
        extractionScore: 0,
        issues: [`Text extraction validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validates layout integrity by comparing with original element
   */
  private async validateLayoutIntegrity(
    pdfBlob: Blob, 
    originalElement: HTMLElement
  ): Promise<LayoutIntegrityResult> {
    try {
      const issues: string[] = [];
      let fidelityScore = 1.0;

      // Get original element dimensions and content
      const originalRect = originalElement.getBoundingClientRect();
      const originalText = originalElement.textContent || '';

      // Basic PDF structure validation
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdfString = new TextDecoder('latin1').decode(pdfData);

      // Count pages
      const pagePattern = /\/Type\s*\/Page(?!\s*\/Parent)/g;
      const pages = pdfString.match(pagePattern) || [];
      const pageCount = pages.length;

      if (pageCount === 0) {
        issues.push('No pages found in PDF');
        fidelityScore = 0;
      }

      // Extract PDF dimensions
      const mediaBoxPattern = /\/MediaBox\s*\[\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\]/;
      const mediaBoxMatch = pdfString.match(mediaBoxPattern);
      
      let pdfDimensions = { width: 612, height: 792 }; // Default letter size
      if (mediaBoxMatch) {
        pdfDimensions = {
          width: parseFloat(mediaBoxMatch[3]) - parseFloat(mediaBoxMatch[1]),
          height: parseFloat(mediaBoxMatch[4]) - parseFloat(mediaBoxMatch[2])
        };
      }

      // Check aspect ratio consistency
      const originalAspectRatio = originalRect.width / originalRect.height;
      const pdfAspectRatio = pdfDimensions.width / pdfDimensions.height;
      
      if (Math.abs(originalAspectRatio - pdfAspectRatio) > 0.2) {
        issues.push('Significant aspect ratio difference between original and PDF');
        fidelityScore *= 0.8;
      }

      // Validate text content preservation
      const textExtractionResult = await this.validateTextExtraction(pdfBlob);
      const extractedText = textExtractionResult.textContent;
      
      if (originalText.length > 0) {
        const textSimilarity = this.calculateTextSimilarity(originalText, extractedText);
        if (textSimilarity < 0.9) {
          issues.push(`Text content similarity low: ${textSimilarity.toFixed(2)}`);
          fidelityScore *= textSimilarity;
        }
      }

      // Check for proper page structure
      if (pageCount > 1) {
        // Multi-page document should have proper page breaks
        if (!pdfString.includes('/Parent')) {
          issues.push('Multi-page document may have structural issues');
          fidelityScore *= 0.9;
        }
      }

      return {
        isValid: fidelityScore > 0.8,
        fidelityScore,
        issues,
        pageCount,
        dimensions: pdfDimensions
      };

    } catch (error) {
      return {
        isValid: false,
        fidelityScore: 0,
        issues: [`Layout integrity validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        pageCount: 0,
        dimensions: { width: 0, height: 0 }
      };
    }
  }

  /**
   * Validates file size and provides optimization suggestions
   */
  private async validateFileSize(
    pdfBlob: Blob, 
    maxSize: number
  ): Promise<FileSizeValidationResult> {
    const actualSize = pdfBlob.size;
    const isValid = actualSize <= maxSize;
    const compressionRatio = actualSize / maxSize;

    const optimizationSuggestions: string[] = [];

    if (!isValid) {
      optimizationSuggestions.push('Consider reducing image quality');
      optimizationSuggestions.push('Enable text compression');
      optimizationSuggestions.push('Optimize font embedding');
      
      if (compressionRatio > 2) {
        optimizationSuggestions.push('File is significantly oversized - consider content reduction');
      }
    } else if (actualSize > maxSize * 0.8) {
      optimizationSuggestions.push('File size is close to limit - consider optimization');
    }

    return {
      isValid,
      actualSize,
      maxAllowedSize: maxSize,
      compressionRatio,
      optimizationSuggestions
    };
  }

  /**
   * Calculates text similarity between original and extracted text
   */
  private calculateTextSimilarity(original: string, extracted: string): number {
    // Normalize text for comparison
    const normalize = (text: string) => 
      text.toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '')
          .trim();

    const normalizedOriginal = normalize(original);
    const normalizedExtracted = normalize(extracted);

    if (normalizedOriginal.length === 0 && normalizedExtracted.length === 0) {
      return 1.0;
    }

    if (normalizedOriginal.length === 0 || normalizedExtracted.length === 0) {
      return 0.0;
    }

    // Simple Levenshtein distance-based similarity
    const maxLength = Math.max(normalizedOriginal.length, normalizedExtracted.length);
    const distance = this.levenshteinDistance(normalizedOriginal, normalizedExtracted);
    
    return Math.max(0, 1 - (distance / maxLength));
  }

  /**
   * Calculates Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}