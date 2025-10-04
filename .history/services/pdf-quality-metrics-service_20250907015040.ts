// PDF Quality Metrics and Reporting Service

import { QualityMetrics, GenerationResult, ValidationResult } from '../types/pdf';
import { PDFValidationService } from './pdf-validation-service';
import { PDFATSCompatibilityService, ATSCompatibilityResult } from './pdf-ats-compatibility-service';

// Browser environment type definitions
interface HTMLElement {
  getBoundingClientRect(): { width: number; height: number; top: number; left: number; bottom: number; right: number };
  textContent: string | null;
}

export interface PerformanceMetrics {
  generationTime: number; // milliseconds
  memoryUsage: number; // bytes
  cpuUsage: number; // percentage
  networkLatency?: number; // milliseconds (for server-side generation)
}

export interface QualityScore {
  overall: number; // 0-100
  textQuality: number; // 0-100
  layoutFidelity: number; // 0-100
  atsCompatibility: number; // 0-100
  fileOptimization: number; // 0-100
  compliance: number; // 0-100
}

export interface QualityReport {
  timestamp: Date;
  pdfId: string;
  qualityScore: QualityScore;
  performanceMetrics: PerformanceMetrics;
  validationResults: ValidationResult;
  atsCompatibility: ATSCompatibilityResult;
  recommendations: QualityRecommendation[];
  technicalDetails: TechnicalDetails;
  summary: string;
}

export interface QualityRecommendation {
  category: 'performance' | 'quality' | 'compatibility' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  issue: string;
  recommendation: string;
  impact: string;
}

export interface TechnicalDetails {
  fileSize: number;
  pageCount: number;
  textExtractability: number;
  fontEmbedding: boolean;
  imageOptimization: boolean;
  pdfVersion: string;
  compressionRatio: number;
  errors: string[];
  warnings: string[];
}

export interface QualityTrend {
  date: Date;
  overallScore: number;
  generationTime: number;
  successRate: number;
  averageFileSize: number;
}

export interface QualityDashboard {
  currentPeriod: QualityTrend;
  previousPeriod: QualityTrend;
  trends: QualityTrend[];
  topIssues: Array<{ issue: string; frequency: number; impact: string }>;
  recommendations: QualityRecommendation[];
}

export class PDFQualityMetricsService {
  private validationService: PDFValidationService;
  private atsService: PDFATSCompatibilityService;
  private qualityHistory: QualityReport[] = [];

  constructor() {
    this.validationService = new PDFValidationService();
    this.atsService = new PDFATSCompatibilityService();
  }

  /**
   * Performs comprehensive quality assessment of a generated PDF
   */
  async assessPDFQuality(
    pdfBlob: Blob,
    originalElement?: HTMLElement,
    expectedContent?: Record<string, string>,
    performanceMetrics?: PerformanceMetrics,
    pdfId?: string
  ): Promise<QualityReport> {
    const startTime = Date.now();
    const reportId = pdfId || this.generateReportId();

    try {
      // Run validation tests
      const validationResults = await this.validationService.validatePDF(
        pdfBlob, 
        originalElement
      );

      // Run ATS compatibility tests
      const atsCompatibility = await this.atsService.testATSCompatibility(
        pdfBlob,
        expectedContent
      );

      // Calculate quality scores
      const qualityScore = this.calculateQualityScore(validationResults, atsCompatibility);

      // Generate performance metrics if not provided
      const finalPerformanceMetrics = performanceMetrics || {
        generationTime: Date.now() - startTime,
        memoryUsage: this.estimateMemoryUsage(pdfBlob),
        cpuUsage: 0 // Would need actual monitoring
      };

      // Extract technical details
      const technicalDetails = await this.extractTechnicalDetails(
        pdfBlob, 
        validationResults, 
        atsCompatibility
      );

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        qualityScore,
        validationResults,
        atsCompatibility,
        finalPerformanceMetrics
      );

      // Create summary
      const summary = this.generateSummary(qualityScore, recommendations);

      const report: QualityReport = {
        timestamp: new Date(),
        pdfId: reportId,
        qualityScore,
        performanceMetrics: finalPerformanceMetrics,
        validationResults,
        atsCompatibility,
        recommendations,
        technicalDetails,
        summary
      };

      // Store in history for trend analysis
      this.qualityHistory.push(report);
      this.maintainHistorySize();

      return report;

    } catch (error) {
      // Return error report
      return this.createErrorReport(reportId, error);
    }
  }

  /**
   * Calculates comprehensive quality score based on multiple factors
   */
  private calculateQualityScore(
    validation: ValidationResult,
    atsCompatibility: ATSCompatibilityResult
  ): QualityScore {
    // Text quality score (0-100)
    const textQuality = Math.round(
      (atsCompatibility.textExtraction.success ? 50 : 0) +
      (atsCompatibility.textExtraction.extractionScore * 30) +
      (atsCompatibility.searchability.searchScore * 20)
    );

    // Layout fidelity score (0-100)
    const layoutFidelity = validation.isValid ? 
      Math.round(85 + (validation.warnings.length === 0 ? 15 : Math.max(0, 15 - validation.warnings.length * 3))) :
      Math.round(Math.max(0, 50 - validation.errors.length * 10));

    // ATS compatibility score (0-100)
    const atsCompatibilityScore = Math.round(atsCompatibility.compatibilityScore * 100);

    // File optimization score (0-100)
    const fileOptimization = this.calculateOptimizationScore(validation);

    // Compliance score (0-100)
    const compliance = this.calculateComplianceScore(validation, atsCompatibility);

    // Overall score (weighted average)
    const overall = Math.round(
      (textQuality * 0.25) +
      (layoutFidelity * 0.25) +
      (atsCompatibilityScore * 0.25) +
      (fileOptimization * 0.15) +
      (compliance * 0.10)
    );

    return {
      overall,
      textQuality,
      layoutFidelity,
      atsCompatibility: atsCompatibilityScore,
      fileOptimization,
      compliance
    };
  }

  /**
   * Calculates file optimization score
   */
  private calculateOptimizationScore(validation: ValidationResult): number {
    let score = 100;

    // Penalize for file size issues
    const fileSizeIssues = validation.errors.filter(error => 
      error.toLowerCase().includes('file size') || error.toLowerCase().includes('size')
    );
    score -= fileSizeIssues.length * 20;

    // Penalize for optimization warnings
    const optimizationWarnings = validation.warnings.filter(warning =>
      warning.toLowerCase().includes('optimization') || 
      warning.toLowerCase().includes('compress')
    );
    score -= optimizationWarnings.length * 10;

    return Math.max(0, score);
  }

  /**
   * Calculates compliance score
   */
  private calculateComplianceScore(
    validation: ValidationResult,
    atsCompatibility: ATSCompatibilityResult
  ): number {
    let score = 100;

    // Check metadata compliance
    if (!atsCompatibility.metadata.isValid) {
      score -= 30;
    }

    // Check PDF/A compliance
    const complianceErrors = validation.errors.filter(error =>
      error.toLowerCase().includes('compliance') ||
      error.toLowerCase().includes('pdf/a')
    );
    score -= complianceErrors.length * 25;

    return Math.max(0, score);
  }

  /**
   * Extracts technical details from PDF and test results
   */
  private async extractTechnicalDetails(
    pdfBlob: Blob,
    validation: ValidationResult,
    atsCompatibility: ATSCompatibilityResult
  ): Promise<TechnicalDetails> {
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    const pdfString = new TextDecoder('latin1').decode(pdfData);

    // Extract PDF version
    const versionMatch = pdfString.match(/%PDF-(\d+\.\d+)/);
    const pdfVersion = versionMatch ? versionMatch[1] : 'unknown';

    // Count pages
    const pagePattern = /\/Type\s*\/Page(?!\s*\/Parent)/g;
    const pages = pdfString.match(pagePattern) || [];
    const pageCount = pages.length;

    // Check font embedding
    const fontEmbedding = pdfString.includes('/FontDescriptor') && 
                         pdfString.includes('/FontFile');

    // Check image optimization
    const imagePattern = /\/Type\s*\/XObject.*?\/Subtype\s*\/Image/gs;
    const images = pdfString.match(imagePattern) || [];
    const imageOptimization = images.length === 0 || 
                             pdfString.includes('/Filter') && 
                             pdfString.includes('/DCTDecode');

    // Calculate compression ratio (estimated)
    const uncompressedEstimate = pdfBlob.size * 2; // Rough estimate
    const compressionRatio = pdfBlob.size / uncompressedEstimate;

    return {
      fileSize: pdfBlob.size,
      pageCount,
      textExtractability: atsCompatibility.textExtraction.extractionScore,
      fontEmbedding,
      imageOptimization,
      pdfVersion,
      compressionRatio,
      errors: validation.errors,
      warnings: validation.warnings
    };
  }

  /**
   * Generates actionable recommendations based on quality assessment
   */
  private generateRecommendations(
    qualityScore: QualityScore,
    validation: ValidationResult,
    atsCompatibility: ATSCompatibilityResult,
    performance: PerformanceMetrics
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // Text quality recommendations
    if (qualityScore.textQuality < 80) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        issue: 'Poor text extractability',
        recommendation: 'Ensure proper font embedding and avoid text-as-image rendering',
        impact: 'Critical for ATS compatibility'
      });
    }

    // Layout fidelity recommendations
    if (qualityScore.layoutFidelity < 85) {
      recommendations.push({
        category: 'quality',
        priority: 'medium',
        issue: 'Layout fidelity issues detected',
        recommendation: 'Review CSS-to-PDF conversion settings and page break handling',
        impact: 'Affects professional appearance'
      });
    }

    // ATS compatibility recommendations
    if (qualityScore.atsCompatibility < 80) {
      recommendations.push({
        category: 'compatibility',
        priority: 'high',
        issue: 'ATS compatibility concerns',
        recommendation: 'Improve text structure and add proper document metadata',
        impact: 'May prevent proper parsing by ATS systems'
      });
    }

    // Performance recommendations
    if (performance.generationTime > 10000) { // 10 seconds
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        issue: 'Slow PDF generation',
        recommendation: 'Optimize content processing and consider image compression',
        impact: 'Poor user experience'
      });
    }

    // File size recommendations
    if (qualityScore.fileOptimization < 70) {
      recommendations.push({
        category: 'optimization',
        priority: 'low',
        issue: 'Large file size',
        recommendation: 'Enable compression and optimize images',
        impact: 'May cause upload/email issues'
      });
    }

    // Metadata recommendations
    if (!atsCompatibility.metadata.isValid) {
      recommendations.push({
        category: 'compatibility',
        priority: 'medium',
        issue: 'Missing document metadata',
        recommendation: 'Add title, author, and keywords to document properties',
        impact: 'Improves searchability and professional appearance'
      });
    }

    return recommendations;
  }

  /**
   * Generates a human-readable summary of the quality assessment
   */
  private generateSummary(
    qualityScore: QualityScore,
    recommendations: QualityRecommendation[]
  ): string {
    const overallGrade = this.getQualityGrade(qualityScore.overall);
    const highPriorityIssues = recommendations.filter(r => r.priority === 'high').length;

    let summary = `PDF Quality: ${overallGrade} (${qualityScore.overall}/100). `;

    if (qualityScore.overall >= 90) {
      summary += 'Excellent quality with professional appearance and full ATS compatibility.';
    } else if (qualityScore.overall >= 80) {
      summary += 'Good quality with minor areas for improvement.';
    } else if (qualityScore.overall >= 70) {
      summary += 'Acceptable quality but requires attention to ensure optimal results.';
    } else {
      summary += 'Quality issues detected that may impact professional use.';
    }

    if (highPriorityIssues > 0) {
      summary += ` ${highPriorityIssues} high-priority issue${highPriorityIssues > 1 ? 's' : ''} require${highPriorityIssues === 1 ? 's' : ''} immediate attention.`;
    }

    return summary;
  }

  /**
   * Converts numeric score to letter grade
   */
  private getQualityGrade(score: number): string {
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

  /**
   * Generates quality trends and dashboard data
   */
  generateQualityDashboard(days: number = 30): QualityDashboard {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentReports = this.qualityHistory.filter(
      report => report.timestamp >= cutoffDate
    );

    if (recentReports.length === 0) {
      return this.createEmptyDashboard();
    }

    // Calculate current period metrics
    const currentPeriod = this.calculatePeriodMetrics(recentReports);

    // Calculate previous period metrics
    const previousCutoff = new Date(cutoffDate);
    previousCutoff.setDate(previousCutoff.getDate() - days);
    const previousReports = this.qualityHistory.filter(
      report => report.timestamp >= previousCutoff && report.timestamp < cutoffDate
    );
    const previousPeriod = this.calculatePeriodMetrics(previousReports);

    // Generate trends
    const trends = this.generateTrends(recentReports, days);

    // Identify top issues
    const topIssues = this.identifyTopIssues(recentReports);

    // Generate recommendations
    const recommendations = this.generateDashboardRecommendations(
      currentPeriod,
      previousPeriod,
      topIssues
    );

    return {
      currentPeriod,
      previousPeriod,
      trends,
      topIssues,
      recommendations
    };
  }

  /**
   * Calculates metrics for a period
   */
  private calculatePeriodMetrics(reports: QualityReport[]): QualityTrend {
    if (reports.length === 0) {
      return {
        date: new Date(),
        overallScore: 0,
        generationTime: 0,
        successRate: 0,
        averageFileSize: 0
      };
    }

    const totalScore = reports.reduce((sum, r) => sum + r.qualityScore.overall, 0);
    const totalTime = reports.reduce((sum, r) => sum + r.performanceMetrics.generationTime, 0);
    const totalSize = reports.reduce((sum, r) => sum + r.technicalDetails.fileSize, 0);
    const successfulReports = reports.filter(r => r.qualityScore.overall >= 70);

    return {
      date: new Date(),
      overallScore: totalScore / reports.length,
      generationTime: totalTime / reports.length,
      successRate: (successfulReports.length / reports.length) * 100,
      averageFileSize: totalSize / reports.length
    };
  }

  /**
   * Generates trend data over time
   */
  private generateTrends(reports: QualityReport[], days: number): QualityTrend[] {
    const trends: QualityTrend[] = [];
    const dailyReports: { [key: string]: QualityReport[] } = {};

    // Group reports by day
    reports.forEach(report => {
      const dateKey = report.timestamp.toISOString().split('T')[0];
      if (!dailyReports[dateKey]) {
        dailyReports[dateKey] = [];
      }
      dailyReports[dateKey].push(report);
    });

    // Calculate daily metrics
    Object.entries(dailyReports).forEach(([dateKey, dayReports]) => {
      trends.push({
        date: new Date(dateKey),
        ...this.calculatePeriodMetrics(dayReports)
      });
    });

    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Identifies the most common issues
   */
  private identifyTopIssues(reports: QualityReport[]): Array<{ issue: string; frequency: number; impact: string }> {
    const issueCount: { [key: string]: { count: number; impact: string } } = {};

    reports.forEach(report => {
      report.recommendations.forEach(rec => {
        if (!issueCount[rec.issue]) {
          issueCount[rec.issue] = { count: 0, impact: rec.impact };
        }
        issueCount[rec.issue].count++;
      });
    });

    return Object.entries(issueCount)
      .map(([issue, data]) => ({
        issue,
        frequency: data.count,
        impact: data.impact
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }

  /**
   * Generates dashboard-level recommendations
   */
  private generateDashboardRecommendations(
    current: QualityTrend,
    previous: QualityTrend,
    topIssues: Array<{ issue: string; frequency: number; impact: string }>
  ): QualityRecommendation[] {
    const recommendations: QualityRecommendation[] = [];

    // Performance trend recommendations
    if (current.generationTime > previous.generationTime * 1.2) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        issue: 'Generation time increasing',
        recommendation: 'Review recent changes and optimize PDF generation pipeline',
        impact: 'User experience degradation'
      });
    }

    // Quality trend recommendations
    if (current.overallScore < previous.overallScore - 5) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        issue: 'Quality scores declining',
        recommendation: 'Investigate recent changes and review quality control processes',
        impact: 'Overall system reliability'
      });
    }

    // Success rate recommendations
    if (current.successRate < 90) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        issue: 'Low success rate',
        recommendation: 'Address top issues and improve error handling',
        impact: 'User satisfaction and system reliability'
      });
    }

    return recommendations;
  }

  // Helper methods

  private generateReportId(): string {
    return `pdf-quality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateMemoryUsage(pdfBlob: Blob): number {
    // Rough estimate: PDF size * 3 (for processing overhead)
    return pdfBlob.size * 3;
  }

  private maintainHistorySize(): void {
    // Keep only last 1000 reports
    if (this.qualityHistory.length > 1000) {
      this.qualityHistory = this.qualityHistory.slice(-1000);
    }
  }

  private createEmptyDashboard(): QualityDashboard {
    const emptyTrend: QualityTrend = {
      date: new Date(),
      overallScore: 0,
      generationTime: 0,
      successRate: 0,
      averageFileSize: 0
    };

    return {
      currentPeriod: emptyTrend,
      previousPeriod: emptyTrend,
      trends: [],
      topIssues: [],
      recommendations: []
    };
  }

  private createErrorReport(reportId: string, error: unknown): QualityReport {
    return {
      timestamp: new Date(),
      pdfId: reportId,
      qualityScore: {
        overall: 0,
        textQuality: 0,
        layoutFidelity: 0,
        atsCompatibility: 0,
        fileOptimization: 0,
        compliance: 0
      },
      performanceMetrics: {
        generationTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      validationResults: {
        isValid: false,
        errors: [`Quality assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        suggestions: []
      },
      atsCompatibility: {
        overallCompatible: false,
        compatibilityScore: 0,
        textExtraction: {
          success: false,
          extractedText: '',
          wordCount: 0,
          characterCount: 0,
          preservedFormatting: false,
          issues: ['Assessment failed']
        },
        searchability: {
          isSearchable: false,
          indexableContent: [],
          searchScore: 0,
          keywordDetection: false,
          issues: ['Assessment failed']
        },
        metadata: {
          isValid: false,
          hasTitle: false,
          hasAuthor: false,
          hasKeywords: false,
          hasCreationDate: false,
          metadata: {},
          issues: ['Assessment failed']
        },
        parserTests: [],
        recommendations: []
      },
      recommendations: [{
        category: 'quality',
        priority: 'high',
        issue: 'Quality assessment failed',
        recommendation: 'Check PDF generation process and try again',
        impact: 'Cannot determine PDF quality'
      }],
      technicalDetails: {
        fileSize: 0,
        pageCount: 0,
        textExtractability: 0,
        fontEmbedding: false,
        imageOptimization: false,
        pdfVersion: 'unknown',
        compressionRatio: 0,
        errors: [`Assessment error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      },
      summary: 'Quality assessment failed - unable to evaluate PDF'
    };
  }

  /**
   * Exports quality report as JSON
   */
  exportReport(report: QualityReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Gets quality history for analysis
   */
  getQualityHistory(limit?: number): QualityReport[] {
    return limit ? this.qualityHistory.slice(-limit) : [...this.qualityHistory];
  }

  /**
   * Clears quality history
   */
  clearHistory(): void {
    this.qualityHistory = [];
  }
}