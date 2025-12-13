import React from 'react';
import { PDFDownloadLink, Font } from '@react-pdf/renderer';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { DownloadIcon, XCircleIcon } from './icons';
import { CvData } from '../services/geminiService';

// Register custom fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'Merriweather',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.woff2' },
    { src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l521wRZWMf6.woff2', fontWeight: 'bold' },
  ],
});

Font.register({
  family: 'Lato',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXg.woff2' },
    { src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwiPGQ.woff2', fontWeight: 'bold' },
  ],
});

type TemplateType = 'Classic' | 'Modern' | 'Creative' | 'Minimal';

// Error boundary component for PDF templates
class PDFErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error('PDF Template Error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
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
  const fallbackTemplate = <ClassicTemplate cvData={cvData} />;
  
  return (
    <PDFErrorBoundary fallback={fallbackTemplate}>
      {(() => {
        switch (template) {
          case 'Modern':
            return <ModernTemplate cvData={cvData} />;
          case 'Creative':
            return <CreativeTemplate cvData={cvData} />;
          case 'Minimal':
            return <MinimalTemplate cvData={cvData} />;
          case 'Classic':
          default:
            return <ClassicTemplate cvData={cvData} />;
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
      className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02]"
    >
      {({ blob, url, loading, error }) => {
        if (error) {
          console.error('PDF generation error:', error);
          return (
            <div className="flex items-center gap-2 text-red-600">
              <XCircleIcon className="h-4 w-4" />
              PDF Error - Try Another Template
            </div>
          );
        }
        return (
          <>
            <DownloadIcon className="h-4 w-4" />
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </>
        );
      }}
    </PDFDownloadLink>
  );
};

export default PDFExportButton;
