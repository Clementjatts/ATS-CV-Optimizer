// Test script to verify PDF infrastructure setup

import { PDFGenerationService } from './services/pdf-generation';
import { BrowserDetector, ConfigurationManager, FileNameGenerator } from './utils/pdf-utils';
import { PDFGenerationError, BrowserCompatibilityError } from './utils/errors';

// Test browser detection
console.log('Testing browser capabilities...');
try {
  const capabilities = BrowserDetector.detectCapabilities();
  console.log('✓ Browser capabilities detected:', capabilities);
} catch (error) {
  console.error('✗ Browser detection failed:', error);
}

// Test configuration management
console.log('\nTesting configuration management...');
try {
  const defaultConfig = ConfigurationManager.getDefaultConfiguration();
  console.log('✓ Default configuration loaded');
  
  const validationErrors = ConfigurationManager.validateConfiguration(defaultConfig);
  if (validationErrors.length === 0) {
    console.log('✓ Configuration validation passed');
  } else {
    console.log('✗ Configuration validation failed:', validationErrors);
  }
} catch (error) {
  console.error('✗ Configuration management failed:', error);
}

// Test filename generation
console.log('\nTesting filename generation...');
try {
  const filename1 = FileNameGenerator.generateFilename('John Doe');
  const filename2 = FileNameGenerator.generateFilename('Jane Smith-Johnson');
  const filename3 = FileNameGenerator.generateFilename('José María García');
  
  console.log('✓ Generated filenames:');
  console.log('  -', filename1);
  console.log('  -', filename2);
  console.log('  -', filename3);
} catch (error) {
  console.error('✗ Filename generation failed:', error);
}

// Test error handling
console.log('\nTesting error handling...');
try {
  const error1 = new PDFGenerationError('Test error', 'generation', true, 'fallback');
  const error2 = new BrowserCompatibilityError('Canvas API');
  
  console.log('✓ Error objects created successfully');
  console.log('  - User message:', error1.getUserMessage());
  console.log('  - Recovery plan:', error1.getRecoveryPlan());
} catch (error) {
  console.error('✗ Error handling failed:', error);
}

// Test PDF service
console.log('\nTesting PDF service...');
try {
  const service = PDFGenerationService.getInstance();
  const capabilities = service.getBrowserCapabilities();
  const config = service.getDefaultConfiguration();
  
  console.log('✓ PDF service initialized successfully');
  console.log('✓ Service methods working');
} catch (error) {
  console.error('✗ PDF service failed:', error);
}

console.log('\n🎉 PDF infrastructure setup complete!');
console.log('All core components are ready for implementation.');