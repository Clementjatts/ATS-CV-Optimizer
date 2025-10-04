
import React, { useState, useRef, useCallback } from 'react';
import { optimizeCvWithGemini, CvData, extractTextFromImagesWithGemini } from './services/geminiService';
import { CopyIcon, DownloadIcon, SparkleIcon, InfoIcon, LoadingSpinner, UploadIcon, FileIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './components/icons';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to ensure it can run in the background.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
declare var html2pdf: any;

// A new component to display the structured CV data in a professional layout
const CvDisplay: React.FC<{ cvData: CvData }> = ({ cvData }) => {
  return (
    <div id="cv-preview" className="bg-white p-8 md:p-12 text-black font-[calibri] text-[11pt] leading-normal min-h-full overflow-y-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wider">{cvData.fullName}</h1>
        {cvData.contactInfo && (
            <p className="text-sm mt-2">
                {cvData.contactInfo.location} | {cvData.contactInfo.phone} | {cvData.contactInfo.email}
                {cvData.contactInfo.linkedin && <> | <a href={cvData.contactInfo.linkedin} className="text-blue-600 hover:underline">{cvData.contactInfo.linkedin}</a></>}
            </p>
        )}
      </div>

      {cvData.summary && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase border-b-2 border-black pb-1 tracking-widest">Professional Summary</h2>
          <p className="mt-2 text-justify">{cvData.summary}</p>
        </section>
      )}

      {cvData.workExperience && cvData.workExperience.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase border-b-2 border-black pb-1 tracking-widest">Work Experience</h2>
          {cvData.workExperience.map((job, index) => (
            <div key={index} className="mt-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-md font-bold">{job.jobTitle}</h3>
                <p className="text-sm font-semibold">{job.dates}</p>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-md italic">{job.company}</p>
                <p className="text-sm italic">{job.location}</p>
              </div>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {job.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {cvData.skills && cvData.skills.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase border-b-2 border-black pb-1 tracking-widest">Skills</h2>
          <p className="mt-2">{cvData.skills.join(' | ')}</p>
        </section>
      )}

      {cvData.education && cvData.education.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase border-b-2 border-black pb-1 tracking-widest">Education</h2>
          {cvData.education.map((edu, index) => (
            <div key={index} className="mt-2 flex justify-between">
                <div>
                    <h3 className="text-md font-bold">{edu.institution}</h3>
                    <p className="italic">{edu.degree}</p>
                </div>
                <p className="text-sm font-semibold">{edu.dates}</p>
            </div>
          ))}
        </section>
      )}

      {cvData.additionalSections && cvData.additionalSections.length > 0 && (
        <>
          {cvData.additionalSections.map((section, index) => (
            <section key={index} className="mt-6">
              <h2 className="text-sm font-bold uppercase border-b-2 border-black pb-1 tracking-widest">{section.title}</h2>
              <div className="mt-2">
                {section.type === 'list' ? (
                  <ul className="list-disc list-inside space-y-1">
                    {section.content.split('\n').filter(item => item.trim()).map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                ) : section.type === 'experience' ? (
                  <div className="space-y-3">
                    {section.content.split('\n\n').filter(item => item.trim()).map((item, i) => (
                      <div key={i} className="border-l-2 border-gray-300 pl-3">
                        <p className="text-sm">{item.trim()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-justify">{section.content}</p>
                )}
              </div>
            </section>
          ))}
        </>
      )}
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
        // Scroll to top to ensure we start from the beginning
        element.scrollTop = 0;
        
        const opt = {
            margin:       [0.3, 0.3, 0.3, 0.3], // Reduced margins for more content
            filename:     `${optimizedCvData.fullName.replace(/\s+/g, '_')}_CV.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
                allowTaint: true
            },
            jsPDF:        { 
                unit: 'in', 
                format: 'letter', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        // Use a timeout to ensure the scroll position is set
        setTimeout(() => {
            html2pdf().set(opt).from(element).save();
        }, 100);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
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
                  <LoadingSpinner size="h-10 w-10" />
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
                  <div className="flex-grow relative">
                      <div className="absolute inset-0">
                        <CvDisplay cvData={optimizedCvData} />
                      </div>
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
        </div>
      </main>
    </div>
  );
}