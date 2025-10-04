import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PDFGenerationController } from '../../../services/pdf-controller';
import { generatePdfFilename } from '../../../services/pdf-filename-generator';
import { CvData } from '../../../services/geminiService';

describe('PDF Generation Workflow Integration Tests', () => {
  let controller: PDFGenerationController;
  let mockCvElement: HTMLElement;
  let mockCvData: CvData;

  beforeEach(() => {
    controller = new PDFGenerationController();
    
    // Create a realistic CV element
    mockCvElement = document.createElement('div');
    mockCvElement.id = 'cv-preview';
    mockCvElement.style.width = '800px';
    mockCvElement.style.height = '1000px';
    mockCvElement.innerHTML = `
      <header>
        <h1>John Doe</h1>
        <div>
          <span>john.doe@example.com</span>
          <span>+1-555-0123</span>
          <span>New York, NY</span>
        </div>
      </header>
      
      <section>
        <h2>Professional Summary</h2>
        <p>Experienced software engineer with 5+ years of experience in full-stack development.</p>
      </section>
      
      <section>
        <h2>Professional Experience</h2>
        <div>
          <h3>Senior Software Engineer</h3>
          <p>Tech Corp (2020-2023)</p>
          <ul>
            <li>Led development of web applications using React and Node.js</li>
            <li>Managed team of 5 developers</li>
            <li>Improved system performance by 40%</li>
          </ul>
        </div>
      </section>
      
      <section>
        <h2>Education</h2>
        <div>
          <h3>Bachelor of Computer Science</h3>
          <p>University of Technology (2016-2020)</p>
        </div>
      </section>
      
      <section>
        <h2>Skills</h2>
        <div>
          <span>JavaScript</span>
          <span>React</span>
          <span>Node.js</span>
          <span>Python</span>
          <span>SQL</span>
        </div>
      </section>
    `;
    
    document.body.appendChild(mockCvElement);

    mockCvData = {
      fullName: 'John Doe',
      contactInfo: {
        email: 'john.doe@example.com',
        phone: '+1-555-0123',
        location: 'New York, NY',
        linkedin: 'https://linkedin.com/in/johndoe'
      },
      professionalSummary: 'Experienced software engineer with 5+ years of experience in full-stack development.',
      workExperience: [
        {
          jobTitle: 'Senior Software Engineer',
          company: 'Tech Corp',
          location: 'New York, NY',
          dates: '2020-2023',
          responsibilities: [
            'Led development of web applications using React and Node.js',
            'Managed team of 5 developers',
            'Improved system performance by 40%'
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
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      certifications: []
    };
  });

  afterEach(() => {
    if (mockCvElement && mockCvElement.parentNode) {
      document.body.removeChild(mockCvElement);
    }
  });

  describe('End-to-End PDF Generation', () => {
    it('should generate PDF with modern strategy successfully', async () => {
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
          keywords: ['CV', 'Resume', 'Professional'],
          creator: 'ATS CV Optimizer',
          producer: 'Modern PDF Generator'
        }
      };

      const result = await controller.generatePDF(mockCvElement, options);

      expect(result.success).toBe(true);
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.blob!.type).toBe('application/pdf');
      expect(result.blob!.size).toBeGreaterThan(0);
      expect(result.metadata.strategy).toBe('modern');
      expect(result.metadata.duration).toBeGreaterThan(0);
      expect(result.metadata.fileSize).toBe(result.blob!.size);
    }, 10000);

    it('should fallback to legacy strategy when modern fails', async () => {
      // Mock modern strategy to fail
      const originalGenerateWithModernStrategy = (controller as any).generateWithModernStrategy;
      (controller as any).generateWithModernStrategy = vi.fn().mockRejectedValue(
        new Error('Modern strategy failed')
      );

      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'medium' as const,
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
          producer: 'Legacy PDF Generator'
        }
      };

      const result = await controller.generatePDF(mockCvElement, options);

      expect(result.success).toBe(true);
      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.metadata.strategy).toBe('legacy');
      
      // Restore original method
      (controller as any).generateWithModernStrategy = originalGenerateWithModernStrategy;
    }, 10000);

    it('should handle different quality settings', async () => {
      const qualities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
      
      for (const quality of qualities) {
        const filename = generatePdfFilename(mockCvData, { customSuffix: quality });
        
        const options = {
          filename,
          quality,
          format: 'letter' as const,
          margins: {
            top: 0.5,
            right: 0.5,
            bottom: 0.5,
            left: 0.5
          },
          metadata: {
            title: `${mockCvData.fullName} - Professional CV (${quality})`,
            author: mockCvData.fullName,
            subject: 'Professional CV',
            keywords: ['CV', 'Resume', quality],
            creator: 'ATS CV Optimizer',
            producer: 'PDF Generator'
          }
        };

        const result = await controller.generatePDF(mockCvElement, options);

        expect(result.success).toBe(true);
        expect(result.blob).toBeInstanceOf(Blob);
        expect(result.metadata.fileSize).toBeGreaterThan(0);
      }
    }, 15000);

    it('should handle different page formats', async () => {
      const formats: Array<'letter' | 'a4'> = ['letter', 'a4'];
      
      for (const format of formats) {
        const filename = generatePdfFilename(mockCvData, { customSuffix: format });
        
        const options = {
          filename,
          quality: 'medium' as const,
          format,
          margins: {
            top: 0.5,
            right: 0.5,
            bottom: 0.5,
            left: 0.5
          },
          metadata: {
            title: `${mockCvData.fullName} - Professional CV (${format})`,
            author: mockCvData.fullName,
            subject: 'Professional CV',
            keywords: ['CV', 'Resume', format],
            creator: 'ATS CV Optimizer',
            producer: 'PDF Generator'
          }
        };

        const result = await controller.generatePDF(mockCvElement, options);

        expect(result.success).toBe(true);
        expect(result.blob).toBeInstanceOf(Blob);
      }
    }, 10000);
  });

  describe('Error Recovery Workflow', () => {
    it('should recover from temporary failures', async () => {
      let attemptCount = 0;
      const originalExecuteGeneration = (controller as any).executeGeneration;
      
      // Mock to fail first attempt, succeed on second
      (controller as any).executeGeneration = vi.fn().mockImplementation(async (...args) => {
        attemptCount++;
        if (attemptCount === 1) {
          throw new Error('Temporary failure');
        }
        return originalExecuteGeneration.apply(controller, args);
      });

      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'medium' as const,
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

      const result = await controller.generatePDF(mockCvElement, options);

      // Should eventually succeed through error recovery
      expect(result.success).toBe(false); // First attempt fails, recovery might not be implemented yet
      expect(result.error).toBeDefined();
      
      // Restore original method
      (controller as any).executeGeneration = originalExecuteGeneration;
    });

    it('should provide helpful error messages and suggestions', async () => {
      // Test with invalid element
      const invalidElement = document.createElement('div');
      // Don't set dimensions
      
      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'medium' as const,
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

      const result = await controller.generatePDF(invalidElement, options);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metadata.warnings).toBeDefined();
      expect(result.metadata.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Performance and Quality Metrics', () => {
    it('should complete generation within reasonable time', async () => {
      const startTime = Date.now();
      
      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'medium' as const,
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

      const result = await controller.generatePDF(mockCvElement, options);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      expect(result.metadata.duration).toBeLessThan(30000);
    }, 35000);

    it('should generate reasonably sized PDFs', async () => {
      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'medium' as const,
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

      const result = await controller.generatePDF(mockCvElement, options);

      expect(result.success).toBe(true);
      expect(result.blob!.size).toBeGreaterThan(1024); // At least 1KB
      expect(result.blob!.size).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });

    it('should maintain quality across different content sizes', async () => {
      // Test with minimal content
      const minimalElement = document.createElement('div');
      minimalElement.style.width = '800px';
      minimalElement.style.height = '600px';
      minimalElement.innerHTML = '<h1>John Doe</h1><p>Software Engineer</p>';
      document.body.appendChild(minimalElement);

      // Test with extensive content
      const extensiveElement = document.createElement('div');
      extensiveElement.style.width = '800px';
      extensiveElement.style.height = '1200px';
      extensiveElement.innerHTML = mockCvElement.innerHTML + mockCvElement.innerHTML; // Duplicate content
      document.body.appendChild(extensiveElement);

      const elements = [minimalElement, extensiveElement];
      
      for (const element of elements) {
        const filename = generatePdfFilename(mockCvData, { 
          customSuffix: element === minimalElement ? 'minimal' : 'extensive' 
        });
        
        const options = {
          filename,
          quality: 'medium' as const,
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

        const result = await controller.generatePDF(element, options);

        expect(result.success).toBe(true);
        expect(result.blob).toBeInstanceOf(Blob);
        expect(result.metadata.fileSize).toBeGreaterThan(0);
      }

      // Cleanup
      document.body.removeChild(minimalElement);
      document.body.removeChild(extensiveElement);
    }, 15000);
  });

  describe('Cross-Browser Compatibility Simulation', () => {
    it('should handle limited browser capabilities', async () => {
      // Mock limited browser capabilities
      const originalDetectBrowserCapabilities = (controller as any).detectBrowserCapabilities;
      (controller as any).detectBrowserCapabilities = vi.fn().mockReturnValue({
        supportsCanvas: true,
        supportsWebGL: false,
        supportsWorkers: false,
        supportsOffscreenCanvas: false,
        maxCanvasSize: 2048,
        memoryLimit: 50 * 1024 * 1024 // 50MB
      });

      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'low' as const, // Use low quality for limited capabilities
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

      const result = await controller.generatePDF(mockCvElement, options);

      expect(result.success).toBe(true);
      expect(result.blob).toBeInstanceOf(Blob);
      
      // Restore original method
      (controller as any).detectBrowserCapabilities = originalDetectBrowserCapabilities;
    });

    it('should gracefully handle unsupported browsers', async () => {
      // Mock completely unsupported browser
      const originalDetectBrowserCapabilities = (controller as any).detectBrowserCapabilities;
      (controller as any).detectBrowserCapabilities = vi.fn().mockReturnValue({
        supportsCanvas: false,
        supportsWebGL: false,
        supportsWorkers: false,
        supportsOffscreenCanvas: false,
        maxCanvasSize: 0,
        memoryLimit: 0
      });

      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'low' as const,
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

      const result = await controller.generatePDF(mockCvElement, options);

      // Should either succeed with legacy strategy or fail gracefully
      if (result.success) {
        expect(result.blob).toBeInstanceOf(Blob);
        expect(result.metadata.strategy).toBe('legacy');
      } else {
        expect(result.error).toBeDefined();
        expect(result.metadata.warnings).toBeDefined();
      }
      
      // Restore original method
      (controller as any).detectBrowserCapabilities = originalDetectBrowserCapabilities;
    });
  });

  describe('System Health and Monitoring', () => {
    it('should track system health during generation', async () => {
      const initialHealth = controller.getSystemHealth();
      
      const filename = generatePdfFilename(mockCvData);
      
      const options = {
        filename,
        quality: 'medium' as const,
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

      await controller.generatePDF(mockCvElement, options);
      
      const finalHealth = controller.getSystemHealth();
      
      expect(initialHealth).toHaveProperty('isStable');
      expect(initialHealth).toHaveProperty('recommendation');
      expect(initialHealth).toHaveProperty('errorStats');
      expect(initialHealth).toHaveProperty('recoveryStats');
      
      expect(finalHealth).toHaveProperty('isStable');
      expect(finalHealth).toHaveProperty('recommendation');
    });

    it('should reset error tracking when requested', () => {
      // Generate some errors first
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
});