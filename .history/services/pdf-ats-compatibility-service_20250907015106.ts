// ATS Compatibility Testing Service

import { ValidationResult, DocumentMetadata } from '../types/pdf';

export interface ATSCompatibilityOptions {
  testTextExtraction: boolean;
  validateSearchability: boolean;
  checkMetadata: boolean;
  testCommonParsers: boolean;
  requiredFields: string[];
}

export interface TextExtractionTest {
  success: boolean;
  extractedText: string;
  wordCount: number;
  characterCount: number;
  preservedFormatting: boolean;
  extractionScore: number; // 0-1
  issues: string[];
}

export interface SearchabilityTest {
  isSearchable: boolean;
  indexableContent: string[];
  searchScore: number; // 0-1
  keywordDetection: boolean;
  issues: string[];
}

export interface MetadataValidation {
  isValid: boolean;
  hasTitle: boolean;
  hasAuthor: boolean;
  hasKeywords: boolean;
  hasCreationDate: boolean;
  metadata: Partial<DocumentMetadata>;
  issues: string[];
}

export interface ParserCompatibilityTest {
  parserName: string;
  compatible: boolean;
  extractionQuality: number; // 0-1
  issues: string[];
  extractedFields: Record<string, string>;
}

export interface ATSCompatibilityResult {
  overallCompatible: boolean;
  compatibilityScore: number; // 0-1
  textExtraction: TextExtractionTest;
  searchability: SearchabilityTest;
  metadata: MetadataValidation;
  parserTests: ParserCompatibilityTest[];
  recommendations: string[];
}

export class PDFATSCompatibilityService {
  private readonly defaultOptions: ATSCompatibilityOptions = {
    testTextExtraction: true,
    validateSearchability: true,
    checkMetadata: true,
    testCommonParsers: true,
    requiredFields: ['name', 'email', 'phone', 'experience', 'skills']
  };

  /**
   * Performs comprehensive ATS compatibility testing on a PDF
   */
  async testATSCompatibility(
    pdfBlob: Blob,
    expectedContent?: Record<string, string>,
    options: Partial<ATSCompatibilityOptions> = {}
  ): Promise<ATSCompatibilityResult> {
    const testOptions = { ...this.defaultOptions, ...options };
    const recommendations: string[] = [];

    try {
      // Test text extraction
      const textExtraction = await this.testTextExtraction(pdfBlob, expectedContent);
      
      // Test searchability and indexing
      const searchability = await this.testSearchability(pdfBlob, testOptions.requiredFields);
      
      // Validate metadata
      const metadata = await this.validateMetadata(pdfBlob);
      
      // Test with common ATS parsers
      const parserTests = testOptions.testCommonParsers 
        ? await this.testCommonParsers(pdfBlob, expectedContent)
        : [];

      // Calculate overall compatibility score
      const scores = [
        textExtraction.success ? 1 : 0,
        searchability.searchScore,
        metadata.isValid ? 1 : 0,
        parserTests.length > 0 ? parserTests.reduce((sum, test) => sum + test.extractionQuality, 0) / parserTests.length : 1
      ];
      
      const compatibilityScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const overallCompatible = compatibilityScore >= 0.8;

      // Generate recommendations
      if (!textExtraction.success) {
        recommendations.push('Improve text extraction by ensuring proper font embedding');
      }
      
      if (searchability.searchScore < 0.8) {
        recommendations.push('Enhance searchability by improving text structure and keywords');
      }
      
      if (!metadata.isValid) {
        recommendations.push('Add proper document metadata for better ATS recognition');
      }

      if (parserTests.some(test => !test.compatible)) {
        recommendations.push('Address parser-specific compatibility issues');
      }

      return {
        overallCompatible,
        compatibilityScore,
        textExtraction,
        searchability,
        metadata,
        parserTests,
        recommendations
      };

    } catch (error) {
      return {
        overallCompatible: false,
        compatibilityScore: 0,
        textExtraction: {
          success: false,
          extractedText: '',
          wordCount: 0,
          characterCount: 0,
          preservedFormatting: false,
          extractionScore: 0,
          issues: [`Text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        },
        searchability: {
          isSearchable: false,
          indexableContent: [],
          searchScore: 0,
          keywordDetection: false,
          issues: [`Searchability test failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        },
        metadata: {
          isValid: false,
          hasTitle: false,
          hasAuthor: false,
          hasKeywords: false,
          hasCreationDate: false,
          metadata: {},
          issues: [`Metadata validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
        },
        parserTests: [],
        recommendations: ['Regenerate PDF with proper ATS-compatible settings']
      };
    }
  }

  /**
   * Tests text extraction capabilities for ATS systems
   */
  private async testTextExtraction(
    pdfBlob: Blob,
    expectedContent?: Record<string, string>
  ): Promise<TextExtractionTest> {
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdfString = new TextDecoder('latin1').decode(pdfData);

      const issues: string[] = [];
      let extractedText = '';

      // Extract text using multiple methods to simulate ATS behavior
      
      // Method 1: Extract from text objects (TJ/Tj operators)
      const textFromObjects = this.extractTextFromObjects(pdfString);
      
      // Method 2: Extract from content streams
      const textFromStreams = this.extractTextFromStreams(pdfString);
      
      // Method 3: Extract from form fields (if any)
      const textFromFields = this.extractTextFromFields(pdfString);

      // Combine extracted text
      extractedText = [textFromObjects, textFromStreams, textFromFields]
        .filter(text => text.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      const wordCount = extractedText.split(/\s+/).filter(word => word.length > 0).length;
      const characterCount = extractedText.length;

      // Check for text extraction issues
      if (extractedText.length === 0) {
        issues.push('No text could be extracted from PDF');
      }

      if (wordCount < 10) {
        issues.push('Very little text content extracted');
      }

      // Check formatting preservation
      const preservedFormatting = this.checkFormattingPreservation(pdfString, extractedText);
      if (!preservedFormatting) {
        issues.push('Text formatting may not be preserved');
      }

      // Validate against expected content if provided
      if (expectedContent) {
        for (const [field, expectedValue] of Object.entries(expectedContent)) {
          if (!extractedText.toLowerCase().includes(expectedValue.toLowerCase())) {
            issues.push(`Expected content '${field}' not found in extracted text`);
          }
        }
      }

      // Calculate extraction score
      let extractionScore = 1.0;
      if (extractedText.length === 0) extractionScore = 0;
      else if (wordCount < 10) extractionScore *= 0.5;
      if (!preservedFormatting) extractionScore *= 0.8;
      if (issues.length > 0) extractionScore *= Math.max(0.3, 1 - (issues.length * 0.2));

      return {
        success: issues.length === 0 && extractedText.length > 0,
        extractedText,
        wordCount,
        characterCount,
        preservedFormatting,
        extractionScore,
        issues
      };

    } catch (error) {
      return {
        success: false,
        extractedText: '',
        wordCount: 0,
        characterCount: 0,
        preservedFormatting: false,
        extractionScore: 0,
        issues: [`Text extraction test failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Tests searchability and indexing capabilities
   */
  private async testSearchability(
    pdfBlob: Blob,
    requiredFields: string[]
  ): Promise<SearchabilityTest> {
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdfString = new TextDecoder('latin1').decode(pdfData);

      const issues: string[] = [];
      const indexableContent: string[] = [];

      // Extract all searchable text content
      const extractedText = this.extractAllText(pdfString);
      
      // Test keyword detection for common CV fields
      const commonKeywords = [
        'experience', 'education', 'skills', 'work', 'employment',
        'university', 'degree', 'certification', 'project', 'achievement'
      ];

      let keywordMatches = 0;
      for (const keyword of commonKeywords) {
        if (extractedText.toLowerCase().includes(keyword)) {
          keywordMatches++;
          indexableContent.push(keyword);
        }
      }

      const keywordDetection = keywordMatches >= 3;

      // Check for proper text structure
      const hasStructure = this.checkTextStructure(pdfString);
      if (!hasStructure) {
        issues.push('Text lacks proper structure for indexing');
      }

      // Check for Unicode support
      const hasUnicodeSupport = pdfString.includes('/ToUnicode');
      if (!hasUnicodeSupport) {
        issues.push('Limited Unicode support may affect searchability');
      }

      // Test field extraction
      const extractedFields = this.extractCommonFields(extractedText);
      for (const requiredField of requiredFields) {
        if (!extractedFields[requiredField]) {
          issues.push(`Required field '${requiredField}' not detectable`);
        }
      }

      // Calculate search score
      let searchScore = 1.0;
      if (!keywordDetection) searchScore *= 0.7;
      if (!hasStructure) searchScore *= 0.8;
      if (!hasUnicodeSupport) searchScore *= 0.9;
      if (issues.length > 0) searchScore *= Math.max(0.5, 1 - (issues.length * 0.1));

      return {
        isSearchable: searchScore >= 0.7,
        indexableContent,
        searchScore,
        keywordDetection,
        issues
      };

    } catch (error) {
      return {
        isSearchable: false,
        indexableContent: [],
        searchScore: 0,
        keywordDetection: false,
        issues: [`Searchability test failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validates document metadata for ATS compatibility
   */
  private async validateMetadata(pdfBlob: Blob): Promise<MetadataValidation> {
    try {
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfData = new Uint8Array(arrayBuffer);
      const pdfString = new TextDecoder('latin1').decode(pdfData);

      const issues: string[] = [];
      const metadata: Partial<DocumentMetadata> = {};

      // Extract document info dictionary
      const infoMatch = pdfString.match(/\/Info\s+(\d+)\s+\d+\s+R/);
      let hasTitle = false;
      let hasAuthor = false;
      let hasKeywords = false;
      let hasCreationDate = false;

      if (infoMatch) {
        // Look for metadata fields
        const titleMatch = pdfString.match(/\/Title\s*\((.*?)\)/);
        if (titleMatch) {
          hasTitle = true;
          metadata.title = titleMatch[1];
        }

        const authorMatch = pdfString.match(/\/Author\s*\((.*?)\)/);
        if (authorMatch) {
          hasAuthor = true;
          metadata.author = authorMatch[1];
        }

        const keywordsMatch = pdfString.match(/\/Keywords\s*\((.*?)\)/);
        if (keywordsMatch) {
          hasKeywords = true;
          metadata.keywords = keywordsMatch[1].split(',').map(k => k.trim());
        }

        const creationDateMatch = pdfString.match(/\/CreationDate\s*\((.*?)\)/);
        if (creationDateMatch) {
          hasCreationDate = true;
        }
      }

      // Check for XMP metadata (more modern approach)
      const xmpMatch = pdfString.match(/<x:xmpmeta.*?<\/x:xmpmeta>/s);
      if (xmpMatch) {
        // XMP metadata found - this is good for ATS compatibility
        const xmpContent = xmpMatch[0];
        
        if (xmpContent.includes('dc:title')) hasTitle = true;
        if (xmpContent.includes('dc:creator')) hasAuthor = true;
        if (xmpContent.includes('dc:subject')) hasKeywords = true;
      }

      // Generate issues for missing metadata
      if (!hasTitle) {
        issues.push('Document title not found');
      }
      
      if (!hasAuthor) {
        issues.push('Document author not specified');
      }
      
      if (!hasKeywords) {
        issues.push('No keywords specified for better searchability');
      }
      
      if (!hasCreationDate) {
        issues.push('Creation date not specified');
      }

      const isValid = hasTitle && hasAuthor;

      return {
        isValid,
        hasTitle,
        hasAuthor,
        hasKeywords,
        hasCreationDate,
        metadata,
        issues
      };

    } catch (error) {
      return {
        isValid: false,
        hasTitle: false,
        hasAuthor: false,
        hasKeywords: false,
        hasCreationDate: false,
        metadata: {},
        issues: [`Metadata validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Tests compatibility with common ATS parsers
   */
  private async testCommonParsers(
    pdfBlob: Blob,
    expectedContent?: Record<string, string>
  ): Promise<ParserCompatibilityTest[]> {
    const parsers = [
      { name: 'Generic Text Extractor', method: 'basic' },
      { name: 'Advanced Structure Parser', method: 'structured' },
      { name: 'OCR Fallback Parser', method: 'ocr-simulation' }
    ];

    const results: ParserCompatibilityTest[] = [];

    for (const parser of parsers) {
      try {
        const test = await this.simulateParserTest(pdfBlob, parser.method, expectedContent);
        results.push({
          parserName: parser.name,
          ...test
        });
      } catch (error) {
        results.push({
          parserName: parser.name,
          compatible: false,
          extractionQuality: 0,
          issues: [`Parser test failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
          extractedFields: {}
        });
      }
    }

    return results;
  }

  /**
   * Simulates different ATS parser behaviors
   */
  private async simulateParserTest(
    pdfBlob: Blob,
    method: string,
    expectedContent?: Record<string, string>
  ): Promise<Omit<ParserCompatibilityTest, 'parserName'>> {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    const pdfString = new TextDecoder('latin1').decode(pdfData);

    const issues: string[] = [];
    let extractionQuality = 1.0;

    // Extract text based on parser method
    let extractedText = '';
    switch (method) {
      case 'basic':
        extractedText = this.extractTextFromObjects(pdfString);
        break;
      case 'structured':
        extractedText = this.extractStructuredText(pdfString);
        break;
      case 'ocr-simulation':
        extractedText = this.simulateOCRExtraction(pdfString);
        break;
    }

    // Extract common CV fields
    const extractedFields = this.extractCommonFields(extractedText);

    // Validate extraction quality
    if (extractedText.length === 0) {
      issues.push('No text extracted by parser');
      extractionQuality = 0;
    }

    if (expectedContent) {
      let matchedFields = 0;
      for (const [field, expectedValue] of Object.entries(expectedContent)) {
        if (extractedFields[field] && 
            extractedFields[field].toLowerCase().includes(expectedValue.toLowerCase())) {
          matchedFields++;
        } else {
          issues.push(`Field '${field}' not properly extracted`);
        }
      }
      
      if (Object.keys(expectedContent).length > 0) {
        extractionQuality *= matchedFields / Object.keys(expectedContent).length;
      }
    }

    return {
      compatible: extractionQuality >= 0.7,
      extractionQuality,
      issues,
      extractedFields
    };
  }

  // Helper methods for text extraction

  private extractTextFromObjects(pdfString: string): string {
    const textObjects = pdfString.match(/BT\s+.*?ET/gs) || [];
    let text = '';
    
    for (const obj of textObjects) {
      const tjMatches = obj.match(/\[(.*?)\]\s*TJ/g) || [];
      const tjSingleMatches = obj.match(/\((.*?)\)\s*Tj/g) || [];
      
      for (const match of [...tjMatches, ...tjSingleMatches]) {
        const content = match.match(/[\[\(](.*?)[\]\)]/)?.[1] || '';
        text += content + ' ';
      }
    }
    
    return text.trim();
  }

  private extractTextFromStreams(pdfString: string): string {
    // Extract text from content streams
    const streamPattern = /stream\s*(.*?)\s*endstream/gs;
    const streams = pdfString.match(streamPattern) || [];
    let text = '';
    
    for (const stream of streams) {
      // Look for text operators in streams
      const textMatches = stream.match(/\((.*?)\)\s*Tj/g) || [];
      for (const match of textMatches) {
        const content = match.match(/\((.*?)\)/)?.[1] || '';
        text += content + ' ';
      }
    }
    
    return text.trim();
  }

  private extractTextFromFields(pdfString: string): string {
    // Extract text from form fields if present
    const fieldPattern = /\/T\s*\((.*?)\).*?\/V\s*\((.*?)\)/gs;
    const fields = pdfString.matchAll(fieldPattern);
    let text = '';
    
    for (const field of fields) {
      text += `${field[1]}: ${field[2]} `;
    }
    
    return text.trim();
  }

  private extractAllText(pdfString: string): string {
    return [
      this.extractTextFromObjects(pdfString),
      this.extractTextFromStreams(pdfString),
      this.extractTextFromFields(pdfString)
    ].join(' ').replace(/\s+/g, ' ').trim();
  }

  private extractStructuredText(pdfString: string): string {
    // Simulate structured text extraction with better formatting
    const text = this.extractAllText(pdfString);
    
    // Add structure markers for better parsing
    return text
      .replace(/([A-Z][a-z]+\s+[A-Z][a-z]+)/g, '\n$1\n') // Names
      .replace(/(\b\d{3}[-.]?\d{3}[-.]?\d{4}\b)/g, '\nPhone: $1\n') // Phone numbers
      .replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g, '\nEmail: $1\n') // Emails
      .replace(/\s+/g, ' ')
      .trim();
  }

  private simulateOCRExtraction(pdfString: string): string {
    // Simulate OCR extraction (less accurate)
    const text = this.extractAllText(pdfString);
    
    // Introduce some OCR-like errors
    return text
      .replace(/rn/g, 'm') // Common OCR error
      .replace(/cl/g, 'd') // Common OCR error
      .replace(/\s+/g, ' ')
      .trim();
  }

  private checkFormattingPreservation(pdfString: string, extractedText: string): boolean {
    // Check if basic formatting is preserved
    const hasLineBreaks = pdfString.includes('\\n') || pdfString.includes('\n');
    const hasSpacing = extractedText.includes('  ') || !!extractedText.match(/\w\s+\w/);
    
    return hasLineBreaks || hasSpacing;
  }

  private checkTextStructure(pdfString: string): boolean {
    // Check for proper text structure indicators
    const hasTextObjects = pdfString.includes('BT') && pdfString.includes('ET');
    const hasTextPositioning = pdfString.includes('Td') || pdfString.includes('TD');
    const hasTextMatrix = pdfString.includes('Tm');
    
    return hasTextObjects && (hasTextPositioning || hasTextMatrix);
  }

  private extractCommonFields(text: string): Record<string, string> {
    const fields: Record<string, string> = {};
    
    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) fields.email = emailMatch[0];
    
    // Extract phone
    const phoneMatch = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    if (phoneMatch) fields.phone = phoneMatch[0];
    
    // Extract name (first capitalized words)
    const nameMatch = text.match(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/);
    if (nameMatch) fields.name = nameMatch[0];
    
    // Extract experience keywords
    const experienceKeywords = ['experience', 'work', 'employment', 'position', 'role'];
    for (const keyword of experienceKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        fields.experience = keyword;
        break;
      }
    }
    
    // Extract skills keywords
    const skillsKeywords = ['skills', 'technologies', 'programming', 'software'];
    for (const keyword of skillsKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        fields.skills = keyword;
        break;
      }
    }
    
    return fields;
  }
}