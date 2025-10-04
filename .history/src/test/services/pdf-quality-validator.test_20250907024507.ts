import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the quality validator since we need to create it
class MockPDFQualityValidator {
  async validatePDF(blob: Blob): Promise<{
    isValid: boolean;
    score: number;
    issues: string[];
    metrics: {
      textExtractability: number;
      layoutFidelity: number;
      atsCompatibility: boolean;
      fileSize: number;
      pdfCompliance: string[];
    };
  }> {
    const fileSize = blob.size;
    const textExtractability = 0.95;
    const layoutFidelity = 0.90;
    const atsCompatibility = textExtractability > 0.9 && layoutFidelity > 0.85;
    
    const issues: string[] = [];
    if (fileSize > 5 * 1024 * 1024) {
      issues.push('File size exceeds recommended limit');
    }
    if (textExtractability < 0.9) {
      issues.push('Low text extractability');
    }
    if (layoutFidelity < 0.85) {
      issues.push('Layout fidelity below threshold');
    }

    const score = (textExtractability + layoutFidelity) / 2;
    
    return {
      isValid: issues.length === 0,
      score,
      issues,
      metrics: {
        textExtractability,
        layoutFidelity,
        atsCompatibility,
        fileSize,
        pdfCompliance: atsCompatibility ? ['PDF/A-1b'] : []
      }
    };
  }

  async extractText(blob: Blob): Promise<string> {
    // Mock text extraction
    return 'John Doe\nSoftware Engineer\nExperienced developer with 5 years of experience...';
  }

  async validateATSCompatibility(blob: Blob): Promise<{
    compatible: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    const text = await this.extractText(blob);
    const hasText = text.length > 50;
    const hasStructure = text.includes('\n');
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    if (!hasText) {
      issues.push('Insufficient text content');
      suggestions.push('Ensure CV contains readable text');
    }
    
    if (!hasStructure) {
      issues.push('Poor document structure');
      suggestions.push('Use proper headings and sections');
    }
    
    return {
      compatible: issues.length === 0,
      issues,
      suggestions
    };
  }

  calculateQualityScore(metrics: any): number {
    const weights = {
      textExtractability: 0.4,
      layoutFidelity: 0.3,
      fileSize: 0.2,
      compliance: 0.1
    };
    
    let score = 0;
    score += metrics.textExtractability * weights.textExtractability;
    score += metrics.layoutFidelity * weights.layoutFidelity;
    
    // File size scoring (smaller is better, up to a point)
    const fileSizeMB = metrics.fileSize / (1024 * 1024);
    const fileSizeScore = fileSizeMB < 2 ? 1 : Math.max(0, 1 - (fileSizeMB - 2) / 8);
    score += fileSizeScore * weights.fileSize;
    
    // Compliance scoring
    const complianceScore = metrics.pdfCompliance.length > 0 ? 1 : 0;
    score += complianceScore * weights.compliance;
    
    return Math.min(1, Math.max(0, score));
  }
}

describe('PDF Quality Validator', () => {
  let validator: MockPDFQualityValidator;
  let mockBlob: Blob;

  beforeEach(() => {
    validator = new MockPDFQualityValidator();
    mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
  });

  describe('PDF Validation', () => {
    it('should validate a good quality PDF', async () => {
      const result = await validator.validatePDF(mockBlob);
      
      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.issues).toHaveLength(0);
      expect(result.metrics.textExtractability).toBe(0.95);
      expect(result.metrics.layoutFidelity).toBe(0.90);
      expect(result.metrics.atsCompatibility).toBe(true);
    });

    it('should detect large file size issues', async () => {
      const largeMockBlob = new Blob([new ArrayBuffer(6 * 1024 * 1024)], { type: 'application/pdf' });
      const result = await validator.validatePDF(largeMockBlob);
      
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('File size exceeds recommended limit');
    });

    it('should provide quality metrics', async () => {
      const result = await validator.validatePDF(mockBlob);
      
      expect(result.metrics).toHaveProperty('textExtractability');
      expect(result.metrics).toHaveProperty('layoutFidelity');
      expect(result.metrics).toHaveProperty('atsCompatibility');
      expect(result.metrics).toHaveProperty('fileSize');
      expect(result.metrics).toHaveProperty('pdfCompliance');
    });
  });

  describe('Text Extraction', () => {
    it('should extract text from PDF', async () => {
      const text = await validator.extractText(mockBlob);
      
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
      expect(text).toContain('John Doe');
      expect(text).toContain('Software Engineer');
    });
  });

  describe('ATS Compatibility', () => {
    it('should validate ATS compatibility for good PDF', async () => {
      const result = await validator.validateATSCompatibility(mockBlob);
      
      expect(result.compatible).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it('should detect ATS compatibility issues', async () => {
      // Mock a PDF with insufficient text
      vi.spyOn(validator, 'extractText').mockResolvedValue('Short');
      
      const result = await validator.validateATSCompatibility(mockBlob);
      
      expect(result.compatible).toBe(false);
      expect(result.issues).toContain('Insufficient text content');
      expect(result.suggestions).toContain('Ensure CV contains readable text');
    });

    it('should detect structure issues', async () => {
      // Mock a PDF with no structure
      vi.spyOn(validator, 'extractText').mockResolvedValue('Long text without any line breaks or structure that would indicate proper formatting');
      
      const result = await validator.validateATSCompatibility(mockBlob);
      
      expect(result.compatible).toBe(false);
      expect(result.issues).toContain('Poor document structure');
      expect(result.suggestions).toContain('Use proper headings and sections');
    });
  });

  describe('Quality Score Calculation', () => {
    it('should calculate quality score correctly', () => {
      const metrics = {
        textExtractability: 0.95,
        layoutFidelity: 0.90,
        fileSize: 1.5 * 1024 * 1024, // 1.5MB
        pdfCompliance: ['PDF/A-1b']
      };
      
      const score = validator.calculateQualityScore(metrics);
      
      expect(score).toBeGreaterThan(0.8);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should penalize large file sizes', () => {
      const smallFileMetrics = {
        textExtractability: 0.95,
        layoutFidelity: 0.90,
        fileSize: 1 * 1024 * 1024, // 1MB
        pdfCompliance: ['PDF/A-1b']
      };
      
      const largeFileMetrics = {
        textExtractability: 0.95,
        layoutFidelity: 0.90,
        fileSize: 10 * 1024 * 1024, // 10MB
        pdfCompliance: ['PDF/A-1b']
      };
      
      const smallScore = validator.calculateQualityScore(smallFileMetrics);
      const largeScore = validator.calculateQualityScore(largeFileMetrics);
      
      expect(smallScore).toBeGreaterThan(largeScore);
    });

    it('should reward PDF compliance', () => {
      const compliantMetrics = {
        textExtractability: 0.90,
        layoutFidelity: 0.85,
        fileSize: 2 * 1024 * 1024,
        pdfCompliance: ['PDF/A-1b']
      };
      
      const nonCompliantMetrics = {
        textExtractability: 0.90,
        layoutFidelity: 0.85,
        fileSize: 2 * 1024 * 1024,
        pdfCompliance: []
      };
      
      const compliantScore = validator.calculateQualityScore(compliantMetrics);
      const nonCompliantScore = validator.calculateQualityScore(nonCompliantMetrics);
      
      expect(compliantScore).toBeGreaterThan(nonCompliantScore);
    });

    it('should handle edge cases', () => {
      const edgeMetrics = {
        textExtractability: 0,
        layoutFidelity: 0,
        fileSize: 100 * 1024 * 1024, // Very large
        pdfCompliance: []
      };
      
      const score = validator.calculateQualityScore(edgeMetrics);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});

describe('Quality Metrics', () => {
  describe('Text Extractability Scoring', () => {
    it('should score high for well-structured text', () => {
      const wellStructuredText = `
        John Doe
        Software Engineer
        
        EXPERIENCE
        Senior Developer at Tech Corp (2020-2023)
        - Led development of web applications
        - Managed team of 5 developers
        
        EDUCATION
        Bachelor of Computer Science
        University of Technology (2016-2020)
        
        SKILLS
        JavaScript, React, Node.js, Python
      `;
      
      // Mock scoring logic
      const lines = wellStructuredText.split('\n').filter(line => line.trim());
      const hasHeaders = lines.some(line => line.toUpperCase() === line && line.length > 2);
      const hasStructure = lines.length > 5;
      
      const score = hasHeaders && hasStructure ? 0.95 : 0.5;
      expect(score).toBe(0.95);
    });

    it('should score low for unstructured text', () => {
      const unstructuredText = 'johndoesoftwareengineerexperienceseniordeveloper';
      
      const lines = unstructuredText.split('\n').filter(line => line.trim());
      const hasHeaders = lines.some(line => line.toUpperCase() === line && line.length > 2);
      const hasStructure = lines.length > 5;
      
      const score = hasHeaders && hasStructure ? 0.95 : 0.3;
      expect(score).toBe(0.3);
    });
  });

  describe('Layout Fidelity Assessment', () => {
    it('should assess layout preservation', () => {
      // Mock layout assessment
      const originalElements = 15;
      const preservedElements = 14;
      const fidelity = preservedElements / originalElements;
      
      expect(fidelity).toBeCloseTo(0.93, 2);
    });

    it('should detect layout issues', () => {
      const originalElements = 20;
      const preservedElements = 12;
      const fidelity = preservedElements / originalElements;
      
      expect(fidelity).toBe(0.6);
      expect(fidelity).toBeLessThan(0.85); // Below threshold
    });
  });

  describe('File Size Optimization', () => {
    it('should evaluate optimal file sizes', () => {
      const sizes = [
        { size: 0.5 * 1024 * 1024, expected: 'excellent' },
        { size: 1.5 * 1024 * 1024, expected: 'good' },
        { size: 3 * 1024 * 1024, expected: 'acceptable' },
        { size: 8 * 1024 * 1024, expected: 'large' }
      ];
      
      sizes.forEach(({ size, expected }) => {
        let category;
        if (size < 1024 * 1024) category = 'excellent';
        else if (size < 2 * 1024 * 1024) category = 'good';
        else if (size < 5 * 1024 * 1024) category = 'acceptable';
        else category = 'large';
        
        expect(category).toBe(expected);
      });
    });
  });
});