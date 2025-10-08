import React, { useState, useRef, useCallback } from 'react';
import { optimizeCvWithGemini, CvData, extractTextFromImagesWithGemini } from './services/geminiService';
import { cvService, SavedCV, CVSource } from './services/cvService';
import { fileStorageService, UploadedFile } from './services/fileStorageService';
import CVManager from './components/CVManager';
import { CopyIcon, DownloadIcon, SparkleIcon, InfoIcon, LoadingSpinner, UploadIcon, FileIcon, TrashIcon, CheckCircleIcon, XCircleIcon, DatabaseIcon } from './components/icons';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to ensure it can run in the background.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

// Modern Professional CV Display Component
const CvDisplay: React.FC<{ cvData: CvData; keywords?: string[] }> = ({ cvData, keywords }) => {
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
        </div>
        
        {/* Hidden Keywords for ATS - Invisible to human eye */}
        {keywords && keywords.length > 0 && (
          <div className="text-white" style={{ fontSize: '1px', lineHeight: '1px', color: 'white' }}>
            {keywords.join(' ')}
          </div>
        )}
      </header>

      {/* PROFESSIONAL SUMMARY */}
      <section className="cv-section mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-3">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed text-justify">{cvData.professionalSummary}</p>
        
        {/* Hidden Keywords for ATS - Mid-document - Invisible to human eye */}
        {keywords && keywords.length > 0 && (
          <div className="text-white" style={{ fontSize: '1px', lineHeight: '1px', color: 'white', height: '1px', overflow: 'hidden' }}>
            {keywords.join(' ')}
          </div>
        )}
      </section>

      {/* PROFESSIONAL EXPERIENCE */}
      <section className="cv-section mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
          Professional Experience
        </h2>
        <div className="space-y-6">
          {cvData.workExperience.map((job, index) => (
            <div key={index} className="job-entry pr-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-gray-800">{job.jobTitle}</h3>
                <span className="text-sm font-semibold text-gray-600">{job.dates}</span>
              </div>
              <div className="flex justify-between items-start mb-3">
                <p className="text-base font-semibold text-blue-600">{job.company}</p>
                <p className="text-sm text-gray-600">{job.location}</p>
              </div>
              <ul className="cv-list cv-list--experience space-y-1">
                {job.responsibilities.slice(0, 5).map((resp, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* EDUCATION */}
      <section className="cv-section mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
          Education
        </h2>
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
            <div key={index} className="education-entry flex justify-between items-start">
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
        <section className="cv-section mb-6">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
            Professional Certifications
          </h2>
          <div className="skills-grid">
            {/* Split certifications into two columns for better space utilization */}
            <div className="space-y-3">
              {cvData.certifications.slice(0, Math.ceil(cvData.certifications.length / 2)).map((cert, index) => (
                <div key={index} className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800">{cert.name}</h3>
                  <span className="text-xs font-semibold text-gray-600">{cert.date}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {cvData.certifications.slice(Math.ceil(cvData.certifications.length / 2)).map((cert, index) => (
                <div key={index} className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-800">{cert.name}</h3>
                  <span className="text-xs font-semibold text-gray-600">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KEY SKILLS & COMPETENCIES */}
      <section className="mb-6">
        <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
          Key Skills & Competencies
        </h2>
        <div className="skills-grid">
          {/* Split skills into two columns for better space utilization */}
          <ul className="cv-list cv-list--skills">
            {cvData.skills.slice(0, Math.ceil(cvData.skills.length / 2)).map((skill, index) => (
              <li key={index} className="text-sm text-gray-700">
                {skill}
              </li>
            ))}
          </ul>
          <ul className="cv-list cv-list--skills">
            {cvData.skills.slice(Math.ceil(cvData.skills.length / 2)).map((skill, index) => (
              <li key={index} className="text-sm text-gray-700">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Hidden Keywords for ATS - Footer area - Invisible to human eye */}
      {keywords && keywords.length > 0 && (
        <div className="text-white" style={{ fontSize: '1px', lineHeight: '1px', color: 'white', height: '1px', overflow: 'hidden' }}>
          {keywords.join(' ')}
        </div>
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
      className="w-full p-3 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm h-32"
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
        className={`relative w-full p-3 border-2 border-dashed rounded-lg transition-colors duration-200 h-32 flex flex-col items-center justify-center text-center
                    ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-purple-300'}
                    ${file || isLoading || parsingError ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'cursor-pointer hover:border-purple-400 hover:bg-purple-50/50'}`
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
            <LoadingSpinner className="mx-auto h-6 w-6 text-indigo-500" />
            <p className="mt-1 text-sm font-semibold">{loadingText}</p>
          </div>
        ) : parsingError ? (
          <div className="text-red-600">
            <XCircleIcon className="mx-auto h-6 w-6" />
            <p className="mt-1 text-sm font-bold">File Error</p>
            <p className="text-xs">{parsingError}</p>
            <button onClick={onFileClear} className="mt-1 text-xs font-semibold text-indigo-600 hover:underline">Try again</button>
          </div>
        ) : file ? (
          <div className="text-slate-700 w-full">
            <div className="flex items-center gap-2">
              <FileIcon className="h-6 w-6 text-indigo-500 flex-shrink-0" />
              <div className="text-left overflow-hidden flex-1">
                <p className="text-sm font-semibold truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={onFileClear} className="p-1 text-slate-500 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1 text-green-600 mt-1 bg-green-50 p-1 rounded text-xs">
              <CheckCircleIcon className="h-3 w-3" />
              <span className="font-semibold">Ready</span>
            </div>
          </div>
        ) : (
          <div className="text-slate-500">
            <UploadIcon className="mx-auto h-6 w-6" />
            <p className="mt-1 text-sm font-semibold">Drop CV or <span className="text-indigo-600">click to upload</span></p>
            <p className="text-xs">DOCX, PDF</p>
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

  const [isParsing, setIsParsing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  
  // AI Chat states
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  // CV Database states
  const [isCVManagerOpen, setIsCVManagerOpen] = useState<boolean>(false);
  const [selectedCVFromDB, setSelectedCVFromDB] = useState<CVSource | null>(null);
  const [useDatabaseCV, setUseDatabaseCV] = useState<boolean>(false);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [pdfGenerationStatus, setPdfGenerationStatus] = useState<{
    isGenerating: boolean;
    progress: string;
    error: string | null;
  }>({
    isGenerating: false,
    progress: '',
    error: null
  });

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
    setIsUploadingFile(true);

    try {
      // Parse the file first to get the text content
      const { text: initialText, isScanned } = await parseFile(file);
      
      // Auto-save the uploaded file to Firebase Storage with parsed text
      await fileStorageService.uploadFile(file, `Uploaded CV - ${file.name}`, [], initialText);

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

  const isFormValid = (userCvText.trim() !== '' || useDatabaseCV) && jobDescriptionText.trim() !== '';

  const handleOptimize = async () => {
    if (!isFormValid || isParsing || isScanning) return;

    setIsLoading(true);
    setError(null);
    setOptimizedCvData(null);

    try {
      // Determine which CV content to use
      let cvContent = userCvText;
      
      if (useDatabaseCV && selectedCVFromDB) {
        // Check if it's an optimized CV or uploaded file
        if ('content' in selectedCVFromDB) {
          // It's an optimized CV
          cvContent = selectedCVFromDB.content;
        } else {
          // It's an uploaded file - use the stored parsed text
          const uploadedFile = selectedCVFromDB as UploadedFile;
          
          if (uploadedFile.parsedText && uploadedFile.parsedText.trim()) {
            // Use the stored parsed text
            cvContent = uploadedFile.parsedText;
            console.log('Using stored parsed text for uploaded file:', uploadedFile.fileName);
          } else {
            // Fallback: try to download and parse (for older files without stored text)
            console.log('No stored parsed text found, attempting to download and parse...');
            try {
              // Check if download URL is valid
              if (!uploadedFile.downloadURL || !uploadedFile.downloadURL.startsWith('https://')) {
                throw new Error('Invalid download URL for the uploaded file');
              }
              
              // Download the file from Firebase Storage
              const response = await fetch(uploadedFile.downloadURL);
              
              if (!response.ok) {
                throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
              }
              
              const blob = await response.blob();
              
              // Create a File object from the blob
              const file = new File([blob], uploadedFile.fileName, { type: uploadedFile.fileType });
              
              // Parse the file to extract text
              const { text: parsedText } = await parseFile(file);
              cvContent = parsedText;
            } catch (error) {
              console.error('Error downloading/parsing uploaded file:', error);
              throw new Error('Failed to process uploaded file. Please re-upload the file to store its parsed content.');
            }
          }
        }
      } else if (!userCvText.trim()) {
        // If no uploaded CV and no database CV selected, try to find relevant CVs
        const relevantCVs = await cvService.getRelevantCVs(jobDescriptionText);
        if (relevantCVs.length > 0) {
          // Use the most relevant CV as context
          cvContent = relevantCVs[0].content;
        }
      }

      const result = await optimizeCvWithGemini(cvContent, jobDescriptionText);
      setOptimizedCvData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred. The AI may have returned an invalid format.');
    } finally {
      setIsLoading(false);
    }
  };

  // AI Chat function for CV modifications
  const handleChatMessage = async (message: string) => {
    if (!optimizedCvData || !message.trim()) return;

    setIsChatLoading(true);
    const userMessage = { role: 'user' as const, content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      // Create a prompt for CV modification
      const modificationPrompt = `You are helping modify an existing optimized CV. The user wants to make specific changes.

CURRENT CV DATA (as context):
Name: ${optimizedCvData.fullName}
Current Skills: ${optimizedCvData.skills.join(', ')}
Current Experience: ${optimizedCvData.workExperience.length} jobs
Current Education: ${optimizedCvData.education.length} entries

USER REQUEST: ${message}

Please provide a modified version that incorporates the user's request while keeping the same structure and format. Only change what the user specifically requested.`;

      const response = await optimizeCvWithGemini(JSON.stringify(optimizedCvData), modificationPrompt);
      setOptimizedCvData(response);
      
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: 'I\'ve updated your CV based on your request. The changes should now be visible in the preview above.' 
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (err) {
      console.error('Chat modification error:', err);
      const errorMessage = { 
        role: 'assistant' as const, 
        content: 'Sorry, I encountered an error while trying to modify your CV. Please try again or be more specific with your request.' 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
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

      // Wait for any dynamic content to load
      await new Promise(resolve => setTimeout(resolve, 200));

        // High-quality PDF generation - improved quality settings
        const opt = {
          margin: 0.5,
          filename: `${optimizedCvData.fullName.replace(/\s+/g, '_')}_CV_Preview.pdf`,
          image: { 
            type: 'png',  // Changed from 'jpeg' to 'png' for lossless compression
            quality: 1.0  // Changed from 0.98 to 1.0 for maximum quality
          },
          html2canvas: {
            scale: 2.5,   // Reverted from 2.5 to 1.5 for proper centering
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          x: Math.max(0, (element.scrollWidth - 560) / 2),
          y: 0,
          width: Math.min(element.scrollWidth, 700),
          height: element.scrollHeight,
          windowWidth: Math.min(element.scrollWidth, 700),
          windowHeight: element.scrollHeight,
          foreignObjectRendering: true,
          letterRendering: true
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

  // CV Management handlers
  const handleSelectCVFromDB = (cv: CVSource) => {
    setSelectedCVFromDB(cv);
    setUseDatabaseCV(true);
    setIsCVManagerOpen(false);
  };

  const handleSelectMultipleCVsFromDB = (cvs: CVSource[]) => {
    // For now, we'll combine the content of multiple CVs
    // This could be enhanced to create a more sophisticated combination
    if (cvs.length === 0) return;
    
    // Use the first CV as primary and combine content from others
    const primaryCV = cvs[0];
    let combinedContent = '';
    
    cvs.forEach((cv, index) => {
      if ('content' in cv) {
        // It's an optimized CV
        combinedContent += `\n\n--- CV ${index + 1}: ${cv.name} ---\n${cv.content}`;
      } else {
        // It's an uploaded file - use stored parsed text
        const uploadedFile = cv as UploadedFile;
        if (uploadedFile.parsedText) {
          combinedContent += `\n\n--- File ${index + 1}: ${uploadedFile.fileName} ---\n${uploadedFile.parsedText}`;
        }
      }
    });
    
    // Create a combined CV object
    const combinedCV: CVSource = {
      ...primaryCV,
      name: `Combined CV (${cvs.length} sources)`,
      content: combinedContent.trim()
    };
    
    setSelectedCVFromDB(combinedCV);
    setUseDatabaseCV(true);
    setIsCVManagerOpen(false);
  };

  const handleSaveCurrentCV = async () => {
    if (!optimizedCvData) return;
    
    try {
      await cvService.saveCV({
        name: `${optimizedCvData.fullName} - ${new Date().toLocaleDateString()}`,
        content: JSON.stringify(optimizedCvData),
        jobTitle: '',
        company: '',
        industry: '',
        skills: optimizedCvData.skills,
        experience: optimizedCvData.workExperience.map(exp => exp.jobTitle),
        education: optimizedCvData.education.map(edu => edu.institution),
        tags: [],
        description: 'Generated CV'
      });
      alert('CV saved successfully!');
    } catch (error) {
      console.error('Failed to save CV:', error);
      alert('Failed to save CV');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 relative overflow-hidden">
      {/* Colorful background elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-32 right-1/4 w-4 h-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-64 left-1/3 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-32 right-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce delay-1500"></div>
        
        {/* Floating lines */}
        <div className="absolute top-1/4 left-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent rotate-45 animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent -rotate-45 animate-pulse delay-3000"></div>
      </div>
      
      <header className="bg-gradient-to-r from-white/90 via-purple-50/90 to-pink-50/90 backdrop-blur-sm shadow-xl border-b border-purple-200/50 relative z-10">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">ATS CV Optimizer</h1>
                <p className="text-sm text-slate-600 font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI-Powered Resume Enhancement</p>
              </div>
            </div>
            
            {/* Tagline */}
            <p className="text-xl text-slate-700 max-w-2xl leading-relaxed font-medium bg-gradient-to-r from-slate-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
              Transform your CV with AI to match any job description and pass ATS systems effortlessly
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-bold rounded-full shadow-sm border border-emerald-200 hover:shadow-md transition-all duration-300 hover:scale-105">✨ AI-Powered</span>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-bold rounded-full shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-105">🎯 ATS Compatible</span>
              <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-bold rounded-full shadow-sm border border-purple-200 hover:shadow-md transition-all duration-300 hover:scale-105">⚡ Instant Results</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-12">

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                Provide Your Details
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg mb-6 text-sm text-blue-800 flex items-start shadow-sm">
                <InfoIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <p>Upload your CV (including scanned PDFs) and paste the job description. The content will be extracted and optimized.</p>
              </div>
              
              {/* Merged Layout: CV Upload + Job Description */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CV Upload Section - Top Left */}
                <div className="space-y-3">
                  <FileInput
                    id="user-cv"
                    label="Your Current CV (.docx, .pdf)"
                    file={userCvFile}
                    onFileChange={handleFileChange}
                    onFileClear={handleFileClear}
                    isLoading={isParsing || isScanning || isUploadingFile}
                    loadingText={isUploadingFile ? 'Uploading to database...' : isScanning ? 'Scanning with AI (OCR)...' : 'Parsing file...'}
                    parsingError={parsingError}
                  />
                  
                  {/* Database CV Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DatabaseIcon className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Or select from database:</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsCVManagerOpen(true)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg text-purple-700 hover:from-purple-200 hover:to-pink-200 transition-all duration-300 text-sm font-medium"
                      >
                        {selectedCVFromDB ? 
                          ('content' in selectedCVFromDB ? selectedCVFromDB.name : selectedCVFromDB.fileName) 
                          : 'Select CV from Database'}
                      </button>
                      {selectedCVFromDB && (
                        <button
                          onClick={() => {
                            setSelectedCVFromDB(null);
                            setUseDatabaseCV(false);
                          }}
                          className="px-3 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 hover:bg-red-200 transition-colors text-sm"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Job Description Section - Top Right */}
                <div className="space-y-3">
                  <LabeledTextarea
                    id="job-description"
                    label="Target Job Description"
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    placeholder="Paste the complete job description here..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleOptimize}
                disabled={!isFormValid || isLoading || isParsing || isScanning}
                className="w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-[1.02] disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <SparkleIcon className="h-4 w-4" />
                    Optimize CV
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/95 via-pink-50/95 to-purple-50/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-pink-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 flex flex-col">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
              <span className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
              Your Optimized CV
            </h2>
            <div className="flex-grow bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-xl border border-purple-200/50 min-h-[40rem] flex flex-col overflow-hidden shadow-inner">
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
                  <CvDisplay cvData={optimizedCvData} keywords={optimizedCvData.optimizationDetails.keywordsIntegrated} />
                </div>
              )}
              {!isLoading && !error && !optimizedCvData && (
                <div className="m-auto text-center text-slate-500">
                  <p>Your optimized CV will appear here after processing.</p>
                </div>
              )}
            </div>

            {optimizedCvData && (
              <div className="mt-6 space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={generatePdfPreview}
                    disabled={pdfGenerationStatus.isGenerating}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    {pdfGenerationStatus.isGenerating ? 'Generating...' : 'Generate PDF'}
                  </button>
                  
                  <button
                    onClick={handleSaveCurrentCV}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <DatabaseIcon className="h-4 w-4" />
                    Save to Database
                  </button>
                  
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <SparkleIcon className="h-4 w-4" />
                    {isChatOpen ? 'Close AI Chat' : 'AI Chat'}
                  </button>
                </div>

                {/* AI Chat Interface */}
                {isChatOpen && (
                  <div className="bg-gradient-to-br from-white/95 via-emerald-50/95 to-teal-50/95 backdrop-blur-sm border border-emerald-200/50 rounded-xl shadow-lg">
                    <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <SparkleIcon className="h-4 w-4 text-emerald-600" />
                        AI Assistant - Modify Your CV
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Ask me to make specific changes to your CV, like "Add Python to my skills" or "Make the summary more concise"
                      </p>
                    </div>
                    
                    {/* Chat Messages */}
                    <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                          <SparkleIcon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                          <p>Start a conversation to modify your CV!</p>
                          <p className="text-sm mt-1">Try: "Add JavaScript to my skills" or "Shorten my professional summary"</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white border border-slate-200 text-slate-800'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-slate-200 text-slate-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                            <LoadingSpinner className="h-3 w-3" />
                            Updating your CV...
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Chat Input */}
                    <div className="p-4 border-t border-slate-200">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (chatInput.trim() && !isChatLoading) {
                          handleChatMessage(chatInput);
                        }
                      }} className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask me to modify your CV..."
                          disabled={isChatLoading}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100"
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isChatLoading}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                )}
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
            <div className="bg-gradient-to-br from-white/95 via-emerald-50/95 to-teal-50/95 p-8 rounded-2xl shadow-xl border border-emerald-200/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:-translate-y-2">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">3</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Optimization Analysis</h2>
              </div>

              {/* Success Banner */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-800">CV Successfully Optimized for ATS</h3>
                </div>

                {/* Main Content Grid */}
                <div className="space-y-8">
                  {/* ATS Optimization Section */}
                  <div className="bg-white/70 rounded-xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📋</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">ATS Optimization</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className="font-bold text-blue-800">Format & Structure</p>
                        </div>
                        <ul className="optimization-list optimization-list--blue space-y-2 text-sm text-blue-700">
                          <li>Clean, scannable format for ATS systems</li>
                          <li>Standard section headers for easy parsing</li>
                          <li>Consistent formatting and structure</li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          </div>
                          <p className="font-bold text-purple-800">Content Quality</p>
                        </div>
                        <ul className="optimization-list optimization-list--purple space-y-2 text-sm text-purple-700">
                          <li>Professional language and action verbs</li>
                          <li>Quantified achievements where possible</li>
                          <li>Industry-standard terminology</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Job Description Matching Section */}
                  <div className="bg-white/70 rounded-xl p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🎯</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">Job Description Matching</h4>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Keywords Section */}
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                            <p className="font-bold text-amber-800">Keywords Integrated</p>
                          </div>
                          <p className="text-sm text-amber-700 leading-relaxed">
                            {optimizedCvData.optimizationDetails.keywordsIntegrated.join(', ')}
                          </p>
                        </div>

                        {/* Skills Section */}
                        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-xl border border-teal-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-teal-500 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <p className="font-bold text-teal-800">Skills Aligned</p>
                          </div>
                          <p className="text-sm text-teal-700 leading-relaxed">
                            {optimizedCvData.optimizationDetails.skillsAligned.join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Experience Section */}
                        <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-rose-500 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                              </svg>
                            </div>
                            <p className="font-bold text-rose-800">Experience Optimizations</p>
                          </div>
                          <ul className="optimization-list optimization-list--rose space-y-2 text-sm text-rose-700">
                            {optimizedCvData.optimizationDetails.experienceOptimizations.map((optimization, index) => (
                              <li key={index}>{optimization}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Summary Section */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </div>
                            <p className="font-bold text-indigo-800">Summary Tailoring</p>
                          </div>
                          <p className="text-sm text-indigo-700 leading-relaxed">{optimizedCvData.optimizationDetails.summaryTailoring}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pro Tip */}
                <div className="mt-8 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-800 leading-relaxed">
                        <span className="font-bold">Pro Tip:</span> Your CV has been restructured using a modern template that maximizes ATS compatibility while highlighting your most relevant qualifications for this specific role.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* CV Manager Modal */}
      <CVManager 
        isOpen={isCVManagerOpen}
        onClose={() => setIsCVManagerOpen(false)}
        onSelectCV={handleSelectCVFromDB}
        onSelectMultipleCVs={handleSelectMultipleCVsFromDB}
      />
    </div>
  );
}