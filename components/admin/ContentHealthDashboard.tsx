'use client';

import Link from 'next/link';
import type { ContentHealthReport } from '@/lib/content/health';
import ReviewOverdueBadge from './ReviewOverdueBadge';

interface ContentHealthDashboardProps {
  reports: ContentHealthReport[];
  summary: {
    total: number;
    published: number;
    drafts: number;
    overdue: number;
    withIssues: number;
    issuesByType: Record<string, number>;
    issuesBySeverity: Record<string, number>;
  };
  locale: string;
}

export default function ContentHealthDashboard({
  reports,
  summary,
  locale,
}: ContentHealthDashboardProps) {
  const severityColors = {
    high: 'text-red-600 dark:text-red-400',
    medium: 'text-orange-600 dark:text-orange-400',
    low: 'text-yellow-600 dark:text-yellow-400',
  };
  
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-semibold text-text-primary mb-4">
            Content Health Dashboard
          </h1>
          <p className="text-lg text-text-secondary">
            Monitor content quality, review status, and identify issues
          </p>
        </header>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-background-light border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-muted mb-2">Total Content</h3>
            <p className="text-3xl font-semibold text-text-primary">{summary.total}</p>
          </div>
          <div className="bg-background-light border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-muted mb-2">Published</h3>
            <p className="text-3xl font-semibold text-green-600">{summary.published}</p>
          </div>
          <div className="bg-background-light border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-muted mb-2">Overdue Reviews</h3>
            <p className="text-3xl font-semibold text-red-600">{summary.overdue}</p>
          </div>
          <div className="bg-background-light border border-border rounded-lg p-6">
            <h3 className="text-sm font-medium text-text-muted mb-2">With Issues</h3>
            <p className="text-3xl font-semibold text-orange-600">{summary.withIssues}</p>
          </div>
        </div>
        
        {/* Issues by Type */}
        <div className="bg-background-light border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Issues by Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(summary.issuesByType).map(([type, count]) => (
              <div key={type} className="text-center">
                <p className="text-2xl font-semibold text-text-primary">{count}</p>
                <p className="text-sm text-text-muted capitalize">{type.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content List */}
        <div className="bg-background-light border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">Content Health Report</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background-off">
                <tr>
                  <th className="px-6 py-3 text-left rtl:text-right text-sm font-semibold text-text-primary">Content</th>
                  <th className="px-6 py-3 text-left rtl:text-right text-sm font-semibold text-text-primary">Status</th>
                  <th className="px-6 py-3 text-left rtl:text-right text-sm font-semibold text-text-primary">Review Status</th>
                  <th className="px-6 py-3 text-left rtl:text-right text-sm font-semibold text-text-primary">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => (
                  <tr key={`${report.contentType}-${report.slug}-${report.locale}`} className="hover:bg-background-off">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-accent uppercase">
                          {report.contentType}
                        </span>
                        <Link
                          href={`/${locale}/${report.contentType === 'condition' ? 'conditions' : 'medications'}/${report.slug}`}
                          className="font-medium text-text-primary hover:text-accent"
                        >
                          {report.slug}
                        </Link>
                        <span className="text-xs text-text-muted">
                          {report.locale.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        report.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <ReviewOverdueBadge
                        daysOverdue={report.daysOverdue}
                        daysUntilReview={report.daysUntilReview}
                        isOverdue={report.isOverdue}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {report.issues.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {report.issues.map((issue, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded ${severityColors[issue.severity]}`}
                            >
                              {issue.type.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">No issues</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

