import { CvData } from './geminiService';

export interface PdfGenerationOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  image?: {
    type?: 'jpeg' | 'png';
    quality?: number;
  };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    letterRendering?: boolean;
  };
  jsPDF?: {
    unit?: string;
    format?: string;
    orientation?: 'portrait' | 'landscape';
  };
  pagebreak?: {
    mode?: string | string[];
  };
}

export interface PdfGenerationResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  error?: string;
}

class PdfService {
  /**
   * Generate PDF from CV container element
   */
  async generatePdf(
    element: HTMLElement,
    options: PdfGenerationOptions = {},
    jobTitle?: string
  ): Promise<PdfGenerationResult> {
    try {
      // Reset scroll position to prevent blank pages
      window.scrollTo(0, 0);

      // Wait for any dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 200));

      // Default options with improvements
      const defaultOptions: PdfGenerationOptions = {
        margin: [0.5, 0.5, 0.5, 0.5], // inches
        filename: `${jobTitle || 'CV'}_CV.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.98
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: 'css',
          before: '.avoid-break'
        }
      };

      // Merge with provided options
      const finalOptions = { ...defaultOptions, ...options };

      // Get html2pdf from window
      const html2pdf = (window as any).html2pdf;
      if (!html2pdf) {
        throw new Error('PDF library not loaded');
      }

      // Generate PDF
      const pdfBlob = await html2pdf().set(finalOptions).from(element).outputPdf('blob');
      const url = URL.createObjectURL(pdfBlob);

      return {
        success: true,
        blob: pdfBlob,
        url
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown PDF generation error'
      };
    }
  }

  /**
   * Generate PDF preview and open in new tab
   */
  async generatePdfPreview(
    element: HTMLElement,
    jobTitle?: string
  ): Promise<PdfGenerationResult> {
    const result = await this.generatePdf(element, {}, jobTitle);
    
    if (result.success && result.url) {
      // Open PDF in new tab
      window.open(result.url, '_blank');
    }
    
    return result;
  }

  /**
   * Download PDF directly
   */
  async downloadPdf(
    element: HTMLElement,
    jobTitle?: string
  ): Promise<PdfGenerationResult> {
    const result = await this.generatePdf(element, {}, jobTitle);
    
    if (result.success && result.blob) {
      // Create download link
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${jobTitle || 'CV'}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    return result;
  }

  /**
   * Clean up URLs to prevent memory leaks
   */
  cleanupUrl(url: string): void {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}

export const pdfService = new PdfService();
