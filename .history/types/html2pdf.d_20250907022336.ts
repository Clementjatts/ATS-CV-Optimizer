declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      scrollX?: number;
      scrollY?: number;
      windowWidth?: number;
      windowHeight?: number;
      allowTaint?: boolean;
      backgroundColor?: string;
      logging?: boolean;
      letterRendering?: boolean;
      width?: number;
      height?: number;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      compress?: boolean;
      putOnlyUsedFonts?: boolean;
      floatPrecision?: number;
    };
    pagebreak?: {
      mode?: string[];
      before?: string;
      after?: string;
      avoid?: string[];
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    save(): Promise<void>;
    outputPdf(type: 'blob'): Promise<Blob>;
    outputPdf(type: 'datauristring'): Promise<string>;
    outputPdf(type: 'arraybuffer'): Promise<ArrayBuffer>;
  }

  function html2pdf(): Html2Pdf;
  export default html2pdf;
}