import { getAllConditionSlugs, getAllMedicationSlugs, loadCondition, loadMedication } from './loader';
import type { Locale } from './types';

export interface ContentHealthIssue {
  type: 'overdue_review' | 'missing_citations' | 'missing_sections' | 'draft_content' | 'missing_reviewer';
  severity: 'high' | 'medium' | 'low';
  message: string;
  slug: string;
  contentType: 'condition' | 'medication';
  locale: Locale;
}

export interface ContentHealthReport {
  slug: string;
  contentType: 'condition' | 'medication';
  locale: Locale;
  status: 'published' | 'draft';
  issues: ContentHealthIssue[];
  lastReviewed?: string;
  nextReviewDue?: string;
  isOverdue: boolean;
  daysUntilReview?: number;
  daysOverdue?: number;
}

/**
 * Check if content is overdue for review
 */
function isOverdue(nextReviewDue: string | undefined): { isOverdue: boolean; daysOverdue?: number; daysUntilReview?: number } {
  if (!nextReviewDue) {
    return { isOverdue: false };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(nextReviewDue);
  reviewDate.setHours(0, 0, 0, 0);
  
  const diffTime = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { isOverdue: true, daysOverdue: Math.abs(diffDays) };
  } else {
    return { isOverdue: false, daysUntilReview: diffDays };
  }
}

/**
 * Check for missing citations in clinician sections
 * This is a placeholder - actual implementation would parse MDX content
 */
function checkMissingCitations(content: string): boolean {
  // Simple check: look for reference patterns
  // In a real implementation, this would parse MDX and check for citation components
  const hasReferences = /references?|citations?|sources?/i.test(content);
  const hasCitationMarkers = /\[.*?\]|\(.*?\d{4}.*?\)/.test(content);
  return !hasReferences && !hasCitationMarkers;
}

/**
 * Check for missing required sections
 */
function checkMissingSections(
  contentType: 'condition' | 'medication',
  rawContent: string
): string[] {
  const missing: string[] = [];
  
  // This is a simplified check - in production, you'd parse MDX structure
  // For now, we'll just check if content exists
  if (!rawContent || rawContent.trim().length === 0) {
    missing.push('content');
  }
  
  return missing;
}

/**
 * Generate health report for a single content item
 */
async function checkContentHealth(
  contentType: 'condition' | 'medication',
  slug: string,
  locale: Locale
): Promise<ContentHealthReport | null> {
  const content = contentType === 'condition'
    ? await loadCondition(slug, locale)
    : await loadMedication(slug, locale);
  
  if (!content) {
    return null;
  }
  
  const issues: ContentHealthIssue[] = [];
  const { isOverdue: overdue, daysOverdue, daysUntilReview } = isOverdue(content.metadata.nextReviewDue);
  
  // Check for overdue review
  if (overdue && content.metadata.status === 'published') {
    issues.push({
      type: 'overdue_review',
      severity: daysOverdue && daysOverdue > 90 ? 'high' : daysOverdue && daysOverdue > 30 ? 'medium' : 'low',
      message: `Content is ${daysOverdue} days overdue for review`,
      slug,
      contentType,
      locale,
    });
  }
  
  // Check for missing reviewer (published content)
  if (content.metadata.status === 'published' && !content.metadata.editorial.reviewer.name) {
    issues.push({
      type: 'missing_reviewer',
      severity: 'high',
      message: 'Published content must have a reviewer',
      slug,
      contentType,
      locale,
    });
  }
  
  // Check for missing citations (simplified check)
  if (content.metadata.status === 'published' && checkMissingCitations(content.rawContent || '')) {
    issues.push({
      type: 'missing_citations',
      severity: 'medium',
      message: 'Content may be missing citations or references',
      slug,
      contentType,
      locale,
    });
  }
  
  // Check for missing sections
  const missingSections = checkMissingSections(contentType, content.rawContent || '');
  if (missingSections.length > 0) {
    issues.push({
      type: 'missing_sections',
      severity: 'low',
      message: `Missing sections: ${missingSections.join(', ')}`,
      slug,
      contentType,
      locale,
    });
  }
  
  // Draft content (informational)
  if (content.metadata.status === 'draft') {
    issues.push({
      type: 'draft_content',
      severity: 'low',
      message: 'Content is in draft status',
      slug,
      contentType,
      locale,
    });
  }
  
  return {
    slug,
    contentType,
    locale,
    status: content.metadata.status,
    issues,
    lastReviewed: content.metadata.editorial.lastReviewed,
    nextReviewDue: content.metadata.nextReviewDue,
    isOverdue: overdue,
    daysUntilReview,
    daysOverdue,
  };
}

/**
 * Generate health report for all content
 */
export async function generateContentHealthReport(): Promise<ContentHealthReport[]> {
  const reports: ContentHealthReport[] = [];
  
  // Check all conditions
  const conditionSlugs = getAllConditionSlugs();
  for (const slug of conditionSlugs) {
    for (const locale of ['en', 'ar'] as Locale[]) {
      const report = await checkContentHealth('condition', slug, locale);
      if (report) {
        reports.push(report);
      }
    }
  }
  
  // Check all medications
  const medicationSlugs = getAllMedicationSlugs();
  for (const slug of medicationSlugs) {
    for (const locale of ['en', 'ar'] as Locale[]) {
      const report = await checkContentHealth('medication', slug, locale);
      if (report) {
        reports.push(report);
      }
    }
  }
  
  return reports;
}

/**
 * Get summary statistics from health report
 */
export function getHealthSummary(reports: ContentHealthReport[]) {
  const total = reports.length;
  const published = reports.filter(r => r.status === 'published').length;
  const drafts = reports.filter(r => r.status === 'draft').length;
  const overdue = reports.filter(r => r.isOverdue).length;
  const withIssues = reports.filter(r => r.issues.length > 0).length;
  
  const issuesByType = {
    overdue_review: reports.filter(r => r.issues.some(i => i.type === 'overdue_review')).length,
    missing_citations: reports.filter(r => r.issues.some(i => i.type === 'missing_citations')).length,
    missing_sections: reports.filter(r => r.issues.some(i => i.type === 'missing_sections')).length,
    missing_reviewer: reports.filter(r => r.issues.some(i => i.type === 'missing_reviewer')).length,
    draft_content: reports.filter(r => r.issues.some(i => i.type === 'draft_content')).length,
  };
  
  const issuesBySeverity = {
    high: reports.filter(r => r.issues.some(i => i.severity === 'high')).length,
    medium: reports.filter(r => r.issues.some(i => i.severity === 'medium')).length,
    low: reports.filter(r => r.issues.some(i => i.severity === 'low')).length,
  };
  
  return {
    total,
    published,
    drafts,
    overdue,
    withIssues,
    issuesByType,
    issuesBySeverity,
  };
}

