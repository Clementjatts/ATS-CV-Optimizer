// Test Document Processing System

import { documentProcessingService } from './services/pdf-document-processing-service';
import { PDFConfiguration } from './types/pdf';

/**
 * Test the document processing system with a sample CV element
 */
async function testDocumentProcessing() {
  console.log('Testing PDF Document Processing System...');
  
  try {
    // Create a test CV element
    const testElement = createTestCVElement();
    
    // Create test configuration
    const config: PDFConfiguration = {
      format: 'letter',
      orientation: 'portrait',
      margins: {
        top: 0.5,
        right: 0.5,
        bottom: 0.5,
        left: 0.5
      },
      resolution: 150,
      compression: {
        text: true,
        images: true,
        level: 'medium'
      },
      imageQuality: 0.85,
      fonts: [],
      colors: {
        mode: 'rgb'
      },
      metadata: {
        title: 'Test CV',
        author: 'Test User',
        creator: 'PDF Generation System',
        producer: 'ATS CV Optimizer'
      },
      strategy: 'modern',
      timeout: 30000,
      retryAttempts: 3
    };
    
    // Test document validation
    console.log('\n1. Testing document validation...');
    const validation = documentProcessingService.validateDocumentForProcessing(testElement);
    console.log('Validation result:', {
      isValid: validation.isValid,
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      suggestions: validation.suggestions.length
    });
    
    // Test processing recommendations
    console.log('\n2. Testing processing recommendations...');
    const recommendations = documentProcessingService.getProcessingRecommendations(testElement, config);
    console.log('Recommendations:', recommendations);
    
    // Test optimal processing options
    console.log('\n3. Testing optimal processing options...');
    const optimalOptions = documentProcessingService.createOptimalProcessingOptions(testElement, config);
    console.log('Optimal options:', optimalOptions);
    
    // Test quick processing
    console.log('\n4. Testing quick document processing...');
    const quickResult = await documentProcessingService.quickProcessDocument(testElement, config);
    console.log('Quick processing completed. Element dimensions:', {
      width: quickResult.offsetWidth,
      height: quickResult.offsetHeight
    });
    
    // Test full processing
    console.log('\n5. Testing full document processing...');
    const fullResult = await documentProcessingService.processDocumentForPDF(
      testElement, 
      config, 
      optimalOptions
    );
    
    // Display processing summary
    console.log('\n6. Processing Summary:');
    const summary = documentProcessingService.createProcessingSummary(fullResult);
    console.log(summary);
    
    // Test custom break points
    console.log('\n7. Testing custom break points...');
    const customBreakResult = await documentProcessingService.processWithCustomBreaks(
      testElement,
      config,
      ['h2', '.section']
    );
    console.log('Custom break processing completed. Element dimensions:', {
      width: customBreakResult.offsetWidth,
      height: customBreakResult.offsetHeight
    });
    
    console.log('\n✅ All document processing tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Document processing test failed:', error);
    throw error;
  }
}

/**
 * Create a test CV element for testing
 */
function createTestCVElement(): HTMLElement {
  const cvElement = document.createElement('div');
  cvElement.id = 'cv-preview';
  cvElement.className = 'bg-white p-6 md:p-8 text-black font-calibri text-[10pt] leading-normal w-full max-w-3xl mx-auto';
  
  cvElement.innerHTML = `
    <header class="text-center border-b-2 border-gray-300 pb-4 mb-6">
      <h1 class="text-3xl font-bold text-gray-800 uppercase tracking-wide mb-2">John Doe</h1>
      <div class="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-600">
        <span>New York, NY</span>
        <span>john.doe@email.com</span>
        <span>(555) 123-4567</span>
      </div>
    </header>

    <section class="mb-6">
      <h2 class="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-3">
        Professional Summary
      </h2>
      <p class="text-gray-700 leading-relaxed text-justify">
        Experienced software engineer with 5+ years of experience in full-stack development. 
        Proven track record of delivering high-quality applications using modern technologies 
        and best practices. Strong problem-solving skills and ability to work in agile environments.
      </p>
    </section>

    <section class="mb-6">
      <h2 class="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
        Professional Experience
      </h2>
      <div class="space-y-6">
        <div class="border-l-4 border-blue-500 pl-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-base font-bold text-gray-800">Senior Software Engineer</h3>
            <span class="text-sm font-semibold text-gray-600">2020 - Present</span>
          </div>
          <div class="flex justify-between items-start mb-3">
            <p class="text-base font-semibold text-blue-600">Tech Company Inc.</p>
            <p class="text-sm text-gray-600">San Francisco, CA</p>
          </div>
          <ul class="space-y-1">
            <li class="text-sm text-gray-700 flex items-start">
              <span class="text-blue-500 mr-2 mt-1">•</span>
              <span>Led development of microservices architecture serving 1M+ users</span>
            </li>
            <li class="text-sm text-gray-700 flex items-start">
              <span class="text-blue-500 mr-2 mt-1">•</span>
              <span>Implemented CI/CD pipelines reducing deployment time by 60%</span>
            </li>
            <li class="text-sm text-gray-700 flex items-start">
              <span class="text-blue-500 mr-2 mt-1">•</span>
              <span>Mentored junior developers and conducted code reviews</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
        Education
      </h2>
      <div class="space-y-4">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-base font-bold text-gray-800">University of Technology</h3>
            <p class="text-sm text-gray-600">Bachelor of Science in Computer Science</p>
          </div>
          <span class="text-sm font-semibold text-gray-600">2016 - 2020</span>
        </div>
      </div>
    </section>

    <section class="mb-6">
      <h2 class="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-400 pb-1 mb-4">
        Key Skills & Competencies
      </h2>
      <div class="grid grid-cols-2 gap-x-8 gap-y-1">
        <div class="text-sm text-gray-700 flex items-start">
          <span class="text-blue-500 mr-2 mt-1">•</span>
          <span>JavaScript/TypeScript</span>
        </div>
        <div class="text-sm text-gray-700 flex items-start">
          <span class="text-blue-500 mr-2 mt-1">•</span>
          <span>React/Node.js</span>
        </div>
        <div class="text-sm text-gray-700 flex items-start">
          <span class="text-blue-500 mr-2 mt-1">•</span>
          <span>AWS/Docker</span>
        </div>
        <div class="text-sm text-gray-700 flex items-start">
          <span class="text-blue-500 mr-2 mt-1">•</span>
          <span>PostgreSQL/MongoDB</span>
        </div>
      </div>
    </section>
  `;
  
  // Add to document temporarily for processing
  cvElement.style.position = 'absolute';
  cvElement.style.left = '-9999px';
  cvElement.style.top = '-9999px';
  cvElement.style.width = '800px'; // Set a reasonable width for testing
  document.body.appendChild(cvElement);
  
  return cvElement;
}

// Export test function
export { testDocumentProcessing };

// Run test if this file is executed directly
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    testDocumentProcessing().catch(console.error);
  });
} else if (typeof window !== 'undefined') {
  testDocumentProcessing().catch(console.error);
}