/**
 * Deployment Diagnostic Endpoint
 * 
 * This endpoint helps verify that Vercel is deploying the correct Next.js root
 * and that API routes are being included in the build.
 * 
 * GET /api/__debug
 * 
 * Returns:
 * - 200: JSON with deployment diagnostics
 */

import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Check if report-issue route exists
  const reportIssuePath = join(process.cwd(), 'app', 'api', 'report-issue', 'route.ts');
  const hasIssueRoute = existsSync(reportIssuePath);

  return NextResponse.json(
    {
      ok: true,
      time: new Date().toISOString(),
      hasIssueRoute,
      projectRoot: process.cwd(),
      nodeEnv: process.env.NODE_ENV || 'not set',
    },
    { status: 200 }
  );
}

