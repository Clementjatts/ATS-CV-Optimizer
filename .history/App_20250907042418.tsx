import React, { useState, useRef, useCallback } from 'react';
import { optimizeCvWithGemini, CvData, extractTextFromImagesWithGemini } from './services/geminiService';
import { CopyIcon, DownloadIcon, SparkleIcon, InfoIcon, LoadingSpinner, UploadIcon, FileIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './components/icons';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to ensure it can run in the background.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

// Modern Professional CV Display Component
const CvDisplay: React.FC<{ cvData: CvData }> = ({ cvData }) => {
  return (
    <div id="cv-preview" className="bg-white p-6 md:p-8 text-black font-[calibri] text-[10pt] leading-normal w-full max-w-3xl mx-auto">

      {/* PROFILE HEADER */}
      <header className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide mb-2">{cvData.fullName}</h1>
        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span className="text-gray-600">📍</span>
            {cvData.contactInfo.location}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-600">✉️</span>
            {cvData.contactInfo.email}
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gray-600">📞</span>
            {cvData.contactInfo.phone}
          </span>
          {cvData.contactInfo.linkedin && (
            <span className="flex items-center gap-1">
              <span className="text-gray-600">🔗</span>
              LinkedIn Profile
            </span>
          )}
        </div>
      </header>

      {/* PROFESSIONAL SUMMARY */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-3">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed text-justify">{cvData.professionalSummary}</p>
      </section>

      {/* PROFESSIONAL EXPERIENCE */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
          Professional Experience
        </h2>
        <div className="space-y-6">
          {cvData.workExperience.map((job, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-gray-800">{job.jobTitle}</h3>
                <span className="text-sm font-semibold text-gray-600">{job.dates}</span>
              </div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-base font-semibold text-blue-600">{job.company}</p>
                <p className="text-sm text-gray-600">{job.location}</p>
              </div>
              <ul className="space-y-1">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
          Education
        </h2>
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-gray-800">{edu.institution}</h3>
                <p className="text-sm text-gray-600">{edu.degree}</p>
              </div>
              <span className="text-sm font-semibold text-gray-600">{edu.dates}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROFESSIONAL CERTIFICATIONS */}
      {cvData.certifications && cvData.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
            Professional Certifications
          </h2>
          <div className="space-y-3">
            {cvData.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{cert.name}</h3>
                  <p className="text-xs text-gray-600">{cert.issuer}</p>
                </div>
                <span className="text-xs font-semibold text-gray-600">{cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* KEY SKILLS & COMPETENCIES */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
          Key Skills & Competencies
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {cvData.skills.map((skill, index) => (
            <div key={index} className="text-sm text-gray-700 flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              <span>{skill}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


const LabeledTextarea: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}> = ({ id, label, value, onChange, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm h-48"
    />
  </div>
);

interface FileInputProps {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (file: File) => void;
  onFileClear: () => void;
  isLoading: boolean;
  loadingText: string;
  parsingError: string | null;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, file, onFileChange, onFileClear, isLoading, loadingText, parsingError }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onFileChange(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full p-4 border-2 border-dashed rounded-lg transition-colors duration-200 h-40 flex flex-col items-center justify-center text-center
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300'}
                    ${file || isLoading || parsingError ? 'bg-slate-50' : 'cursor-pointer hover:border-slate-400'}`
        }
        onClick={() => !(file || isLoading || parsingError) && inputRef.current?.click()}
      >
        <input
          type="file"
          id={id}
          ref={inputRef}
          onChange={handleFileSelect}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
        />
        {isLoading ? (
          <div className="text-slate-500">
            <LoadingSpinner className="mx-auto h-8 w-8 text-indigo-500" />
            <p className="mt-2 text-sm font-semibold">{loadingText}</p>
          </div>
        ) : parsingError ? (
          <div className="text-red-600">
            <XCircleIcon className="mx-auto h-8 w-8" />
            <p className="mt-2 text-sm font-bold">File Error</p>
            <p className="mt-1 text-sm">{parsingError}</p>
            <button onClick={onFileClear} className="mt-2 text-sm font-semibold text-indigo-600 hover:underline">Try again</button>
          </div>
        ) : file ? (
          <div className="text-slate-700 w-full">
            <div className="flex items-center gap-3">
              <FileIcon className="h-10 w-10 text-indigo-500 flex-shrink-0" />
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={onFileClear} className="ml-auto p-1 text-slate-500 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-green-600 mt-3 bg-green-50 p-2 rounded-md">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-xs font-semibold">File content extracted successfully.</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-500">
            <UploadIcon className="mx-auto h-8 w-8" />
            <p className="mt-2 text-sm font-semibold">Drop a file or <span className="text-indigo-600">click to upload</span></p>
            <p className="text-xs">Supported formats: DOCX, PDF</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default function App() {
  const [userCvFile, setUserCvFile] = useState<File | null>(null);
  const [userCvText, setUserCvText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [optimizedCvData, setOptimizedCvData] = useState<CvData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [pdfGenerationStatus, setPdfGenerationStatus] = useState<{
    isGenerating: boolean;
    progress: string;
    error: string | null;
  }>({
    isGenerating: false,
    progress: '',
    error: null
  });
  const [pdfQuality, setPdfQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [showPdfOptions, setShowPdfOptions] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<{
    blob: Blob | null;
    url: string | null;
    quality: any | null;
  }>({
    blob: null,
    url: null,
    quality: null
  });
  const [showPreview, setShowPreview] = useState(false);

  // Cleanup preview URL when CV data changes
  React.useEffect(() => {
    if (pdfPreview.url) {
      URL.revokeObjectURL(pdfPreview.url);
      setPdfPreview({ blob: null, url: null, quality: null });
      setShowPreview(false);
    }
  }, [optimizedCvData]);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (pdfPreview.url) {
        URL.revokeObjectURL(pdfPreview.url);
      }
    };
  }, [pdfPreview.url]);

  const parseFile = useCallback(async (file: File): Promise<{ text: string; isScanned: boolean }> => {
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let textContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const text = await page.getTextContent();
        textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
      }
      // Heuristic: If the PDF has pages but we extracted less than 50 words, it's likely a scanned document.
      const isScanned = pdf.numPages > 0 && textContent.trim().split(/\s+/).length < 50;
      return { text: textContent, isScanned };
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { text: result.value, isScanned: false };
    }
    throw new Error('Unsupported file type');
  }, []);

  const performOcrOnPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const base64Images: string[] = [];
    // Limit OCR to the first 5 pages to prevent excessive processing time and API costs
    const maxPagesForOcr = Math.min(pdf.numPages, 5);

    for (let i = 1; i <= maxPagesForOcr; i++) {
      const page = await pdf.getPage(i);
      // Use a higher scale for better OCR accuracy
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (context) {
        // Render the page to the canvas context
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        // Use JPEG with quality for smaller size and remove the data URL prefix
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        base64Images.push(dataUrl.split(',')[1]);
      }
    }

    if (base64Images.length === 0) {
      throw new Error("Could not convert PDF pages to images for OCR.");
    }

    return await extractTextFromImagesWithGemini(base64Images);
  };


  const handleFileChange = async (file: File) => {
    if (!file) return;

    const acceptedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!acceptedTypes.includes(file.type)) {
      setParsingError('Invalid file type. Use PDF or DOCX.');
      return;
    }

    setUserCvFile(file);
    setUserCvText('');
    setParsingError(null);
    setIsParsing(true);
    setIsScanning(false);

    try {
      const { text: initialText, isScanned } = await parseFile(file);

      if (isScanned && file.type === 'application/pdf') {
        setIsParsing(false); // Switch from parsing to scanning state
        setIsScanning(true);
        const ocrText = await performOcrOnPdf(file);
        if (!ocrText || ocrText.trim().length === 0) {
          throw new Error("AI OCR returned no text.");
        }
        setUserCvText(ocrText);
      } else {
        setUserCvText(initialText);
      }
    } catch (err: any) {
      console.error("File processing error:", err);
      // Clear file on any error for better UX
      setUserCvFile(null);
      setUserCvText('');

      if (err.message.includes("AI OCR returned no text.")) {
        setParsingError('AI could not read any text from this document.');
      } else if (err.message.includes("Failed to extract text")) {
        setParsingError('AI-powered text extraction failed. The document might be unreadable or a network issue occurred.');
      } else if (err.name === 'PasswordException') {
        setParsingError('This PDF is password-protected. Please upload an unprotected file.');
      } else if (err.name === 'InvalidPDFException' || err.name === 'MissingPDFException') {
        setParsingError('The uploaded PDF file appears to be invalid or corrupted.');
      }
      else if (err instanceof Error) {
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
    }
  };

  const handleFileClear = () => {
    setUserCvFile(null);
    setUserCvText('');
    setParsingError(null);
    setIsParsing(false);
    setIsScanning(false);
  };

  const isFormValid = userCvText.trim() !== '' && jobDescriptionText.trim() !== '';

  const handleOptimize = async () => {
    if (!isFormValid || isParsing || isScanning) return;

    setIsLoading(true);
    setError(null);
    setOptimizedCvData(null);

    try {
      const result = await optimizeCvWithGemini(userCvText, jobDescriptionText);
      setOptimizedCvData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred. The AI may have returned an invalid format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const cvElement = document.getElementById('cv-preview');
    if (cvElement) {
      navigator.clipboard.writeText(cvElement.innerText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const generatePdfPreview = async () => {
    const element = document.getElementById('cv-preview');
    if (!element || !optimizedCvData) return;

    setPdfGenerationStatus({
      isGenerating: true,
      progress: 'Generating PDF preview...',
      error: null
    });

    try {
      // Use html2pdf.js directly for more reliable generation
      const html2pdf = (window as any).html2pdf;

      if (!html2pdf) {
        throw new Error('PDF library not loaded');
      }

      // Simple approach: use the original element with better settings
      const opt = {
        margin: 0.5,
        filename: `${optimizedCvData.fullName.replace(/\s+/g, '_')}_CV_Preview.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      // Generate PDF from the original element
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');

      // Create preview URL and open in new tab
      const url = URL.createObjectURL(pdfBlob);

      // Open PDF in new tab
      window.open(url, '_blank');

      setPdfPreview({
        blob: pdfBlob,
        url,
        quality: { fileSize: pdfBlob.size }
      });

      // Don't show inline preview since we opened in new tab
      setShowPreview(false);

      setPdfGenerationStatus({
        isGenerating: false,
        progress: 'Preview generated successfully!',
        error: null
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPdfGenerationStatus(prev => ({
          ...prev,
          progress: ''
        }));
      }, 3000);

    } catch (error) {
      console.error('PDF preview error:', error);
      setPdfGenerationStatus({
        isGenerating: false,
        progress: '',
        error: error instanceof Error ? error.message : 'Preview generation failed'
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setPdfGenerationStatus(prev => ({
          ...prev,
          error: null
        }));
      }, 5000);
    }
  };

  const handleSaveAsPdf = async () => {
    const element = document.getElementById('cv-preview');
    if (!element || !optimizedCvData) return;

    setPdfGenerationStatus({
      isGenerating: true,
      progress: 'Initializing PDF generation...',
      error: null
    });

    try {
      // Use html2pdf.js directly for more reliable generation
      const html2pdf = (window as any).html2pdf;

      if (!html2pdf) {
        throw new Error('PDF library not loaded');
      }

      setPdfGenerationStatus(prev => ({
        ...prev,
        progress: 'Preparing document...'
      }));

      // Simple approach: prepare the element for PDF generation

      // Generate professional filename
      const filename = `${optimizedCvData.fullName.replace(/\s+/g, '_')}_CV.pdf`;

      // Set quality-based options
      const qualitySettings = {
        high: { scale: 3, quality: 0.95 },
        medium: { scale: 2, quality: 0.85 },
        low: { scale: 1.5, quality: 0.75 }
      };

      const settings = qualitySettings[pdfQuality];

      const opt = {
        margin: 0.5,
        filename,
        image: { type: 'jpeg', quality: settings.quality },
        html2canvas: {
          scale: settings.scale,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          x: 0,
          y: 0,
          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      setPdfGenerationStatus(prev => ({
        ...prev,
        progress: `Generating ${pdfQuality} quality PDF...`
      }));

      // Generate PDF from the original element
      await html2pdf().set(opt).from(element).save();

      setPdfGenerationStatus({
        isGenerating: false,
        progress: `PDF generated successfully! Quality: ${pdfQuality.toUpperCase()}`,
        error: null
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setPdfGenerationStatus(prev => ({
          ...prev,
          progress: ''
        }));
      }, 5000);

    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfGenerationStatus({
        isGenerating: false,
        progress: '',
        error: error instanceof Error ? error.message : 'PDF generation failed'
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        setPdfGenerationStatus(prev => ({
          ...prev,
          error: null
        }));
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ATS CV Optimizer</h1>
          <p className="mt-2 text-md text-slate-600">Tailor your CV to any job description, instantly.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Provide Your Details</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-6 text-sm text-blue-800 flex items-start">
                <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <p>Upload your CV (including scanned PDFs) and paste the job description. The content will be extracted and optimized.</p>
              </div>
              <div className="space-y-6">
                <FileInput
                  id="user-cv"
                  label="Your Current CV (.docx, .pdf)"
                  file={userCvFile}
                  onFileChange={handleFileChange}
                  onFileClear={handleFileClear}
                  isLoading={isParsing || isScanning}
                  loadingText={isScanning ? 'Scanning with AI (OCR)...' : 'Parsing file...'}
                  parsingError={parsingError}
                />
                <LabeledTextarea
                  id="job-description"
                  label="Target Job Description"
                  value={jobDescriptionText}
                  onChange={(e) => setJobDescriptionText(e.target.value)}
                  placeholder="Paste the complete job description here..."
                />
              </div>
            </div>
            <div>
              <button
                onClick={handleOptimize}
                disabled={!isFormValid || isLoading || isParsing || isScanning}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <SparkleIcon className="h-5 w-5" />
                    Optimize My CV
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Your Optimized CV</h2>
            <div className="flex-grow bg-slate-200 rounded-md border border-slate-300 min-h-[40rem] flex flex-col overflow-hidden">
              {isLoading && (
                <div className="m-auto text-center text-slate-500">
                  <div className="flex justify-center">
                    <LoadingSpinner className="h-10 w-10" />
                  </div>
                  <p className="mt-4 font-semibold">Generating your new CV...</p>
                  <p className="text-sm">This may take a moment.</p>
                </div>
              )}
              {error && (
                <div className="m-auto text-center text-red-600 bg-red-50 p-6 rounded-md w-full">
                  <p className="font-semibold">Error</p>
                  <p className="text-sm mt-2">{error}</p>
                </div>
              )}
              {optimizedCvData && (
                <div className="flex-grow overflow-auto">
                  <CvDisplay cvData={optimizedCvData} />
                </div>
              )}
              {!isLoading && !error && !optimizedCvData && (
                <div className="m-auto text-center text-slate-500">
                  <p>Your optimized CV will appear here after processing.</p>
                </div>
              )}
            </div>

            {optimizedCvData && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-slate-700 transition-colors duration-200"
                >
                  <CopyIcon className="h-4 w-4" />
                  {isCopied ? 'Copied!' : 'Copy Text'}
                </button>

                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <button
                    onClick={generatePdfPreview}
                    disabled={pdfGenerationStatus.isGenerating}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    {pdfGenerationStatus.isGenerating ? 'Generating...' : 'Preview PDF'}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowPdfOptions(!showPdfOptions)}
                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Save as PDF
                    </button>

                    {showPdfOptions && (
                      <div className="absolute top-full mt-2 right-0 bg-white border border-slate-300 rounded-lg shadow-lg p-4 z-10 min-w-48">
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Quality:</label>
                          <select
                            value={pdfQuality}
                            onChange={(e) => setPdfQuality(e.target.value as 'high' | 'medium' | 'low')}
                            className="w-full p-2 border border-slate-300 rounded-md text-sm"
                          >
                            <option value="high">High (Best quality, larger file)</option>
                            <option value="medium">Medium (Balanced)</option>
                            <option value="low">Low (Smaller file)</option>
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            setShowPdfOptions(false);
                            handleSaveAsPdf();
                          }}
                          disabled={pdfGenerationStatus.isGenerating}
                          className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {pdfGenerationStatus.isGenerating ? 'Generating...' : 'Generate PDF'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(pdfGenerationStatus.progress || pdfGenerationStatus.error) && (
              <div className="mt-4">
                {pdfGenerationStatus.progress && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                    {pdfGenerationStatus.progress}
                  </div>
                )}
                {pdfGenerationStatus.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    Error: {pdfGenerationStatus.error}
                  </div>
                )}
              </div>
            )}

            {showPreview && pdfPreview.url && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800">PDF Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <iframe
                    src={pdfPreview.url}
                    className="w-full h-96"
                    title="PDF Preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Optimization Analysis Section */}
          {optimizedCvData && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">3. Optimization Analysis</h2>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-3">✅ CV Successfully Optimized for ATS</h3>
                <div className="space-y-6">
                  {/* ATS Optimization Section */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3">📋 ATS Optimization:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-100 p-3 rounded-md">
                        <p className="text-sm font-semibold text-green-800 mb-2">Format & Structure:</p>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Clean, scannable format for ATS systems</li>
                          <li>• Standard section headers for easy parsing</li>
                          <li>• Consistent formatting and structure</li>
                        </ul>
                      </div>
                      <div className="bg-green-100 p-3 rounded-md">
                        <p className="text-sm font-semibold text-green-800 mb-2">Content Quality:</p>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Professional language and action verbs</li>
                          <li>• Quantified achievements where possible</li>
                          <li>• Industry-standard terminology</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Description Matching Section */}
                  <div>
                    <h4 className="font-semibold text-green-700 mb-3">🎯 Job Description Matching:</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-2">Keywords Integrated:</p>
                          <div className="flex flex-wrap gap-2">
                            {optimizedCvData.optimizationDetails.keywordsIntegrated.map((keyword, index) => (
                              <span key={index} className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-2">Skills Aligned:</p>
                          <div className="bg-green-100 p-3 rounded-md">
                            <ul className="text-sm text-green-700 space-y-1">
                              {optimizedCvData.optimizationDetails.skillsAligned.map((skill, index) => (
                                <li key={index}>• {skill}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-2">Experience Optimizations:</p>
                          <div className="bg-green-100 p-3 rounded-md">
                            <ul className="text-sm text-green-700 space-y-1">
                              {optimizedCvData.optimizationDetails.experienceOptimizations.map((optimization, index) => (
                                <li key={index}>• {optimization}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-2">Summary Tailoring:</p>
                          <div className="bg-green-100 p-3 rounded-md">
                            <p className="text-sm text-green-700">{optimizedCvData.optimizationDetails.summaryTailoring}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-100 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>💡 Pro Tip:</strong> Your CV has been restructured using a modern template that maximizes ATS compatibility while highlighting your most relevant qualifications for this specific role.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}