import { useState } from 'react';
import { optimizeCvWithGemini, CvData, enhanceCVWithGemini } from '../services/geminiService';
import { cvService, UploadedFile, CVSource } from '../services/cvService';
import { parseFile } from '../utils/fileParsing';

export const useCVOptimization = () => {
  const [optimizedCvData, setOptimizedCvData] = useState<CvData | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractJobTitle = (jobDescription: string): string => {
    if (!jobDescription.trim()) return 'CV';

    const patterns = [
      /(?:position|role|job|opening|opportunity)[\s:]+([A-Z][A-Za-z\s&]+?)(?:\n|$|\.|,|;)/i,
      /(?:seeking|looking for|hiring)[\s:]+([A-Z][A-Za-z\s&]+?)(?:\n|$|\.|,|;)/i,
      /(?:title|position)[\s:]+([A-Z][A-Za-z\s&]+?)(?:\n|$|\.|,|;)/i,
      /^([A-Z][A-Za-z\s&]+?)(?:\n|$|\.|,|;)/,
    ];

    for (const pattern of patterns) {
      const match = jobDescription.match(pattern);
      if (match && match[1]) {
        let title = match[1].trim();
        title = title.replace(/[^\w\s&]/g, '').trim();
        if (title.length > 50) {
          title = title.substring(0, 47) + '...';
        }
        if (title.length > 3) {
          return title;
        }
      }
    }

    const words = jobDescription.trim().split(/\s+/).slice(0, 4);
    const fallback = words.join(' ').replace(/[^\w\s]/g, '');
    return fallback.length > 3 ? fallback : 'CV';
  };

  const handleOptimize = async (
    userCvText: string,
    jobDescriptionText: string,
    useDatabaseCV: boolean,
    selectedCVFromDB: CVSource | null
  ) => {
    setIsLoading(true);
    setError(null);
    setOptimizedCvData(null);

    try {
      let cvContent = userCvText;

      if (useDatabaseCV && selectedCVFromDB) {
        if ('content' in selectedCVFromDB) {
          cvContent = selectedCVFromDB.content;
        } else {
          const uploadedFile = selectedCVFromDB as UploadedFile;

          if (uploadedFile.parsedText && uploadedFile.parsedText.trim()) {
            cvContent = uploadedFile.parsedText;
          } else {
            try {
              if (!uploadedFile.downloadURL || !uploadedFile.downloadURL.startsWith('https://')) {
                throw new Error('Invalid download URL for the uploaded file');
              }

              const response = await fetch(uploadedFile.downloadURL);
              if (!response.ok) {
                throw new Error(
                  `Failed to download file: ${response.status} ${response.statusText}`
                );
              }

              const blob = await response.blob();
              const file = new File([blob], uploadedFile.fileName, { type: uploadedFile.fileType });
              const { text: parsedText } = await parseFile(file);
              cvContent = parsedText;
            } catch (error) {
              console.error('Error downloading/parsing uploaded file:', error);
              throw new Error(
                'Failed to process uploaded file. Please re-upload the file to store its parsed content.'
              );
            }
          }
        }
      } else if (!userCvText.trim()) {
        const relevantCVs = await cvService.getRelevantCVs(jobDescriptionText);
        if (relevantCVs.length > 0) {
          cvContent = relevantCVs[0].content;
        }
      }

      const { title, cvData } = await enhanceCVWithGemini(cvContent, jobDescriptionText);

      setJobTitle(title);

      if (cvData) {
        setOptimizedCvData(cvData);
      } else {
        const result = await optimizeCvWithGemini(cvContent, jobDescriptionText);
        setOptimizedCvData(result);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'An unknown error occurred. The AI may have returned an invalid format.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    optimizedCvData,
    setOptimizedCvData,
    jobTitle,
    extractJobTitle,
    isLoading,
    error,
    setError,
    handleOptimize,
  };
};
