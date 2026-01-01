/**
 * Health Check Endpoint
 * 
 * Simple health check endpoint for monitoring.
 * 
 * GET /api/health
 * 
 * Returns:
 * - 200: Service is healthy
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

