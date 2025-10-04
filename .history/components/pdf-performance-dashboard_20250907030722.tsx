// PDF Performance Dashboard Component

import React, { useState, useEffect } from 'react';
import { PDFPerformanceMonitor } from '../services/pdf-performance-monitor';
import { PDFGenerationController } from '../services/pdf-controller';

interface PerformanceDashboardProps {
  controller: PDFGenerationController;
  className?: string;
}

interface DashboardData {
  summary: any;
  successMetrics: any;
  fileSizeMetrics: any;
  alerts: any[];
  recommendations: string[];
  healthScore: number;
}

export const PDFPerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  controller,
  className = ''
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [controller]);

  const loadDashboardData = async () => {
    try {
      const stats = controller.getPerformanceStats();
      setDashboardData(stats.dashboard);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAlertTypeColor = (type: string): string => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No performance data available</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">PDF Performance Dashboard</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Health Score: <span className={`font-semibold ${getHealthScoreColor(dashboardData.healthScore)}`}>
              {formatPercentage(dashboardData.healthScore)}
            </span>
          </div>
          <button 
            onClick={loadDashboardData}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Avg Generation Time</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(dashboardData.summary.averageGenerationTime)}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Success Rate</div>
          <div className="text-2xl font-bold text-green-600">
            {formatPercentage(dashboardData.summary.successRate)}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Memory Efficiency</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatPercentage(dashboardData.summary.memoryEfficiency)}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Quality Score</div>
          <div className="text-2xl font-bold text-purple-600">
            {formatPercentage(dashboardData.summary.qualityScore)}
          </div>
        </div>
      </div>

      {/* Success Rate Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate by Strategy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(dashboardData.successMetrics.byStrategy).map(([strategy, rate]) => (
            <div key={strategy} className="text-center">
              <div className="text-sm font-medium text-gray-500 capitalize">{strategy}</div>
              <div className="text-xl font-bold text-gray-900">
                {formatPercentage(rate as number)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* File Size Metrics */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Size Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Average Size</div>
            <div className="text-xl font-bold text-gray-900">
              {formatFileSize(dashboardData.fileSizeMetrics.averageSize)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Small (&lt;1MB)</div>
            <div className="text-xl font-bold text-green-600">
              {formatPercentage(dashboardData.fileSizeMetrics.sizeDistribution.small)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Medium (1-3MB)</div>
            <div className="text-xl font-bold text-yellow-600">
              {formatPercentage(dashboardData.fileSizeMetrics.sizeDistribution.medium)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Large (&gt;3MB)</div>
            <div className="text-xl font-bold text-red-600">
              {formatPercentage(dashboardData.fileSizeMetrics.sizeDistribution.large)}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {dashboardData.alerts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {dashboardData.alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg ${getAlertTypeColor(alert.type)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs font-medium uppercase">{alert.type}</span>
                </div>
                {alert.suggestions && alert.suggestions.length > 0 && (
                  <div className="mt-2 text-sm">
                    <div className="font-medium">Suggestions:</div>
                    <ul className="list-disc list-inside">
                      {alert.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {dashboardData.recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {dashboardData.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Performance Trends */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-gray-500">Time Improvement</div>
            <div className={`text-xl font-bold ${
              dashboardData.summary.timeImprovement > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {dashboardData.summary.timeImprovement > 0 ? '+' : ''}
              {dashboardData.summary.timeImprovement.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Error Rate</div>
            <div className="text-xl font-bold text-gray-900">
              {formatPercentage(dashboardData.summary.errorRate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPerformanceDashboard;