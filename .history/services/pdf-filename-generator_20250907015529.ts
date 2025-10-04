/**
 * PDF Filename Generation Service
 * 
 * Provides professional filename generation for CV PDFs with proper sanitization,
 * length optimization, and cross-platform compatibility.
 */

import { CvData } from './geminiService';

export interface FilenameOptions {
  maxLength?: number;
  includeDate?: boolean;
  customSuffix?: string;
  format?: 'standard' | 'detailed';
}

export interface FilenameResult {
  filename: string;
  sanitized: boolean;
  truncated: boolean;
  warnings: string[];
}

/**
 * Professional PDF Filename Generator
 * Handles name extraction, sanitization, and cross-platform compatibility
 */
export class PDFFilenameGenerator {
  private static readonly DEFAULT_MAX_LENGTH = 100;
  private static readonly MIN_LENGTH = 10;
  private static readonly RESERVED_NAMES = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];

  /**
   * Generate a professional filename from CV data
   */
  static generateFilename(cvData: CvData, options: FilenameOptions = {}): FilenameResult {
    const {
      maxLength = this.DEFAULT_MAX_LENGTH,
      includeDate = false,
      customSuffix = '',
      format = 'standard'
    } = options;

    const warnings: string[] = [];
    let sanitized = false;
    let truncated = false;

    try {
      // Extract and process name components
      const nameComponents = this.extractNameComponents(cvData.fullName);
      
      if (!nameComponents.firstName && !nameComponents.lastName) {
        warnings.push('No valid name found, using fallback filename');
        return {
          filename: this.generateFallbackFilename(includeDate),
          sanitized: true,
          truncated: false,
          warnings
        };
      }

      // Build base filename
      let baseFilename = this.buildBaseFilename(nameComponents, format);
      
      // Add custom suffix if provided
      if (customSuffix) {
        baseFilename += `_${this.sanitizeComponent(customSuffix)}`;
      }

      // Add date if requested
      if (includeDate) {
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        baseFilename += `_${dateStr}`;
      }

      // Add CV suffix
      baseFilename += '_CV';

      // Sanitize the filename
      const sanitizedFilename = this.sanitizeFilename(baseFilename);
      if (sanitizedFilename !== baseFilename) {
        sanitized = true;
        warnings.push('Filename contained invalid characters and was sanitized');
      }

      // Handle length optimization
      let finalFilename = sanitizedFilename;
      const extension = '.pdf';
      const maxBaseLength = maxLength - extension.length;

      if (finalFilename.length > maxBaseLength) {
        finalFilename = this.optimizeLength(finalFilename, maxBaseLength);
        truncated = true;
        warnings.push('Filename was truncated to meet length requirements');
      }

      // Validate and ensure minimum length
      finalFilename = this.ensureMinimumLength(finalFilename);

      // Final validation
      const validatedFilename = this.validateFilename(finalFilename + extension);

      return {
        filename: validatedFilename,
        sanitized,
        truncated,
        warnings
      };

    } catch (error) {
      warnings.push(`Error generating filename: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        filename: this.generateFallbackFilename(includeDate),
        sanitized: true,
        truncated: false,
        warnings
      };
    }
  }

  /**
   * Extract name components from full name string
   */
  private static extractNameComponents(fullName: string): { firstName: string; lastName: string; middleName?: string } {
    if (!fullName || typeof fullName !== 'string') {
      return { firstName: '', lastName: '' };
    }

    // Clean and normalize the name
    const cleanName = fullName
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\-'\.]/g, '') // Remove special characters except hyphens, apostrophes, and dots
      .trim();

    const nameParts = cleanName.split(' ').filter(part => part.length > 0);

    if (nameParts.length === 0) {
      return { firstName: '', lastName: '' };
    }

    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: '' };
    }

    if (nameParts.length === 2) {
      return { firstName: nameParts[0], lastName: nameParts[1] };
    }

    // For 3+ parts, use first as firstName, last as lastName, middle parts as middleName
    return {
      firstName: nameParts[0],
      lastName: nameParts[nameParts.length - 1],
      middleName: nameParts.slice(1, -1).join(' ')
    };
  }

  /**
   * Build base filename from name components
   */
  private static buildBaseFilename(
    nameComponents: { firstName: string; lastName: string; middleName?: string },
    format: 'standard' | 'detailed'
  ): string {
    const { firstName, lastName, middleName } = nameComponents;

    if (format === 'detailed' && middleName) {
      // Include middle name/initial for detailed format
      const middleInitial = middleName.split(' ')[0].charAt(0);
      return `${firstName}_${middleInitial}_${lastName}`;
    }

    // Standard format: FirstName_LastName
    if (firstName && lastName) {
      return `${firstName}_${lastName}`;
    }

    // Fallback to available name
    return firstName || lastName || 'CV';
  }

  /**
   * Sanitize filename component
   */
  private static sanitizeComponent(component: string): string {
    return component
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^\w\-_.]/g, '') // Keep only alphanumeric, hyphens, underscores, and dots
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^[._\-]+|[._\-]+$/g, ''); // Remove leading/trailing dots, underscores, hyphens
  }

  /**
   * Sanitize complete filename
   */
  private static sanitizeFilename(filename: string): string {
    // Apply component sanitization
    let sanitized = this.sanitizeComponent(filename);

    // Ensure it doesn't start with a dot (hidden file)
    if (sanitized.startsWith('.')) {
      sanitized = sanitized.substring(1);
    }

    // Handle reserved names (Windows)
    const upperFilename = sanitized.toUpperCase();
    if (this.RESERVED_NAMES.includes(upperFilename)) {
      sanitized = `${sanitized}_CV`;
    }

    return sanitized || 'CV';
  }

  /**
   * Optimize filename length while preserving readability
   */
  private static optimizeLength(filename: string, maxLength: number): string {
    if (filename.length <= maxLength) {
      return filename;
    }

    const parts = filename.split('_');
    
    // Strategy 1: Truncate middle parts first
    if (parts.length > 2) {
      // Keep first and last parts, truncate middle
      const firstPart = parts[0];
      const lastPart = parts[parts.length - 1];
      const middleParts = parts.slice(1, -1);
      
      let truncatedMiddle = middleParts.join('_');
      const fixedLength = firstPart.length + lastPart.length + 2; // +2 for underscores
      const availableMiddleLength = maxLength - fixedLength;
      
      if (availableMiddleLength > 0 && truncatedMiddle.length > availableMiddleLength) {
        truncatedMiddle = truncatedMiddle.substring(0, availableMiddleLength);
      }
      
      const result = `${firstPart}_${truncatedMiddle}_${lastPart}`;
      if (result.length <= maxLength) {
        return result;
      }
    }

    // Strategy 2: Truncate from the end
    return filename.substring(0, maxLength);
  }

  /**
   * Ensure filename meets minimum length requirements
   */
  private static ensureMinimumLength(filename: string): string {
    if (filename.length >= this.MIN_LENGTH) {
      return filename;
    }

    // Pad with CV suffix if too short
    return `${filename}_CV`.substring(0, Math.max(filename.length, this.MIN_LENGTH));
  }

  /**
   * Validate final filename
   */
  private static validateFilename(filename: string): string {
    // Final safety check
    if (!filename || filename.length === 0) {
      return this.generateFallbackFilename();
    }

    // Ensure it ends with .pdf
    if (!filename.toLowerCase().endsWith('.pdf')) {
      return filename + '.pdf';
    }

    return filename;
  }

  /**
   * Generate fallback filename when name extraction fails
   */
  private static generateFallbackFilename(includeDate: boolean = false): string {
    const timestamp = includeDate 
      ? `_${new Date().toISOString().split('T')[0].replace(/-/g, '')}`
      : '';
    
    return `CV${timestamp}.pdf`;
  }

  /**
   * Validate cross-platform filename compatibility
   */
  static validateCrossPlatformCompatibility(filename: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check length (Windows has 260 char path limit, but filename should be much shorter)
    if (filename.length > 100) {
      issues.push('Filename is too long for optimal compatibility');
      suggestions.push('Consider shortening the filename');
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) {
      issues.push('Contains invalid characters for Windows compatibility');
      suggestions.push('Remove or replace invalid characters: < > : " / \\ | ? *');
    }

    // Check for reserved names
    const baseName = filename.replace(/\.[^/.]+$/, '').toUpperCase();
    if (this.RESERVED_NAMES.includes(baseName)) {
      issues.push('Uses a reserved filename in Windows');
      suggestions.push('Add a suffix to avoid reserved name conflict');
    }

    // Check for leading/trailing spaces or dots
    if (filename !== filename.trim()) {
      issues.push('Contains leading or trailing spaces');
      suggestions.push('Remove leading and trailing spaces');
    }

    if (filename.startsWith('.')) {
      issues.push('Starts with a dot (hidden file on Unix systems)');
      suggestions.push('Remove leading dot or add prefix');
    }

    // Check for multiple consecutive dots
    if (/\.{2,}/.test(filename)) {
      issues.push('Contains multiple consecutive dots');
      suggestions.push('Replace multiple dots with single dots');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Extract name from CV data with fallback strategies
   */
  static extractNameFromCvData(cvData: CvData): string {
    // Primary: Use fullName
    if (cvData.fullName && cvData.fullName.trim()) {
      return cvData.fullName.trim();
    }

    // Fallback: Try to construct from contact info or other fields
    if (cvData.contactInfo?.email) {
      const emailName = cvData.contactInfo.email.split('@')[0];
      // Convert email username to readable name (basic heuristic)
      return emailName
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
        .trim();
    }

    // Last resort: Use generic name
    return 'Professional';
  }
}

/**
 * Convenience function for quick filename generation
 */
export function generatePdfFilename(
  cvData: CvData, 
  options: FilenameOptions = {}
): string {
  const result = PDFFilenameGenerator.generateFilename(cvData, options);
  return result.filename;
}

/**
 * Validate if a filename is suitable for PDF generation
 */
export function validatePdfFilename(filename: string): boolean {
  const validation = PDFFilenameGenerator.validateCrossPlatformCompatibility(filename);
  return validation.isValid;
}