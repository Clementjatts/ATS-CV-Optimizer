import React from 'react';
import { PDFDownloadLink, Font } from '@react-pdf/renderer';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { DownloadIcon, XCircleIcon } from './icons';
import { CvData } from '../services/geminiService';

import { StandardTemplate } from './templates/StandardTemplate';

// Register custom fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 'bold',
    },
  ],
});

Font.register({
  family: 'Merriweather',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.woff2' },
    {
      src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.woff2',
      fontWeight: 'bold',
    },
  ],
});

Font.register({
  family: 'Lato',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2' },
    {
      src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ.woff2',
      fontWeight: 'bold',
    },
  ],
});

type TemplateType = 'Standard' | 'Classic' | 'Modern' | 'Creative' | 'Minimal';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Error boundary component for PDF templates
class PDFErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  // Explicitly declare properties since @types/react is missing
  declare state: ErrorBoundaryState;
  declare props: ErrorBoundaryProps;

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    console.error('PDF Template Error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('PDF Template Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Helper component to render the correct template based on state
const TemplateRenderer = ({ template, cvData }: { template: TemplateType; cvData: CvData }) => {
  const fallbackTemplate = <StandardTemplate cvData={cvData} />;

  return (
    <PDFErrorBoundary fallback={fallbackTemplate}>
      {(() => {
        switch (template) {
          case 'Standard':
            return <StandardTemplate cvData={cvData} />;
          case 'Modern':
            return <ModernTemplate cvData={cvData} />;
          case 'Creative':
            return <CreativeTemplate cvData={cvData} />;
          case 'Minimal':
            return <MinimalTemplate cvData={cvData} />;
          case 'Classic':
            return <ClassicTemplate cvData={cvData} />;
          default:
            return <StandardTemplate cvData={cvData} />;
        }
      })()}
    </PDFErrorBoundary>
  );
};

interface PDFExportButtonProps {
  template: TemplateType;
  cvData: CvData;
  fileName: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({ template, cvData, fileName }) => {
  return (
    <PDFDownloadLink
      document={<TemplateRenderer template={template} cvData={cvData} />}
      fileName={fileName}
      className='flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02]'
    >
      {({ blob: _blob, url: _url, loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error);
          return (
            <div className='flex items-center gap-2 text-red-600'>
              <XCircleIcon className='h-4 w-4' />
              PDF Error - Try Another Template
            </div>
          );
        }
        return (
          <>
            <DownloadIcon className='h-4 w-4' />
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </>
        );
      }}
    </PDFDownloadLink>
  );
};

export default PDFExportButton;
