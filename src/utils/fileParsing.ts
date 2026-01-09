export const parseFile = async (file: File): Promise<{ text: string; isScanned: boolean }> => {
  if (file.type === 'application/pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let textContent = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      textContent +=
        text.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
    }
    // Heuristic: If the PDF has pages but we extracted less than 50 words, it's likely a scanned document.
    const isScanned = pdf.numPages > 0 && textContent.trim().split(/\s+/).length < 50;
    return { text: textContent, isScanned };
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { text: result.value, isScanned: false };
  }
  throw new Error('Unsupported file type');
};
