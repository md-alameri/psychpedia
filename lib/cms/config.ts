/**
 * Centralized CMS configuration
 * Supports both old and new environment variable names for backward compatibility
 */

/**
 * Get CMS base URL from environment variables
 * Supports both old (NEXT_PUBLIC_CMS_URL) and new (CMS_BASE_URL) names
 * Prefers new name if both are set
 * 
 * Production safety:
 * - Defaults to production URL if not explicitly set
 * - Localhost fallback only allowed in development
 */
export const CMS_BASE_URL =
  process.env.CMS_BASE_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://cms.psychpedia.com');

/**
 * Get CMS API base URL from environment variables
 * Supports both old (CMS_API_BASE) and new (CMS_API_BASE) names
 * Defaults to ${CMS_BASE_URL}/api/v2 if not explicitly set
 */
export const CMS_API_BASE =
  process.env.CMS_API_BASE || `${CMS_BASE_URL}/api/v2`;

/**
 * Get CMS media base URL
 * Used for serving media files (images, documents) from Wagtail
 */
export const CMS_MEDIA_BASE = CMS_BASE_URL;

/**
 * Get CMS preview secret from environment variables
 * Supports both old (PREVIEW_TOKEN) and new (CMS_PREVIEW_SECRET) names
 * Prefers new name if both are set
 * Trims whitespace and returns undefined for empty strings
 */
export const CMS_PREVIEW_SECRET = (() => {
  const secret = process.env.CMS_PREVIEW_SECRET || process.env.PREVIEW_TOKEN;
  // Return undefined if secret is empty or only whitespace
  return secret?.trim() || undefined;
})();

/**
 * Get CMS revalidation secret from environment variables
 * Supports both old (REVALIDATE_SECRET) and new (CMS_REVALIDATE_SECRET) names
 * Prefers new name if both are set
 * Trims whitespace and returns undefined for empty strings
 */
export const CMS_REVALIDATE_SECRET = (() => {
  const secret = process.env.CMS_REVALIDATE_SECRET || process.env.REVALIDATE_SECRET;
  // Return undefined if secret is empty or only whitespace
  return secret?.trim() || undefined;
})();

/**
 * Check if CMS is explicitly configured
 * Returns true if any CMS-related environment variable is set
 */
export function isCMSConfigured(): boolean {
  return !!(
    process.env.CMS_BASE_URL ||
    process.env.NEXT_PUBLIC_CMS_URL ||
    process.env.CMS_API_BASE ||
    process.env.CMS_PREVIEW_SECRET ||
    process.env.PREVIEW_TOKEN ||
    process.env.CMS_REVALIDATE_SECRET ||
    process.env.REVALIDATE_SECRET
  );
}

