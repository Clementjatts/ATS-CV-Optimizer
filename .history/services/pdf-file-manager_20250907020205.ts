/**
 * PDF File Manager Service
 * 
 * Integrates filename generation and download management for complete
 * file handling workflow in the PDF generation system.
 */

import { CvData } from './geminiService';
import { PDFFilenameGenerator, FilenameOptions, FilenameResult } from './pdf-filename-generator';
import { PDFDownloadManager, DownloadOptions, DownloadProgress, DownloadResult } from './pdf-download-manager';

export interface FileManagerOptions {
  filename?: FilenameOptions;
  download?: DownloadOptions;
  onProgress?: (progress: DownloadProgress) => void;
}

export interface FileManagerResult {
  success: boolean;
  filename: string;
  fileSize: number;
  downloadTime: number;
  filenameGeneration: FilenameResult;
  downloadResult: DownloadResult;
  error?: string;
}

/**
 * Complete PDF File Management Service
 * Handles the entire workflow from filename generation to secure download
 */
export class PDFFileManager {
  private static initialized = false;

  /**
   * Initialize the file manager
   */
  static initialize(): void {
    if (this.initialized) {
      return;
    }

    // Initialize download manager
    PDFDownloadManager.initialize();
    this.initialized = true;
  }

  /**
   * Complete file management workflow: generate filename and download PDF
   */
  static async handlePdfFile(
    pdfBlob: Blob,
    cvData: CvData,
    options: FileManagerOptions = {}
  ): Promise<FileManagerResult> {
    // Ensure initialization
    this.initialize();

    const startTime = Date.now();

    try {
      // Step 1: Generate professional filename
      const filenameResult = PDFFilenameGenerator.generateFilename(
        cvData,
        options.filename || {}
      );

      // Report progress: Filename generated
      if (options.onProgress) {
        options.onProgress({
          stage: 'preparing',
          progress: 20,
          message: `Generated filename: ${filenameResult.filename}`
        });
      }

      // Step 2: Prepare download options
      const downloadOptions: DownloadOptions = {
        filename: filenameResult.filename,
        showProgress: true,
        autoCleanup: true,
        ...options.download
      };

      // Step 3: Execute secure download
      const downloadResult = await PDFDownloadManager.downloadPdf(
        pdfBlob,
        downloadOptions,
        options.onProgress
      );

      const totalTime = Date.now() - startTime;

      return {
        success: downloadResult.success,
        filename: downloadResult.filename,
        fileSize: downloadResult.fileSize,
        downloadTime: totalTime,
        filenameGeneration: filenameResult,
        downloadResult,
        error: downloadResult.error
      };

    } catch (error) {
      const totalTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Report error progress
      if (options.onProgress) {
        options.onProgress({
          stage: 'error',
          progress: 0,
          message: 'File management failed',
          error: errorMessage
        });
      }

      return {
        success: false,
        filename: 'unknown',
        fileSize: pdfBlob.size,
        downloadTime: totalTime,
        filenameGeneration: {
          filename: 'error.pdf',
          sanitized: false,
          truncated: false,
          warnings: ['File management failed']
        },
        downloadResult: {
          success: false,
          filename: 'error.pdf',
          fileSize: pdfBlob.size,
          downloadTime: totalTime,
          error: errorMessage,
          warnings: []
        },
        error: errorMessage
      };
    }
  }

  /**
   * Generate filename only (without download)
   */
  static generateFilename(cvData: CvData, options: FilenameOptions = {}): FilenameResult {
    return PDFFilenameGenerator.generateFilename(cvData, options);
  }

  /**
   * Download PDF with existing filename (without generation)
   */
  static async downloadPdf(
    pdfBlob: Blob,
    filename: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    this.initialize();
    return PDFDownloadManager.downloadPdf(
      pdfBlob,
      { filename },
      onProgress
    );
  }

  /**
   * Validate CV data for filename generation
   */
  static validateCvData(cvData: CvData): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for required fields
    if (!cvData.fullName || cvData.fullName.trim().length === 0) {
      issues.push('Full name is missing or empty');
      suggestions.push('Provide a full name for professional filename generation');
    }

    // Check name quality
    if (cvData.fullName && cvData.fullName.trim().length < 2) {
      issues.push('Full name is too short');
      suggestions.push('Provide a complete name with at least first and last name');
    }

    // Check for special characters that might cause issues
    if (cvData.fullName && /[<>:"/\\|?*]/.test(cvData.fullName)) {
      issues.push('Full name contains characters that will be sanitized');
      suggestions.push('Consider using standard alphabetic characters in the name');
    }

    // Check contact info as fallback
    if ((!cvData.fullName || cvData.fullName.trim().length === 0) && 
        (!cvData.contactInfo?.email || cvData.contactInfo.email.trim().length === 0)) {
      issues.push('No fallback information available for filename generation');
      suggestions.push('Provide either a full name or email address');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Get system capabilities for file management
   */
  static getCapabilities(): {
    canGenerateFilenames: boolean;
    canDownloadFiles: boolean;
    downloadCapabilities: any;
    memoryStats: any;
  } {
    return {
      canGenerateFilenames: true, // Always available
      canDownloadFiles: PDFDownloadManager.isDownloadSupported(),
      downloadCapabilities: PDFDownloadManager.getDownloadCapabilities(),
      memoryStats: PDFDownloadManager.getMemoryStats()
    };
  }

  /**
   * Clean up all file management resources
   */
  static cleanup(): void {
    PDFDownloadManager.cleanup();
    this.initialized = false;
  }

  /**
   * Get recommended filename options based on CV data
   */
  static getRecommendedFilenameOptions(cvData: CvData): FilenameOptions {
    const validation = this.validateCvData(cvData);
    
    return {
      maxLength: 80, // Conservative length for compatibility
      includeDate: false, // Usually not needed for CVs
      customSuffix: '', // Keep it simple
      format: validation.isValid ? 'standard' : 'detailed' // Use detailed if name is complex
    };
  }

  /**
   * Get recommended download options
   */
  static getRecommendedDownloadOptions(): DownloadOptions {
    return {
      filename: '', // Will be set by filename generator
      showProgress: true,
      autoCleanup: true,
      cleanupDelay: 5000 // 5 seconds
    };
  }
}

/**
 * Convenience function for complete PDF file handling
 */
export async function handlePdfFile(
  pdfBlob: Blob,
  cvData: CvData,
  onProgress?: (progress: DownloadProgress) => void
): Promise<FileManagerResult> {
  const options: FileManagerOptions = {
    filename: PDFFileManager.getRecommendedFilenameOptions(cvData),
    download: PDFFileManager.getRecommendedDownloadOptions(),
    onProgress
  };

  return PDFFileManager.handlePdfFile(pdfBlob, cvData, options);
}

/**
 * Initialize file manager (call once in app startup)
 */
export function initializePdfFileManager(): void {
  PDFFileManager.initialize();
}

/**
 * Clean up file manager (call on app shutdown)
 */
export function cleanupPdfFileManager(): void {
  PDFFileManager.cleanup();
}