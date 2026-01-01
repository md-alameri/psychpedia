// TEMPORARY — REMOVE AFTER VERCEL VERIFICATION
// This route is for verifying environment variables are correctly set in Vercel.
// After confirming env vars are configured, delete this file entirely.

import { NextResponse } from 'next/server';
import { CMS_BASE_URL, CMS_REVALIDATE_SECRET } from '@/lib/cms/config';

/**
 * Temporary environment variable verification endpoint
 * 
 * Returns configuration status without exposing secrets.
 * 
 * Usage:
 *   curl https://www.psychpedia.com/api/env-check
 * 
 * After verification:
 *   1. Confirm env vars are set correctly
 *   2. Delete this file entirely
 *   3. Do NOT keep debug endpoints in production
 */
export async function GET() {
  // Server-only route - no client-side exposure
  // Read config values (which handle env var fallbacks and trimming)
  const baseUrl = CMS_BASE_URL || null;
  // Use the same trimmed/validated secret check as revalidate endpoint
  const hasRevalidateSecret = !!CMS_REVALIDATE_SECRET;

  // Return JSON response with safe information only
  // Never expose secret values, only boolean flags
  return NextResponse.json({
    CMS_BASE_URL: baseUrl,
    HAS_CMS_REVALIDATE_SECRET: hasRevalidateSecret,
  });
}

