import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limiting store
// Maps IP address to rate limit entry
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 requests per window

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default (shouldn't happen in production)
  return 'unknown';
}

/**
 * Check if request is within rate limit
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  // If no entry or window expired, create new entry
  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt };
  }
  
  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(ip, entry);
  
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

/**
 * Create GitHub issue for content report
 */
async function createGitHubIssue(
  slug: string,
  type: string,
  locale: string,
  message: string,
  email?: string
): Promise<{ success: boolean; issueUrl?: string; error?: string }> {
  const ghToken = process.env.GH_TOKEN;
  const ghRepo = process.env.GH_REPO; // Format: owner/repo
  
  if (!ghToken || !ghRepo) {
    return { success: false, error: 'GitHub integration not configured' };
  }
  
  try {
    const title = `[Content Issue] ${type}/${slug} (${locale})`;
    const body = `## Content Issue Report

**Content Type:** ${type}
**Slug:** ${slug}
**Locale:** ${locale}
${email ? `**Reporter Email:** ${email}\n` : ''}

**Message:**
${message}

---
*This issue was automatically created from a content report.*`;

    const response = await fetch(`https://api.github.com/repos/${ghRepo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${ghToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['content-issue', 'user-report'],
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `GitHub API error: ${error}` };
    }
    
    const issue = await response.json();
    return { success: true, issueUrl: issue.html_url };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Report issue API endpoint
 * Accepts content issue reports with rate limiting and optional GitHub integration
 */

/**
 * GET handler - returns 405 Method Not Allowed
 * This endpoint only supports POST requests
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'This endpoint only accepts POST requests',
      allowedMethods: ['POST'],
    },
    {
      status: 405,
      headers: {
        'Allow': 'POST',
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          resetAt: new Date(rateLimit.resetAt).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { slug, type, locale, message, email, url } = body;
    
    // Validate required fields
    if (!slug || !type || !locale || !message) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'slug, type, locale, and message are required' },
        { status: 400 }
      );
    }
    
    // Validate type
    if (type !== 'condition' && type !== 'medication') {
      return NextResponse.json(
        { error: 'Invalid type', message: 'type must be "condition" or "medication"' },
        { status: 400 }
      );
    }
    
    // Validate locale
    if (locale !== 'en' && locale !== 'ar') {
      return NextResponse.json(
        { error: 'Invalid locale', message: 'locale must be "en" or "ar"' },
        { status: 400 }
      );
    }
    
    // Validate message length
    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message too short', message: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }
    
    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email', message: 'Email format is invalid' },
        { status: 400 }
      );
    }
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Content Issue Report:');
      console.log(`  Type: ${type}`);
      console.log(`  Slug: ${slug}`);
      console.log(`  Locale: ${locale}`);
      console.log(`  Email: ${email || 'not provided'}`);
      console.log(`  Message: ${message}`);
    }
    
    // Create issue report in Wagtail CMS if configured
    let cmsResult;
    // Derive CMS base URL consistently
    let cmsBase: string | undefined;
    if (process.env.CMS_API_BASE) {
      // Remove /api/v2 suffix if present
      cmsBase = process.env.CMS_API_BASE.replace(/\/api\/v2\/?$/, '');
    } else if (process.env.NEXT_PUBLIC_CMS_URL) {
      cmsBase = process.env.NEXT_PUBLIC_CMS_URL;
    }
    
    const issueReportToken = process.env.ISSUE_REPORT_TOKEN;
    
    if (cmsBase && issueReportToken) {
      try {
        const cmsUrl = `${cmsBase}/api/issue-reports`;
        const cmsResponse = await fetch(cmsUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-PSYCHPEDIA-TOKEN': issueReportToken,
          },
          body: JSON.stringify({
            pageType: type,
            slug,
            locale,
            message,
            email: email || undefined,
          }),
        });

        if (cmsResponse.ok) {
          cmsResult = await cmsResponse.json();
          console.log('[Report Issue] Created CMS entry:', cmsResult.id);
        } else {
          const errorText = await cmsResponse.text();
          console.warn('[Report Issue] CMS creation failed:', cmsResponse.status, errorText);
        }
      } catch (error) {
        // Don't fail the request if CMS is unavailable
        console.warn('[Report Issue] CMS error:', error instanceof Error ? error.message : String(error));
      }
    } else if (cmsBase && !issueReportToken) {
      console.warn('[Report Issue] CMS base URL configured but ISSUE_REPORT_TOKEN missing, skipping CMS submission');
    }

    // Create GitHub issue if configured
    let githubResult;
    if (process.env.NODE_ENV === 'production' && process.env.GH_TOKEN) {
      githubResult = await createGitHubIssue(slug, type, locale, message, email);
      
      if (githubResult.success) {
        return NextResponse.json({
          success: true,
          message: 'Issue reported successfully',
          issueUrl: githubResult.issueUrl,
        }, {
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        });
      } else {
        // Log error but don't fail the request
        console.error('GitHub issue creation failed:', githubResult.error);
      }
    }
    
    // In production without GitHub, or if GitHub fails, just log
    if (process.env.NODE_ENV === 'production') {
      console.log('Content Issue Report (logged):', {
        slug,
        type,
        locale,
        email: email || 'not provided',
        message,
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Issue reported successfully',
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetAt.toString(),
      },
    });
  } catch (error) {
    console.error('Report issue API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to process report' },
      { status: 500 }
    );
  }
}

