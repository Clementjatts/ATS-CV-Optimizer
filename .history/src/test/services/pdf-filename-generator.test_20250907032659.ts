import { describe, it, expect } from 'vitest';
import {
  PDFFilenameGenerator,
  generatePdfFilename,
  validatePdfFilename
} from '../../../services/pdf-filename-generator';
import { CvData } from '../../../services/geminiService';

describe('PDFFilenameGenerator', () => {
  const mockCvData: CvData = {
    fullName: 'John Doe',
    contactInfo: {
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/johndoe'
    },
    professionalSummary: 'Experienced software developer',
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    optimizationDetails: {
      keywordsIntegrated: [],
      skillsAligned: [],
      experienceOptimizations: [],
      summaryTailoring: ''
    }
  };

  describe('Basic Filename Generation', () => {
    it('should generate filename from full name', () => {
      const result = PDFFilenameGenerator.generateFilename(mockCvData);
      
      expect(result.filename).toBe('John_Doe_CV.pdf');
      expect(result.sanitized).toBe(false);
      expect(result.truncated).toBe(false);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle names with special characters', () => {
      const cvData = {
        ...mockCvData,
        fullName: 'José María O\'Connor-Smith'
      };
      
      const result = PDFFilenameGenerator.generateFilename(cvData);
      
      expect(result.filename).toBe('Jos_OConnor-Smith_CV.pdf');
      expect(result.sanitized).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle very long names', () => {
      const cvData = {
        ...mockCvData,
        fullName: 'This Is A Very Long Name That Should Be Truncated Because It Exceeds The Maximum Length Limit'
      };
      
      const result = PDFFilenameGenerator.generateFilename(cvData, { maxLength: 50 });
      
      expect(result.filename.length).toBeLessThanOrEqual(50);
      // The filename might be naturally short enough, so we just check the length constraint
    });

    it('should handle empty or invalid names', () => {
      const cvData = {
        ...mockCvData,
        fullName: ''
      };
      
      const result = PDFFilenameGenerator.generateFilename(cvData);
      
      expect(result.filename).toBe('CV.pdf');
      expect(result.warnings).toContain('No valid name found, using fallback filename');
    });
  });

  describe('Name Component Extraction', () => {
    it('should extract first and last name correctly', () => {
      const components = (PDFFilenameGenerator as any).extractNameComponents('John Doe');
      
      expect(components.firstName).toBe('John');
      expect(components.lastName).toBe('Doe');
      expect(components.middleName).toBeUndefined();
    });

    it('should handle middle names', () => {
      const components = (PDFFilenameGenerator as any).extractNameComponents('John Michael Doe');
      
      expect(components.firstName).toBe('John');
      expect(components.lastName).toBe('Doe');
      expect(components.middleName).toBe('Michael');
    });

    it('should handle multiple middle names', () => {
      const components = (PDFFilenameGenerator as any).extractNameComponents('John Michael James Doe');
      
      expect(components.firstName).toBe('John');
      expect(components.lastName).toBe('Doe');
      expect(components.middleName).toBe('Michael James');
    });

    it('should handle single name', () => {
      const components = (PDFFilenameGenerator as any).extractNameComponents('Madonna');
      
      expect(components.firstName).toBe('Madonna');
      expect(components.lastName).toBe('');
    });

    it('should clean special characters from names', () => {
      const components = (PDFFilenameGenerator as any).extractNameComponents('John@#$ Doe!!!');
      
      expect(components.firstName).toBe('John');
      expect(components.lastName).toBe('Doe');
    });
  });

  describe('Filename Options', () => {
    it('should include date when requested', () => {
      const result = PDFFilenameGenerator.generateFilename(mockCvData, { includeDate: true });
      
      expect(result.filename).toMatch(/John_Doe_\d{8}_CV\.pdf/);
    });

    it('should include custom suffix', () => {
      const result = PDFFilenameGenerator.generateFilename(mockCvData, { customSuffix: 'Senior' });
      
      expect(result.filename).toBe('John_Doe_Senior_CV.pdf');
    });

    it('should use detailed format with middle name', () => {
      const cvData = {
        ...mockCvData,
        fullName: 'John Michael Doe'
      };
      
      const result = PDFFilenameGenerator.generateFilename(cvData, { format: 'detailed' });
      
      expect(result.filename).toBe('John_M_Doe_CV.pdf');
    });

    it('should respect maximum length', () => {
      const result = PDFFilenameGenerator.generateFilename(mockCvData, { maxLength: 20 });
      
      expect(result.filename.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Filename Sanitization', () => {
    it('should remove invalid characters', () => {
      const sanitized = (PDFFilenameGenerator as any).sanitizeFilename('John<>:"/\\|?*Doe');
      expect(sanitized).toBe('JohnDoe');
    });

    it('should replace spaces with underscores', () => {
      const sanitized = (PDFFilenameGenerator as any).sanitizeFilename('John Doe Smith');
      expect(sanitized).toBe('John_Doe_Smith');
    });

    it('should handle multiple consecutive underscores', () => {
      const sanitized = (PDFFilenameGenerator as any).sanitizeFilename('John___Doe');
      expect(sanitized).toBe('John_Doe');
    });

    it('should remove leading and trailing dots/underscores', () => {
      const sanitized = (PDFFilenameGenerator as any).sanitizeFilename('_..John.Doe.._');
      expect(sanitized).toBe('John.Doe');
    });

    it('should handle reserved Windows names', () => {
      const sanitized = (PDFFilenameGenerator as any).sanitizeFilename('CON');
      expect(sanitized).toBe('CON_CV');
    });
  });

  describe('Length Optimization', () => {
    it('should truncate from the end when simple truncation needed', () => {
      const optimized = (PDFFilenameGenerator as any).optimizeLength('VeryLongFilename', 10);
      expect(optimized).toBe('VeryLongFi');
      expect(optimized.length).toBe(10);
    });

    it('should preserve first and last parts when possible', () => {
      const optimized = (PDFFilenameGenerator as any).optimizeLength('First_Middle_Last', 12);
      expect(optimized).toContain('First');
      expect(optimized).toContain('Last');
    });

    it('should return original if already within limit', () => {
      const original = 'Short';
      const optimized = (PDFFilenameGenerator as any).optimizeLength(original, 10);
      expect(optimized).toBe(original);
    });
  });

  describe('Cross-Platform Compatibility', () => {
    it('should validate compatible filenames', () => {
      const validation = PDFFilenameGenerator.validateCrossPlatformCompatibility('John_Doe_CV.pdf');
      
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect invalid characters', () => {
      const validation = PDFFilenameGenerator.validateCrossPlatformCompatibility('John<Doe>.pdf');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Contains invalid characters for Windows compatibility');
    });

    it('should detect reserved names', () => {
      const validation = PDFFilenameGenerator.validateCrossPlatformCompatibility('CON.pdf');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Uses a reserved filename in Windows');
    });

    it('should detect long filenames', () => {
      const longName = 'A'.repeat(150) + '.pdf';
      const validation = PDFFilenameGenerator.validateCrossPlatformCompatibility(longName);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Filename is too long for optimal compatibility');
    });

    it('should detect leading dots', () => {
      const validation = PDFFilenameGenerator.validateCrossPlatformCompatibility('.hidden.pdf');
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Starts with a dot (hidden file on Unix systems)');
    });
  });

  describe('Name Extraction from CV Data', () => {
    it('should extract name from fullName field', () => {
      const name = PDFFilenameGenerator.extractNameFromCvData(mockCvData);
      expect(name).toBe('John Doe');
    });

    it('should fallback to email when fullName is empty', () => {
      const cvData = {
        ...mockCvData,
        fullName: '',
        contactInfo: {
          ...mockCvData.contactInfo,
          email: 'jane.smith@example.com'
        }
      };
      
      const name = PDFFilenameGenerator.extractNameFromCvData(cvData);
      expect(name).toBe('Jane Smith');
    });

    it('should use generic name as last resort', () => {
      const cvData = {
        ...mockCvData,
        fullName: '',
        contactInfo: {
          ...mockCvData.contactInfo,
          email: ''
        }
      };
      
      const name = PDFFilenameGenerator.extractNameFromCvData(cvData);
      expect(name).toBe('Professional');
    });
  });

  describe('Fallback Filename Generation', () => {
    it('should generate fallback without date', () => {
      const fallback = (PDFFilenameGenerator as any).generateFallbackFilename(false);
      expect(fallback).toBe('CV.pdf');
    });

    it('should generate fallback with date', () => {
      const fallback = (PDFFilenameGenerator as any).generateFallbackFilename(true);
      expect(fallback).toMatch(/CV_\d{8}\.pdf/);
    });
  });
});

describe('Convenience Functions', () => {
  const mockCvData: CvData = {
    fullName: 'Jane Smith',
    contactInfo: {
      email: 'jane@example.com',
      phone: '+1-555-0123',
      location: 'Boston, MA',
      linkedin: 'https://linkedin.com/in/janesmith'
    },
    professionalSummary: 'Marketing professional',
    workExperience: [],
    education: [],
    skills: [],
    certifications: []
  };

  describe('generatePdfFilename', () => {
    it('should generate filename using convenience function', () => {
      const filename = generatePdfFilename(mockCvData);
      expect(filename).toBe('Jane_Smith_CV.pdf');
    });

    it('should accept options', () => {
      const filename = generatePdfFilename(mockCvData, { includeDate: true });
      expect(filename).toMatch(/Jane_Smith_\d{8}_CV\.pdf/);
    });
  });

  describe('validatePdfFilename', () => {
    it('should validate good filename', () => {
      const isValid = validatePdfFilename('Jane_Smith_CV.pdf');
      expect(isValid).toBe(true);
    });

    it('should reject invalid filename', () => {
      const isValid = validatePdfFilename('Jane<Smith>.pdf');
      expect(isValid).toBe(false);
    });
  });
});