
import React, { useState, useRef, useCallback } from 'react';
import { optimizeCvWithGemini, CvData, extractTextFromImagesWithGemini } from './services/geminiService';
import { CopyIcon, DownloadIcon, SparkleIcon, InfoIcon, LoadingSpinner, UploadIcon, FileIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './components/icons';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to ensure it can run in the background.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
declare var html2pdf: any;

// Modern Professional CV Display Component
const CvDisplay: React.FC<{ cvData: CvData }> = ({ cvData }) => {
  return (
    <div id="cv-preview" className="bg-white p-6 md:p-8 text-black font-[calibri] text-[10pt] leading-normal w-full max-w-3xl mx-auto">
      
      {/* PROFILE HEADER */}
      <header className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 uppercase tracking-wide mb-2">{cvData.fullName}</h1>
        <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {cvData.contactInfo.location}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {cvData.contactInfo.email}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {cvData.contactInfo.phone}
          </span>
          {cvData.contactInfo.linkedin && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
              </svg>
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
                        <LoadingSpinner className="mx-auto h-8 w-8 text-indigo-500"/>
                        <p className="mt-2 text-sm font-semibold">{loadingText}</p>
                    </div>
                ) : parsingError ? (
                    <div className="text-red-600">
                        <XCircleIcon className="mx-auto h-8 w-8"/>
                        <p className="mt-2 text-sm font-bold">File Error</p>
                        <p className="mt-1 text-sm">{parsingError}</p>
                        <button onClick={onFileClear} className="mt-2 text-sm font-semibold text-indigo-600 hover:underline">Try again</button>
                    </div>
                ) : file ? (
                     <div className="text-slate-700 w-full">
                         <div className="flex items-center gap-3">
                             <FileIcon className="h-10 w-10 text-indigo-500 flex-shrink-0"/>
                             <div className="text-left overflow-hidden">
                                 <p className="text-sm font-semibold truncate" title={file.name}>{file.name}</p>
                                 <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                             </div>
                             <button onClick={onFileClear} className="ml-auto p-1 text-slate-500 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                                 <TrashIcon className="h-5 w-5"/>
                             </button>
                         </div>
                         <div className="flex items-center gap-2 text-green-600 mt-3 bg-green-50 p-2 rounded-md">
                           <CheckCircleIcon className="h-5 w-5" />
                           <span className="text-xs font-semibold">File content extracted successfully.</span>
                         </div>
                     </div>
                ) : (
                    <div className="text-slate-500">
                        <UploadIcon className="mx-auto h-8 w-8"/>
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

  const parseFile = useCallback(async (file: File): Promise<{text: string; isScanned: boolean}> => {
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
            // FIX: The RenderParameters type for this version of pdfjs-dist requires the `canvas` property.
            await page.render({ canvas: canvas, canvasContext: context, viewport: viewport }).promise;
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
        if(!ocrText || ocrText.trim().length === 0){
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
      } else if (err.message.includes("Failed to extract text")){
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
  
  const handleSaveAsPdf = () => {
    const element = document.getElementById('cv-preview');
    if (element && optimizedCvData) {
        // Create a clean PDF-optimized version
        const pdfElement = element.cloneNode(true) as HTMLElement;
        
        // Apply PDF-specific styling - full width approach
        pdfElement.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          box-sizing: border-box !important;
          z-index: 9999 !important;
          font-family: 'Calibri', Arial, sans-serif !important;
          font-size: 11pt !important;
          line-height: 1.4 !important;
          color: black !important;
          overflow: visible !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
        `;
        
        // Create inner container for content
        const innerContainer = pdfElement.querySelector('div') as HTMLElement;
        if (innerContainer) {
          innerContainer.style.cssText = `
            width: 7.5in !important;
            max-width: 7.5in !important;
            margin: 0 auto !important;
            padding: 0.5in !important;
            background: white !important;
            box-sizing: border-box !important;
          `;
        }
        
        // Optimize content for PDF
        const sections = pdfElement.querySelectorAll('section');
        sections.forEach(section => {
          section.style.marginBottom = '0.3in';
          section.style.pageBreakInside = 'avoid';
        });
        
        // Add to document temporarily
        document.body.appendChild(pdfElement);
        
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5], // Standard margins
            filename: `${optimizedCvData.fullName.replace(/\s+/g, '_')}_CV.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                letterRendering: true,
                width: window.innerWidth,
                height: window.innerHeight
            },
            jsPDF: { 
                unit: 'in', 
                format: 'letter', 
                orientation: 'portrait',
                compress: true,
                putOnlyUsedFonts: true,
                floatPrecision: 16
            },
            pagebreak: { 
                mode: ['css', 'legacy'],
                before: '.page-break',
                after: '.page-break',
                avoid: ['h1', 'h2', 'h3', 'section']
            }
        };
        
        // Generate PDF
        setTimeout(() => {
            html2pdf().set(opt).from(pdfElement).save().then(() => {
                // Clean up
                document.body.removeChild(pdfElement);
            }).catch((error) => {
                console.error('PDF generation failed:', error);
                document.body.removeChild(pdfElement);
            });
        }, 1000);
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
                    <LoadingSpinner size="h-10 w-10" />
                  </div>
                  <p className="mt-4 font-semibold">Generating your new CV...</p>
                  <p className="text-sm">This may take a moment.</p>
                </div>
              )}
              {error && (
                <div className="m-auto text-center text-red-600 bg-red-50 p-6 rounded-md w-full">
                    <h3 className="font-bold">Optimization Failed</h3>
                    <p className="mt-2 text-sm">{error}</p>
                </div>
              )}
              {!isLoading && !error && optimizedCvData && (
                <>
                  <div className="flex-grow relative overflow-auto">
                        <CvDisplay cvData={optimizedCvData} />
                  </div>
                  <div className="mt-4 p-4 border-t border-slate-300 bg-white flex gap-4">
                    <button onClick={handleCopy} className="flex items-center gap-2 bg-slate-200 text-slate-800 font-medium py-2 px-4 rounded-md hover:bg-slate-300 transition-colors">
                      <CopyIcon className="h-4 w-4" />
                      {isCopied ? 'Copied!' : 'Copy Text'}
                    </button>
                    <button onClick={handleSaveAsPdf} className="flex items-center gap-2 bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                      <DownloadIcon className="h-4 w-4" />
                      Save as PDF
                    </button>
                  </div>
                </>
              )}
               {!isLoading && !error && !optimizedCvData && (
                 <div className="m-auto text-center text-slate-500">
                    <p className="font-semibold">Your new CV will appear here.</p>
                    <p className="text-sm">Fill in the details and click "Optimize".</p>
                </div>
               )}
            </div>
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