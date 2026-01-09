import React, { useState, useRef, Suspense } from 'react';
import { optimizeCvWithGemini } from './services/geminiService';
import { cvService, CVSource } from './services/cvService';
import { UploadedFile } from './services/fileStorageService';
import { SparkleIcon, InfoIcon, LoadingSpinner, DatabaseIcon } from './components/icons';
import { LabeledTextarea } from './components/common/LabeledTextarea';
import { FileInput } from './components/common/FileInput';
import { useFileHandler } from './hooks/useFileHandler';
import { useCVOptimization } from './hooks/useCVOptimization';

const CVManager = React.lazy(() => import('./components/CVManager'));

// Worker configuration will be handled dynamically

import { PDFViewer } from '@react-pdf/renderer';
import { StandardTemplate } from './components/templates/StandardTemplate';
import { ClassicTemplate } from './components/templates/ClassicTemplate';
import { ModernTemplate } from './components/templates/ModernTemplate';
import { CreativeTemplate } from './components/templates/CreativeTemplate';
import { MinimalTemplate } from './components/templates/MinimalTemplate';

// Template types
import { TemplateType } from './types/template';
import { TemplateSelector } from './components/ui/TemplateSelector';
import { Header } from './components/layout/Header';
import { HeroBackground } from './components/layout/HeroBackground';
import { OptimizationAnalysis } from './components/ui/OptimizationAnalysis';

export default function App() {
  const {
    userCvFile,
    userCvText,
    isParsing,
    isScanning,
    parsingError,
    isUploadingFile,
    handleFileChange,
    handleFileClear,
  } = useFileHandler();

  const resultsRef = useRef<HTMLDivElement>(null); // Ref for auto-scroll
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const {
    optimizedCvData,
    setOptimizedCvData,
    jobTitle,
    extractJobTitle,
    isLoading,
    error,
    handleOptimize: performOptimize,
  } = useCVOptimization();

  // Template selection state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('Standard');
  const [, setTemplateChangeCounter] = useState(0);

  // UI state for sections

  // AI Chat states
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // CV Database states
  const [isCVManagerOpen, setIsCVManagerOpen] = useState<boolean>(false);
  const [selectedCVFromDB, setSelectedCVFromDB] = useState<CVSource | null>(null);
  const [useDatabaseCV, setUseDatabaseCV] = useState<boolean>(false);

  const pdfDocument = React.useMemo(() => {
    if (!optimizedCvData) return null;
    const CommonProps = { cvData: optimizedCvData };
    switch (selectedTemplate) {
      case 'Standard':
        return <StandardTemplate {...CommonProps} />;
      case 'Classic':
        return <ClassicTemplate {...CommonProps} />;
      case 'Modern':
        return <ModernTemplate {...CommonProps} />;
      case 'Creative':
        return <CreativeTemplate {...CommonProps} />;
      case 'Minimal':
        return <MinimalTemplate {...CommonProps} />;
      default:
        return <StandardTemplate {...CommonProps} />;
    }
  }, [optimizedCvData, selectedTemplate]);

  // Auto-scroll to results when optimization is complete
  React.useEffect(() => {
    if (optimizedCvData && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [optimizedCvData]);

  const isFormValid =
    (userCvText.trim() !== '' || useDatabaseCV) && jobDescriptionText.trim() !== '';

  const handleOptimize = () => {
    if (!isFormValid || isParsing || isScanning) return;
    performOptimize(userCvText, jobDescriptionText, useDatabaseCV, selectedCVFromDB);
  };

  // AI Chat function for CV modifications
  const handleChatMessage = async (message: string) => {
    if (!optimizedCvData || !message.trim()) return;

    setIsChatLoading(true);
    const userMessage = { role: 'user' as const, content: message };
    setChatMessages((prev) => [...prev, userMessage]);
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

      const response = await optimizeCvWithGemini(
        JSON.stringify(optimizedCvData),
        modificationPrompt
      );
      setOptimizedCvData(response);

      const assistantMessage = {
        role: 'assistant' as const,
        content:
          "I've updated your CV based on your request. The changes should now be visible in the preview above.",
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat modification error:', err);
      const errorMessage = {
        role: 'assistant' as const,
        content:
          'Sorry, I encountered an error while trying to modify your CV. Please try again or be more specific with your request.',
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
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
      content: combinedContent.trim(),
    };

    setSelectedCVFromDB(combinedCV);
    setUseDatabaseCV(true);
    setIsCVManagerOpen(false);
  };

  // Extract job title from job description

  const handleSaveCurrentCV = async () => {
    if (!optimizedCvData) return;

    try {
      const extractedJobTitle = jobTitle || extractJobTitle(jobDescriptionText);

      await cvService.saveCV({
        name: extractedJobTitle,
        content: JSON.stringify(optimizedCvData),
        jobTitle: extractedJobTitle,
        company: '',
        industry: '',
        skills: optimizedCvData.skills,
        experience: optimizedCvData.workExperience.map((exp) => exp.jobTitle),
        education: optimizedCvData.education.map((edu) => edu.institution),
        tags: [],
        description: 'Generated CV',
      });
      alert('CV saved successfully!');
    } catch (error) {
      console.error('Failed to save CV:', error);
      alert('Failed to save CV');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-100 relative overflow-hidden'>
      <HeroBackground />
      <Header />

      <main className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='space-y-12'>
          <div className='space-y-8'>
            <div className='bg-gradient-to-br from-white/95 via-purple-50/95 to-pink-50/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-purple-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1'>
              <h2 className='text-2xl font-bold mb-4 bg-gradient-to-r from-purple-700 via-pink-600 to-indigo-600 bg-clip-text text-transparent'>
                Provide Your Details
              </h2>
              <div className='bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg mb-6 text-sm text-blue-800 flex items-start shadow-sm'>
                <InfoIcon className='h-5 w-5 mr-3 flex-shrink-0 mt-0.5' />
                <p>
                  Upload your CV (including scanned PDFs) and paste the job description. The content
                  will be extracted and optimized.
                </p>
              </div>

              {/* Template Selection UI */}
              {/* Template Selection UI */}
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onSelectTemplate={(template) => {
                  setSelectedTemplate(template);
                  setTemplateChangeCounter((prev) => prev + 1);
                }}
              />

              {/* Merged Layout: CV Upload + Job Description */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* CV Upload Section - Top Left */}
                <div className='space-y-3'>
                  <FileInput
                    id='user-cv'
                    label='Your Current CV (.docx, .pdf)'
                    file={userCvFile}
                    onFileChange={handleFileChange}
                    onFileClear={handleFileClear}
                    isLoading={isParsing || isScanning || isUploadingFile}
                    loadingText={
                      isUploadingFile
                        ? 'Uploading to database...'
                        : isScanning
                          ? 'Scanning with AI (OCR)...'
                          : 'Parsing file...'
                    }
                    parsingError={parsingError}
                  />

                  {/* Database CV Selection */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <DatabaseIcon className='w-4 h-4 text-purple-600' />
                      <span className='text-sm font-medium text-gray-700'>
                        Or select from database:
                      </span>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => setIsCVManagerOpen(true)}
                        className='flex-1 px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-lg text-purple-700 hover:from-purple-200 hover:to-pink-200 transition-all duration-300 text-sm font-medium'
                      >
                        {selectedCVFromDB
                          ? 'content' in selectedCVFromDB
                            ? selectedCVFromDB.name
                            : selectedCVFromDB.fileName
                          : 'Select CV from Database'}
                      </button>
                      {selectedCVFromDB && (
                        <button
                          onClick={() => {
                            setSelectedCVFromDB(null);
                            setUseDatabaseCV(false);
                          }}
                          className='px-3 py-2 bg-red-100 border border-red-300 rounded-lg text-red-700 hover:bg-red-200 transition-colors text-sm'
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Description Section - Top Right */}
                <div className='space-y-3'>
                  <LabeledTextarea
                    id='job-description'
                    label='Target Job Description'
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    placeholder='Paste the complete job description here...'
                  />
                  {/* Spacer container to align with Left Column's "Or select from database" block */}
                  <div className='space-y-2'>
                    <div
                      className='flex items-center gap-2 invisible select-none'
                      aria-hidden='true'
                    >
                      {/* Matches the height/margin of the label in the left column */}
                      <DatabaseIcon className='w-4 h-4' />
                      <span className='text-sm font-medium'>Or select from database:</span>
                    </div>
                    <div className='flex justify-end'>
                      <button
                        onClick={handleOptimize}
                        disabled={!isFormValid || isLoading || isParsing || isScanning}
                        className='w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-[1.02] disabled:transform-none'
                      >
                        {isLoading ? (
                          <>
                            <LoadingSpinner />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <SparkleIcon className='h-4 w-4' />
                            Optimize CV
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {optimizedCvData && (
            <div
              ref={resultsRef}
              className='bg-gradient-to-br from-white/95 via-pink-50/95 to-purple-50/95 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-pink-200/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 flex flex-col'
            >
              <h2 className='text-2xl font-bold mb-4 bg-gradient-to-r from-pink-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                Your Optimized CV
              </h2>
              <div className='flex-grow bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-xl border border-purple-200/50 min-h-[40rem] flex flex-col overflow-hidden shadow-inner'>
                {isLoading && (
                  <div className='m-auto text-center text-slate-500'>
                    <div className='flex justify-center'>
                      <LoadingSpinner className='h-10 w-10' />
                    </div>
                    <p className='mt-4 font-semibold'>Generating your new CV...</p>
                    <p className='text-sm'>This may take a moment.</p>
                  </div>
                )}
                {error && (
                  <div className='m-auto text-center text-red-600 bg-red-50 p-6 rounded-md w-full'>
                    <p className='font-semibold'>Error</p>
                    <p className='text-sm mt-2'>{error}</p>
                  </div>
                )}
                {pdfDocument && (
                  <PDFViewer
                    key={selectedTemplate}
                    width='100%'
                    height='100%'
                    className='w-full h-full min-h-[600px] border-none'
                    showToolbar={true}
                  >
                    {pdfDocument}
                  </PDFViewer>
                )}
                {!isLoading && !error && !optimizedCvData && (
                  <div className='m-auto text-center text-slate-500'>
                    <p>Your optimized CV will appear here after processing.</p>
                  </div>
                )}
              </div>

              {optimizedCvData && (
                <div className='mt-6 space-y-4'>
                  <div className='flex gap-3'>
                    <button
                      onClick={handleSaveCurrentCV}
                      className='flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02]'
                    >
                      <DatabaseIcon className='h-4 w-4' />
                      Save to Database
                    </button>

                    <button
                      onClick={() => setIsChatOpen(!isChatOpen)}
                      className='flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-[1.02]'
                    >
                      <SparkleIcon className='h-4 w-4' />
                      {isChatOpen ? 'Close AI Chat' : 'AI Chat'}
                    </button>
                  </div>

                  {/* AI Chat Interface */}
                  {isChatOpen && (
                    <div className='bg-gradient-to-br from-white/95 via-emerald-50/95 to-teal-50/95 backdrop-blur-sm border border-emerald-200/50 rounded-xl shadow-lg'>
                      <div className='p-4 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50'>
                        <h3 className='font-semibold text-slate-800 flex items-center gap-2'>
                          <SparkleIcon className='h-4 w-4 text-emerald-600' />
                          AI Assistant - Modify Your CV
                        </h3>
                        <p className='text-sm text-slate-600 mt-1'>
                          Ask me to make specific changes to your CV, like &quot;Add Python to my
                          skills&quot; or &quot;Make the summary more concise&quot;
                        </p>
                      </div>

                      {/* Chat Messages */}
                      <div className='h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50'>
                        {chatMessages.length === 0 ? (
                          <div className='text-center text-slate-500 py-8'>
                            <SparkleIcon className='h-8 w-8 mx-auto text-slate-400 mb-2' />
                            <p>Start a conversation to modify your CV!</p>
                            <p className='text-sm mt-1'>
                              Try: &quot;Add JavaScript to my skills&quot; or &quot;Shorten my
                              professional summary&quot;
                            </p>
                          </div>
                        ) : (
                          chatMessages.map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                                  msg.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-800'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))
                        )}
                        {isChatLoading && (
                          <div className='flex justify-start'>
                            <div className='bg-white border border-slate-200 text-slate-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2'>
                              <LoadingSpinner className='h-3 w-3' />
                              Updating your CV...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className='p-4 border-t border-slate-200'>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (chatInput.trim() && !isChatLoading) {
                              handleChatMessage(chatInput);
                            }
                          }}
                          className='flex gap-2'
                        >
                          <input
                            type='text'
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder='Ask me to modify your CV...'
                            disabled={isChatLoading}
                            className='flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-slate-100'
                          />
                          <button
                            type='submit'
                            disabled={!chatInput.trim() || isChatLoading}
                            className='px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none'
                          >
                            Send
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Optimization Analysis Section */}
          {optimizedCvData && <OptimizationAnalysis optimizedCvData={optimizedCvData} />}
        </div>
      </main>

      {/* CV Manager Modal */}
      <Suspense fallback={null}>
        <CVManager
          isOpen={isCVManagerOpen}
          onClose={() => setIsCVManagerOpen(false)}
          onSelectCV={handleSelectCVFromDB}
          onSelectMultipleCVs={handleSelectMultipleCVsFromDB}
        />
      </Suspense>
    </div>
  );
}
