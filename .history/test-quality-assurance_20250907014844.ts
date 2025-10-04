// Test file for Quality Assurance Module

import { PDFValidationService } from './services/pdf-validation-service';
import { PDFATSCompatibilityService } from './services/pdf-ats-compatibility-service';
import { PDFQualityMetricsService } from './services/pdf-quality-metrics-service';

/**
 * Test the Quality Assurance Module with a sample PDF
 */
async function testQualityAssurance() {
  console.log('🔍 Testing PDF Quality Assurance Module...\n');

  // Create service instances
  const validationService = new PDFValidationService();
  const atsService = new PDFATSCompatibilityService();
  const qualityService = new PDFQualityMetricsService();

  try {
    // Create a mock PDF blob for testing
    const mockPDFContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Hello World) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000189 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
284
%%EOF`;

    const mockPDFBlob = new Blob([mockPDFContent], { type: 'application/pdf' });

    console.log('📋 Testing PDF Validation Service...');
    const validationResult = await validationService.validatePDF(mockPDFBlob);
    console.log('✅ Validation Result:', {
      isValid: validationResult.isValid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
      suggestionCount: validationResult.suggestions.length
    });

    console.log('\n🤖 Testing ATS Compatibility Service...');
    const atsResult = await atsService.testATSCompatibility(
      mockPDFBlob,
      { name: 'John Doe', email: 'john@example.com' }
    );
    console.log('✅ ATS Compatibility Result:', {
      overallCompatible: atsResult.overallCompatible,
      compatibilityScore: atsResult.compatibilityScore.toFixed(2),
      textExtractable: atsResult.textExtraction.success,
      searchable: atsResult.searchability.isSearchable,
      metadataValid: atsResult.metadata.isValid
    });

    console.log('\n📊 Testing Quality Metrics Service...');
    const qualityReport = await qualityService.assessPDFQuality(
      mockPDFBlob,
      undefined, // no original element
      { name: 'John Doe', email: 'john@example.com' },
      {
        generationTime: 2500,
        memoryUsage: 1024 * 1024, // 1MB
        cpuUsage: 15
      }
    );

    console.log('✅ Quality Assessment Result:', {
      overallScore: qualityReport.qualityScore.overall,
      grade: getQualityGrade(qualityReport.qualityScore.overall),
      textQuality: qualityReport.qualityScore.textQuality,
      layoutFidelity: qualityReport.qualityScore.layoutFidelity,
      atsCompatibility: qualityReport.qualityScore.atsCompatibility,
      recommendationCount: qualityReport.recommendations.length,
      summary: qualityReport.summary
    });

    console.log('\n📈 Testing Quality Dashboard...');
    const dashboard = qualityService.generateQualityDashboard();
    console.log('✅ Dashboard Generated:', {
      hasCurrentPeriod: !!dashboard.currentPeriod,
      hasPreviousPeriod: !!dashboard.previousPeriod,
      trendCount: dashboard.trends.length,
      topIssueCount: dashboard.topIssues.length,
      recommendationCount: dashboard.recommendations.length
    });

    console.log('\n🎉 All Quality Assurance Module tests completed successfully!');

    // Display detailed results
    console.log('\n📝 Detailed Quality Report:');
    console.log('─'.repeat(50));
    console.log(`Overall Quality Score: ${qualityReport.qualityScore.overall}/100`);
    console.log(`Text Quality: ${qualityReport.qualityScore.textQuality}/100`);
    console.log(`Layout Fidelity: ${qualityReport.qualityScore.layoutFidelity}/100`);
    console.log(`ATS Compatibility: ${qualityReport.qualityScore.atsCompatibility}/100`);
    console.log(`File Optimization: ${qualityReport.qualityScore.fileOptimization}/100`);
    console.log(`Compliance: ${qualityReport.qualityScore.compliance}/100`);
    console.log(`\nSummary: ${qualityReport.summary}`);

    if (qualityReport.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      qualityReport.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.issue}`);
        console.log(`   → ${rec.recommendation}`);
        console.log(`   Impact: ${rec.impact}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

function getQualityGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}

// Run the test if this file is executed directly
if (require.main === module) {
  testQualityAssurance().catch(console.error);
}

export { testQualityAssurance };