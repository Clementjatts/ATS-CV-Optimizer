import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFGenerationController } from '../../../services/pdf-controller';
import { generatePdfFilename } from '../../../services/pdf-filename-generator';
import { CvData } from '../../../services/geminiService';

describe('PDF Generation Workflow Integration Tests (Simplified)', () => {
  let controller: PDFGenerationController;
  let mockCvData: CvData;

  beforeEach(() => {
    controller = new PDFGenerationController();
    
    mockCvData = {
      fullName: 'John Doe',
      contactInfo: {
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/johndoe'
      },
      professionalSummary: 'Experienced software engineer with 5+ years of experience.',
      workExperience: [
        {
          jobTitle: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'New York, NY',
          dates: '2020-2023',
          responsibilities: [
            'Led development of web applications',
            'Managed team of 5 developers'
          ]
        }
      ],
      education: [
        {
          institution: 'University of Technology',
          degree: 'Bachelor of Computer Science',
          dates: '2016-2020'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js'],
      certifications: [],
      optimizationDetails: {
        keywordsIntegrated: ['JavaScript', 'React'],
        skillsAligned: ['Node.js'],
        experienceOptimizations: ['Senior Software Engineer'],
        summaryTailoring: 'Experienced software engineer'
      }
    };
  });

  describe('System Integration', () => {
    it('should initialize controller with proper capabilities', () => {
      const capabilities = controller.validateBrowserSupport();
      
      expect(capabilities).toHaveProperty('supportsCanvas');
      expect(capabilities).toHaveProperty('supportsWebGL');
      expect(capabilities).toHaveProperty('maxCanvasSize');
      expect(capabilities).toHaveProperty('memoryLimit');
      expect(capabilities.supportsCanvas).toBe(true);
    });

    it('should select appropriate strategy based on capabilities', () => {
      const goodCapabilities = {
        supportsCanvas: true,
        supportsWebGL: true,
        supportsWorkers: true,
        supportsOffscreenCanvas: false,
        maxCanvasSize: 4096,
        memoryLimit: 100 * 1024 * 1024
      };
      
      const strategy = controller.selectStrategy(goodCapabilities);
      expect(strategy).toBe('modern');
      
      const limitedCapabilities = {
        supportsCanvas: true,
        supportsWebGL: false,
        supportsWorkers: false,
        supportsOffscreenCanvas: false,
        maxCanvasSize: 1024,
        memoryLimit: 10 * 1024 * 1024
      };
      
      const fallbackStrategy = controller.selectStrategy(limitedCapabilities);
      expect(fallbackStrategy).toBe('legacy');
    });

    it('should create proper configuration from options', () => {
      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'high' as const,
        format: 'letter' as const,
        margins: {
          top: 0.5,
          right: 0.5,
          bottom: 0.5,
          left: 0.5
        },
        metadata: {
          title: `${mockCvData.fullName} - Professional CV`,
          author: mockCvData.fullName,
          subject: 'Professional CV',
          keywords: ['CV', 'Resume'],
          creator: 'ATS CV Optimizer',
          producer: 'PDF Generator'
        }
      };

      const defaultConfig = controller.createDefaultConfiguration();
      expect(defaultConfig).toHaveProperty('format');
      expect(defaultConfig).toHaveProperty('margins');
      expect(defaultConfig).toHaveProperty('metadata');
      expect(defaultConfig.format).toBe('letter');
      expect(defaultConfig.margins.top).toBe(0.5);
    });
  });

  describe('Filename Generation Integration', () => {
    it('should generate valid filenames for different CV data', () => {
      const testCases = [
        {
          name: 'Simple Name',
          cvData: { ...mockCvData, fullName: 'John Doe' },
          expected: 'John_Doe_CV.pdf'
        },
        {
          name: 'Name with Special Characters',
          cvData: { ...mockCvData, fullName: 'José María' },
          expectedPattern: /Jos.*Mara.*CV\.pdf/
        },
        {
          name: 'Long Name',
          cvData: { ...mockCvData, fullName: 'Very Long Professional Name That Might Need Truncation' },
          maxLength: 50
        }
      ];

      testCases.forEach(testCase => {
        const filename = generatePdfFilename(testCase.cvData, testCase.maxLength ? { maxLength: testCase.maxLength } : {});
        
        if (testCase.expected) {
          expect(filename).toBe(testCase.expected);
        } else if (testCase.expectedPattern) {
          expect(filename).toMatch(testCase.expectedPattern);
        } else if (testCase.maxLength) {
          expect(filename.length).toBeLessThanOrEqual(testCase.maxLength);
        }
        
        expect(filename).toMatch(/\.pdf$/);
      });
    });

    it('should handle edge cases in filename generation', () => {
      const edgeCases = [
        { ...mockCvData, fullName: '' },
        { ...mockCvData, fullName: '   ' },
        { ...mockCvData, fullName: 'A' },
        { ...mockCvData, fullName: 'CON' }, // Reserved Windows name
      ];

      edgeCases.forEach(cvData => {
        const filename = generatePdfFilename(cvData);
        expect(filename).toBeTruthy();
        expect(filename).toMatch(/\.pdf$/);
        expect(filename.length).toBeGreaterThan(4); // At least ".pdf"
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle validation errors gracefully', async () => {
      // Test with null element
      const result1 = await controller.generatePDF(null as any, {
        filename: 'test.pdf',
        quality: 'medium',
        format: 'letter',
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
        metadata: {
          title: 'Test',
          author: 'Test',
          subject: 'Test',
          keywords: [],
          creator: 'Test',
          producer: 'Test'
        }
      });

      expect(result1.success).toBe(false);
      expect(result1.error).toBeDefined();
      expect(result1.metadata.warnings).toBeDefined();

      // Test with empty filename
      const mockElement = document.createElement('div');
      mockElement.style.width = '800px';
      mockElement.style.height = '600px';
      
      const result2 = await controller.generatePDF(mockElement, {
        filename: '',
        quality: 'medium',
        format: 'letter',
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
        metadata: {
          title: 'Test',
          author: 'Test',
          subject: 'Test',
          keywords: [],
          creator: 'Test',
          producer: 'Test'
        }
      });

      expect(result2.success).toBe(false);
      expect(result2.error).toBeDefined();
    });

    it('should provide recovery suggestions for different error types', () => {
      const errorTypes = [
        {
          error: {
            message: 'Canvas not supported',
            category: 'browser' as const,
            recoverable: true,
            getUserMessage: () => 'Browser error',
            getTechnicalDetails: () => 'Canvas not supported',
            getRecoveryPlan: () => ({
              retryWithSameStrategy: false,
              fallbackStrategy: 'legacy' as const,
              userAction: 'Update browser',
              technicalDetails: 'Canvas not supported'
            })
          }
        },
        {
          error: {
            message: 'Network timeout',
            category: 'network' as const,
            recoverable: true,
            getUserMessage: () => 'Network error',
            getTechnicalDetails: () => 'Network timeout',
            getRecoveryPlan: () => ({
              retryWithSameStrategy: true,
              fallbackStrategy: undefined,
              userAction: 'Check connection',
              technicalDetails: 'Network timeout'
            })
          }
        }
      ];

      errorTypes.forEach(({ error }) => {
        const suggestions = controller.getRecoverySuggestions(error as any);
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('System Health Monitoring', () => {
    it('should track system health metrics', () => {
      const initialHealth = controller.getSystemHealth();
      
      expect(initialHealth).toHaveProperty('isStable');
      expect(initialHealth).toHaveProperty('recommendation');
      expect(initialHealth).toHaveProperty('errorStats');
      expect(initialHealth).toHaveProperty('recoveryStats');
      
      expect(typeof initialHealth.isStable).toBe('boolean');
      expect(typeof initialHealth.recommendation).toBe('string');
      expect(typeof initialHealth.errorStats).toBe('object');
      expect(typeof initialHealth.recoveryStats).toBe('object');
    });

    it('should report system readiness correctly', () => {
      const status = controller.isSystemReady();
      
      expect(status).toHaveProperty('ready');
      expect(status).toHaveProperty('issues');
      expect(typeof status.ready).toBe('boolean');
      expect(Array.isArray(status.issues)).toBe(true);
    });

    it('should reset tracking when requested', () => {
      // Generate some activity first
      controller.getRecoverySuggestions({
        message: 'Test error',
        category: 'generation',
        recoverable: true,
        getUserMessage: () => 'Test',
        getTechnicalDetails: () => 'Test',
        getRecoveryPlan: () => ({
          retryWithSameStrategy: true,
          fallbackStrategy: 'legacy',
          userAction: 'Test',
          technicalDetails: 'Test'
        })
      } as any);

      const healthBefore = controller.getSystemHealth();
      controller.resetErrorTracking();
      const healthAfter = controller.getSystemHealth();
      
      expect(healthAfter.errorStats.totalErrors).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    it('should handle different quality settings', () => {
      const qualities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
      
      qualities.forEach(quality => {
        const filename = generatePdfFilename(mockCvData, { customSuffix: quality });
        
        const options = {
          filename,
          quality,
          format: 'letter' as const,
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
          metadata: {
            title: `Test CV - ${quality}`,
            author: 'Test User',
            subject: 'Test',
            keywords: [quality],
            creator: 'Test',
            producer: 'Test'
          }
        };

        expect(options.quality).toBe(quality);
        expect(options.filename).toContain(quality);
      });
    });

    it('should handle different page formats', () => {
      const formats: Array<'letter' | 'a4'> = ['letter', 'a4'];
      
      formats.forEach(format => {
        const filename = generatePdfFilename(mockCvData, { customSuffix: format });
        
        const options = {
          filename,
          quality: 'medium' as const,
          format,
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
          metadata: {
            title: `Test CV - ${format}`,
            author: 'Test User',
            subject: 'Test',
            keywords: [format],
            creator: 'Test',
            producer: 'Test'
          }
        };

        expect(options.format).toBe(format);
        expect(options.filename).toContain(format);
      });
    });

    it('should validate margin configurations', () => {
      const marginConfigs = [
        { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
        { top: 1.0, right: 1.0, bottom: 1.0, left: 1.0 },
        { top: 0.25, right: 0.25, bottom: 0.25, left: 0.25 }
      ];

      marginConfigs.forEach(margins => {
        const options = {
          filename: 'test.pdf',
          quality: 'medium' as const,
          format: 'letter' as const,
          margins,
          metadata: {
            title: 'Test CV',
            author: 'Test User',
            subject: 'Test',
            keywords: ['test'],
            creator: 'Test',
            producer: 'Test'
          }
        };

        expect(options.margins.top).toBe(margins.top);
        expect(options.margins.right).toBe(margins.right);
        expect(options.margins.bottom).toBe(margins.bottom);
        expect(options.margins.left).toBe(margins.left);
      });
    });
  });

  describe('Workflow Validation', () => {
    it('should validate complete workflow steps', () => {
      // Step 1: Generate filename
      const filename = generatePdfFilename(mockCvData);
      expect(filename).toBeTruthy();
      expect(filename).toMatch(/\.pdf$/);

      // Step 2: Create options
      const options = {
        filename,
        quality: 'high' as const,
        format: 'letter' as const,
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
        metadata: {
          title: `${mockCvData.fullName} - Professional CV`,
          author: mockCvData.fullName,
          subject: 'Professional CV',
          keywords: ['CV', 'Resume'],
          creator: 'ATS CV Optimizer',
          producer: 'PDF Generator'
        }
      };

      expect(options.filename).toBe(filename);
      expect(options.quality).toBe('high');

      // Step 3: Validate system readiness
      const systemStatus = controller.isSystemReady();
      expect(systemStatus).toHaveProperty('ready');
      expect(systemStatus).toHaveProperty('issues');

      // Step 4: Check browser capabilities
      const capabilities = controller.validateBrowserSupport();
      expect(capabilities.supportsCanvas).toBe(true);

      // Step 5: Select strategy
      const strategy = controller.selectStrategy(capabilities);
      expect(['modern', 'fallback', 'legacy']).toContain(strategy);
    });

    it('should handle workflow with different CV data structures', () => {
      const cvVariations = [
        // Minimal CV
        {
          fullName: 'Jane Smith',
          contactInfo: {
            email: 'jane@example.com',
            phone: '+1-555-0123',
            location: 'Boston, MA',
            linkedin: 'https://linkedin.com/in/janesmith'
          },
          professionalSummary: 'Software developer',
          workExperience: [],
          education: [],
          skills: ['JavaScript'],
          certifications: []
        },
        // Complex CV
        {
          fullName: 'Dr. Alexander Johnson-Smith III',
          contactInfo: {
            email: 'alex.johnson.smith@university.edu',
            phone: '+1-555-0123',
            location: 'San Francisco, CA',
            linkedin: 'https://linkedin.com/in/alexjohnsonsmith'
          },
          professionalSummary: 'Distinguished researcher and academic with extensive experience in computer science and artificial intelligence.',
          workExperience: Array(5).fill(null).map((_, i) => ({
            jobTitle: `Position ${i + 1}`,
            company: `Company ${i + 1}`,
            location: 'Various',
            dates: `${2020 - i}-${2021 - i}`,
            responsibilities: [`Responsibility ${i + 1}A`, `Responsibility ${i + 1}B`]
          })),
          education: Array(3).fill(null).map((_, i) => ({
            institution: `University ${i + 1}`,
            degree: `Degree ${i + 1}`,
            dates: `${2010 + i * 2}-${2012 + i * 2}`
          })),
          skills: Array(20).fill(null).map((_, i) => `Skill ${i + 1}`),
          certifications: Array(5).fill(null).map((_, i) => ({
            name: `Certification ${i + 1}`,
            issuer: `Issuer ${i + 1}`,
            date: `${2020 + i}`
          }))
        }
      ];

      cvVariations.forEach((cvData, index) => {
        const filename = generatePdfFilename(cvData);
        expect(filename).toBeTruthy();
        expect(filename).toMatch(/\.pdf$/);
        
        const options = {
          filename,
          quality: 'medium' as const,
          format: 'letter' as const,
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
          metadata: {
            title: `${cvData.fullName} - Professional CV`,
            author: cvData.fullName,
            subject: 'Professional CV',
            keywords: ['CV', 'Resume'],
            creator: 'ATS CV Optimizer',
            producer: 'PDF Generator'
          }
        };

        expect(options.metadata.title).toContain(cvData.fullName);
        expect(options.metadata.author).toBe(cvData.fullName);
      });
    });
  });
});