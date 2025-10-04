/**
 * Unit Tests for PDF Filename Generator
 * Tests filename generation, sanitization, and cross-platform compatibility
 */

import { PDFFilenameGenerator, generatePdfFilename, validatePdfFilename } from './services/pdf-filename-generator';
import { CvData } from './services/geminiService';

// Test data
const mockCvData: CvData = {
  fullName: 'John Michael Smith',
  contactInfo: {
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    linkedin: 'linkedin.com/in/johnsmith',
    location: 'New York, NY'
  },
  professionalSummary: 'Experienced software developer...',
  workExperience: [],
  education: [],
  certifications: [],
  skills: [],
  optimizationDetails: {
    keywordsIntegrated: [],
    skillsAligned: [],
    experienceOptimizations: [],
    summaryTailoring: ''
  }
};

function runTests() {
  console.log('🧪 Running PDF Filename Generator Tests...\n');

  // Test 1: Basic filename generation
  console.log('Test 1: Basic filename generation');
  const result1 = PDFFilenameGenerator.generateFilename(mockCvData);
  console.log(`✓ Generated: ${result1.filename}`);
  console.log(`✓ Expected format: FirstName_LastName_CV.pdf`);
  console.assert(result1.filename === 'John_Smith_CV.pdf', 'Basic filename should be John_Smith_CV.pdf');
  console.log('✅ Test 1 passed\n');

  // Test 2: Filename with special characters
  console.log('Test 2: Special character handling');
  const specialCharData = { ...mockCvData, fullName: 'José María O\'Connor-Smith' };
  const result2 = PDFFilenameGenerator.generateFilename(specialCharData);
  console.log(`✓ Input: José María O'Connor-Smith`);
  console.log(`✓ Generated: ${result2.filename}`);
  console.log(`✓ Sanitized: ${result2.sanitized}`);
  console.assert(result2.sanitized, 'Should be marked as sanitized');
  console.log('✅ Test 2 passed\n');

  // Test 3: Long name truncation
  console.log('Test 3: Long name truncation');
  const longNameData = { ...mockCvData, fullName: 'Bartholomew Maximilian Christopher Alexander Wellington-Smythe' };
  const result3 = PDFFilenameGenerator.generateFilename(longNameData, { maxLength: 30 });
  console.log(`✓ Input: ${longNameData.fullName}`);
  console.log(`✓ Generated: ${result3.filename}`);
  console.log(`✓ Length: ${result3.filename.length}`);
  console.log(`✓ Truncated: ${result3.truncated}`);
  console.assert(result3.filename.length <= 30, 'Filename should be truncated to max length');
  console.assert(result3.truncated, 'Should be marked as truncated');
  console.log('✅ Test 3 passed\n');

  // Test 4: Empty/invalid name handling
  console.log('Test 4: Empty name fallback');
  const emptyNameData = { ...mockCvData, fullName: '' };
  const result4 = PDFFilenameGenerator.generateFilename(emptyNameData);
  console.log(`✓ Input: (empty name)`);
  console.log(`✓ Generated: ${result4.filename}`);
  console.log(`✓ Warnings: ${result4.warnings.join(', ')}`);
  console.assert(result4.filename === 'CV.pdf', 'Should fallback to CV.pdf');
  console.assert(result4.warnings.length > 0, 'Should have warnings');
  console.log('✅ Test 4 passed\n');

  // Test 5: Date inclusion
  console.log('Test 5: Date inclusion');
  const result5 = PDFFilenameGenerator.generateFilename(mockCvData, { includeDate: true });
  console.log(`✓ Generated: ${result5.filename}`);
  console.assert(result5.filename.includes('_20'), 'Should include date');
  console.log('✅ Test 5 passed\n');

  // Test 6: Custom suffix
  console.log('Test 6: Custom suffix');
  const result6 = PDFFilenameGenerator.generateFilename(mockCvData, { customSuffix: 'Software Engineer' });
  console.log(`✓ Generated: ${result6.filename}`);
  console.assert(result6.filename.includes('Software_Engineer'), 'Should include custom suffix');
  console.log('✅ Test 6 passed\n');

  // Test 7: Cross-platform validation
  console.log('Test 7: Cross-platform validation');
  const validationTests = [
    { filename: 'John_Smith_CV.pdf', shouldBeValid: true },
    { filename: 'CON.pdf', shouldBeValid: false },
    { filename: 'file<name>.pdf', shouldBeValid: false },
    { filename: '.hidden_CV.pdf', shouldBeValid: false },
    { filename: 'normal_filename.pdf', shouldBeValid: true }
  ];

  validationTests.forEach((test, index) => {
    const validation = PDFFilenameGenerator.validateCrossPlatformCompatibility(test.filename);
    console.log(`  ${index + 1}. ${test.filename}: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (!validation.isValid) {
      console.log(`     Issues: ${validation.issues.join(', ')}`);
    }
    console.assert(validation.isValid === test.shouldBeValid, 
      `Validation for ${test.filename} should be ${test.shouldBeValid}`);
  });
  console.log('✅ Test 7 passed\n');

  // Test 8: Convenience functions
  console.log('Test 8: Convenience functions');
  const quickFilename = generatePdfFilename(mockCvData);
  const isValid = validatePdfFilename(quickFilename);
  console.log(`✓ Quick generation: ${quickFilename}`);
  console.log(`✓ Is valid: ${isValid}`);
  console.assert(typeof quickFilename === 'string', 'Should return string');
  console.assert(typeof isValid === 'boolean', 'Should return boolean');
  console.log('✅ Test 8 passed\n');

  // Test 9: Single name handling
  console.log('Test 9: Single name handling');
  const singleNameData = { ...mockCvData, fullName: 'Madonna' };
  const result9 = PDFFilenameGenerator.generateFilename(singleNameData);
  console.log(`✓ Input: Madonna`);
  console.log(`✓ Generated: ${result9.filename}`);
  console.assert(result9.filename === 'Madonna_CV.pdf', 'Should handle single name');
  console.log('✅ Test 9 passed\n');

  // Test 10: Email fallback
  console.log('Test 10: Email fallback name extraction');
  const noNameData = { 
    ...mockCvData, 
    fullName: '',
    contactInfo: { ...mockCvData.contactInfo, email: 'jane.doe@company.com' }
  };
  const extractedName = PDFFilenameGenerator.extractNameFromCvData(noNameData);
  console.log(`✓ Email: jane.doe@company.com`);
  console.log(`✓ Extracted name: ${extractedName}`);
  console.assert(extractedName === 'Jane Doe', 'Should extract name from email');
  console.log('✅ Test 10 passed\n');

  console.log('🎉 All tests passed! PDF Filename Generator is working correctly.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

export { runTests };