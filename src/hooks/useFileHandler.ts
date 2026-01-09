import { useState } from 'react';
import { fileStorageService } from '../services/fileStorageService';
import { extractTextFromImagesWithGemini } from '../services/geminiService';
import { parseFile } from '../utils/fileParsing';

export const useFileHandler = () => {
  const [userCvFile, setUserCvFile] = useState<File | null>(null);
  const [userCvText, setUserCvText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const performOcrOnPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const base64Images: string[] = [];
    const maxPagesForOcr = Math.min(pdf.numPages, 5);

    for (let i = 1; i <= maxPagesForOcr; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      base64Images.push(dataUrl.split(',')[1]);
    }

    if (base64Images.length === 0) {
      throw new Error('Could not convert PDF pages to images for OCR.');
    }

    return await extractTextFromImagesWithGemini(base64Images);
  };

  const handleFileChange = async (file: File) => {
    if (!file) return;

    const acceptedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!acceptedTypes.includes(file.type)) {
      setParsingError('Invalid file type. Use PDF or DOCX.');
      return;
    }

    setUserCvFile(file);
    setUserCvText('');
    setParsingError(null);
    setIsParsing(true);
    setIsScanning(false);
    setIsUploadingFile(true);

    try {
      const { text: initialText, isScanned } = await parseFile(file);
      await fileStorageService.uploadFile(file, `Uploaded CV - ${file.name}`, [], initialText);

      if (isScanned && file.type === 'application/pdf') {
        setIsParsing(false);
        setIsScanning(true);
        const ocrText = await performOcrOnPdf(file);
        if (!ocrText || ocrText.trim().length === 0) {
          throw new Error('AI OCR returned no text.');
        }
        setUserCvText(ocrText);
      } else {
        setUserCvText(initialText);
      }
    } catch (err: unknown) {
      console.error('File processing error:', err);
      setUserCvFile(null);
      setUserCvText('');

      const error = err as Error & { name?: string };

      if (error.message?.includes('AI OCR returned no text.')) {
        setParsingError('AI could not read any text from this document.');
      } else if (error.message?.includes('Failed to extract text')) {
        setParsingError(
          'AI-powered text extraction failed. The document might be unreadable or a network issue occurred.'
        );
      } else if (error.name === 'PasswordException') {
        setParsingError('This PDF is password-protected. Please upload an unprotected file.');
      } else if (error.name === 'InvalidPDFException' || error.name === 'MissingPDFException') {
        setParsingError('The uploaded PDF file appears to be invalid or corrupted.');
      } else if (error instanceof Error) {
        if (file.type.includes('wordprocessingml')) {
          setParsingError('Could not read the DOCX file. It may be corrupted or in an old format.');
        } else {
          setParsingError('Failed to read the contents of this file.');
        }
      } else {
        setParsingError('An unexpected error occurred while processing the file.');
      }
    } finally {
      setIsParsing(false);
      setIsScanning(false);
      setIsUploadingFile(false);
    }
  };

  const handleFileClear = () => {
    setUserCvFile(null);
    setUserCvText('');
    setParsingError(null);
    setIsParsing(false);
    setIsScanning(false);
  };

  return {
    userCvFile,
    userCvText,
    isParsing,
    isScanning,
    parsingError,
    isUploadingFile,
    handleFileChange,
    handleFileClear,
  };
};
