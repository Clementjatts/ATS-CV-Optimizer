/**
 * PDF Download Manager Service
 * 
 * Handles secure file download, blob creation, memory cleanup, and user feedback
 * for PDF generation system.
 */

export interface DownloadOptions {
  filename: string;
  showProgress?: boolean;
  autoCleanup?: boolean;
  cleanupDelay?: number;
}

export interface DownloadProgress {
  stage: 'preparing' | 'creating' | 'downloading' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  filename: string;
  fileSize: number;
  downloadTime: number;
  error?: string;
  warnings: string[];
}

/**
 * Secure PDF Download Manager
 * Handles blob creation, download triggering, and memory cleanup
 */
export class PDFDownloadManager {
  private static activeDownloads = new Map<string, { blob: Blob; url: string; timestamp: number }>();
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private static readonly MAX_BLOB_AGE = 300000; // 5 minutes

  /**
   * Initialize the download manager with automatic cleanup
   */
  static initialize(): void {
    if (this.cleanupInterval) {
      return; // Already initialized
    }

    // Set up periodic cleanup of old blobs
    this.cleanupInterval = setInterval(() => {
      this.performPeriodicCleanup();
    }, this.CLEANUP_INTERVAL);

    // Clean up on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.cleanup();
      });

      // Clean up on visibility change (tab switching)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.performPeriodicCleanup();
        }
      });
    }
  }

  /**
   * Download PDF blob with progress tracking and cleanup
   */
  static async downloadPdf(
    pdfBlob: Blob,
    options: DownloadOptions,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<DownloadResult> {
    const startTime = Date.now();
    const downloadId = this.generateDownloadId();
    const warnings: string[] = [];

    try {
      // Validate inputs
      this.validateDownloadInputs(pdfBlob, options);

      // Report progress: Preparing
      this.reportProgress(onProgress, {
        stage: 'preparing',
        progress: 10,
        message: 'Preparing download...'
      });

      // Create secure blob URL
      const blobUrl = this.createSecureBlobUrl(pdfBlob, downloadId);

      // Report progress: Creating
      this.reportProgress(onProgress, {
        stage: 'creating',
        progress: 30,
        message: 'Creating download link...'
      });

      // Validate filename security
      const secureFilename = this.validateAndSecureFilename(options.filename);
      if (secureFilename !== options.filename) {
        warnings.push('Filename was modified for security reasons');
      }

      // Report progress: Downloading
      this.reportProgress(onProgress, {
        stage: 'downloading',
        progress: 60,
        message: 'Starting download...'
      });

      // Trigger download
      await this.triggerSecureDownload(blobUrl, secureFilename);

      // Report progress: Complete
      this.reportProgress(onProgress, {
        stage: 'complete',
        progress: 100,
        message: 'Download completed successfully'
      });

      // Schedule cleanup if auto-cleanup is enabled
      if (options.autoCleanup !== false) {
        const cleanupDelay = options.cleanupDelay || 5000; // 5 seconds default
        setTimeout(() => {
          this.cleanupDownload(downloadId);
        }, cleanupDelay);
      }

      const downloadTime = Date.now() - startTime;

      return {
        success: true,
        filename: secureFilename,
        fileSize: pdfBlob.size,
        downloadTime,
        warnings
      };

    } catch (error) {
      // Report error
      this.reportProgress(onProgress, {
        stage: 'error',
        progress: 0,
        message: 'Download failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Clean up on error
      this.cleanupDownload(downloadId);

      const downloadTime = Date.now() - startTime;

      return {
        success: false,
        filename: options.filename,
        fileSize: pdfBlob.size,
        downloadTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        warnings
      };
    }
  }

  /**
   * Create a secure blob URL with tracking
   */
  private static createSecureBlobUrl(blob: Blob, downloadId: string): string {
    // Validate blob
    if (!blob || blob.size === 0) {
      throw new Error('Invalid or empty blob provided');
    }

    // Check blob size limits (prevent memory issues)
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (blob.size > maxSize) {
      throw new Error(`File size (${this.formatFileSize(blob.size)}) exceeds maximum allowed size (${this.formatFileSize(maxSize)})`);
    }

    // Create blob URL
    const blobUrl = URL.createObjectURL(blob);

    // Track the blob for cleanup
    this.activeDownloads.set(downloadId, {
      blob,
      url: blobUrl,
      timestamp: Date.now()
    });

    return blobUrl;
  }

  /**
   * Trigger secure download using various methods
   */
  private static async triggerSecureDownload(blobUrl: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Method 1: Try using anchor element (most compatible)
        const anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = filename;
        anchor.style.display = 'none';

        // Add to DOM temporarily
        document.body.appendChild(anchor);

        // Create click event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });

        // Trigger download
        anchor.dispatchEvent(clickEvent);

        // Clean up anchor element
        setTimeout(() => {
          document.body.removeChild(anchor);
          resolve();
        }, 100);

      } catch (error) {
        // Fallback method: Direct window.open
        try {
          const newWindow = window.open(blobUrl, '_blank');
          if (!newWindow) {
            throw new Error('Popup blocked or failed to open');
          }
          resolve();
        } catch (fallbackError) {
          reject(new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }
    });
  }

  /**
   * Validate and secure filename
   */
  private static validateAndSecureFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return 'document.pdf';
    }

    // Remove path traversal attempts
    let secure = filename.replace(/[/\\:*?"<>|]/g, '_');

    // Remove leading dots and spaces
    secure = secure.replace(/^[.\s]+/, '');

    // Ensure it ends with .pdf
    if (!secure.toLowerCase().endsWith('.pdf')) {
      secure += '.pdf';
    }

    // Limit length
    if (secure.length > 100) {
      const extension = '.pdf';
      secure = secure.substring(0, 100 - extension.length) + extension;
    }

    // Fallback if empty
    if (!secure || secure === '.pdf') {
      secure = 'document.pdf';
    }

    return secure;
  }

  /**
   * Validate download inputs
   */
  private static validateDownloadInputs(blob: Blob, options: DownloadOptions): void {
    if (!blob) {
      throw new Error('PDF blob is required');
    }

    if (!(blob instanceof Blob)) {
      throw new Error('Invalid blob object provided');
    }

    if (!options.filename) {
      throw new Error('Filename is required');
    }

    // Check if browser supports required APIs
    if (typeof URL.createObjectURL !== 'function') {
      throw new Error('Browser does not support blob URLs');
    }

    if (typeof document.createElement !== 'function') {
      throw new Error('Browser does not support DOM manipulation');
    }
  }

  /**
   * Report progress to callback
   */
  private static reportProgress(
    onProgress: ((progress: DownloadProgress) => void) | undefined,
    progress: DownloadProgress
  ): void {
    if (onProgress && typeof onProgress === 'function') {
      try {
        onProgress(progress);
      } catch (error) {
        console.warn('Error in progress callback:', error);
      }
    }
  }

  /**
   * Generate unique download ID
   */
  private static generateDownloadId(): string {
    return `download_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up specific download
   */
  static cleanupDownload(downloadId: string): void {
    const download = this.activeDownloads.get(downloadId);
    if (download) {
      try {
        URL.revokeObjectURL(download.url);
      } catch (error) {
        console.warn('Error revoking blob URL:', error);
      }
      this.activeDownloads.delete(downloadId);
    }
  }

  /**
   * Perform periodic cleanup of old downloads
   */
  private static performPeriodicCleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, download] of this.activeDownloads.entries()) {
      if (now - download.timestamp > this.MAX_BLOB_AGE) {
        toDelete.push(id);
      }
    }

    toDelete.forEach(id => this.cleanupDownload(id));

    if (toDelete.length > 0) {
      console.log(`Cleaned up ${toDelete.length} old download(s)`);
    }
  }

  /**
   * Clean up all active downloads
   */
  static cleanup(): void {
    for (const [id] of this.activeDownloads.entries()) {
      this.cleanupDownload(id);
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get memory usage statistics
   */
  static getMemoryStats(): {
    activeDownloads: number;
    totalBlobSize: number;
    oldestDownload: number | null;
  } {
    let totalSize = 0;
    let oldestTimestamp: number | null = null;

    for (const download of this.activeDownloads.values()) {
      totalSize += download.blob.size;
      if (oldestTimestamp === null || download.timestamp < oldestTimestamp) {
        oldestTimestamp = download.timestamp;
      }
    }

    return {
      activeDownloads: this.activeDownloads.size,
      totalBlobSize: totalSize,
      oldestDownload: oldestTimestamp
    };
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if download is supported in current environment
   */
  static isDownloadSupported(): boolean {
    try {
      return (
        typeof URL !== 'undefined' &&
        typeof URL.createObjectURL === 'function' &&
        typeof document !== 'undefined' &&
        typeof document.createElement === 'function'
      );
    } catch {
      return false;
    }
  }

  /**
   * Get download capabilities
   */
  static getDownloadCapabilities(): {
    supportsBlob: boolean;
    supportsAnchorDownload: boolean;
    supportsWindowOpen: boolean;
    maxBlobSize: number;
  } {
    return {
      supportsBlob: typeof Blob !== 'undefined',
      supportsAnchorDownload: typeof document !== 'undefined' && 'download' in document.createElement('a'),
      supportsWindowOpen: typeof window !== 'undefined' && typeof window.open === 'function',
      maxBlobSize: 50 * 1024 * 1024 // 50MB
    };
  }
}

/**
 * Convenience function for simple PDF downloads
 */
export async function downloadPdf(
  pdfBlob: Blob,
  filename: string,
  onProgress?: (progress: DownloadProgress) => void
): Promise<DownloadResult> {
  // Initialize manager if not already done
  PDFDownloadManager.initialize();

  return PDFDownloadManager.downloadPdf(
    pdfBlob,
    { filename, showProgress: true, autoCleanup: true },
    onProgress
  );
}

/**
 * Initialize download manager (call once in app startup)
 */
export function initializeDownloadManager(): void {
  PDFDownloadManager.initialize();
}

/**
 * Clean up all downloads (call on app shutdown)
 */
export function cleanupAllDownloads(): void {
  PDFDownloadManager.cleanup();
}