import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { CMS_REVALIDATE_SECRET } from '@/lib/cms/config';
import { getPageById } from '@/lib/cms/api';

/**
 * Revalidation webhook endpoint for Wagtail CMS
 * 
 * Supports two authentication methods:
 * 1. Query parameter: ?secret=...
 * 2. Header: X-REVALIDATE-SECRET
 * 
 * Supports multiple payload formats:
 * 1. Simple paths: { paths: ["/x", "/y"] }
 * 2. Page ID: { page_id: 123 }
 * 3. Slug + Locale: { slug: "my-page", locale: "en" }
 * 4. Old format: { type: "condition", slug: "depression", locale: "en" }
 * 5. New format: { page_id: 123, slug: "my-page", paths: ["/en/my-page"] }
 */
export async function POST(request: NextRequest) {
  try {
    // Get secret from query param or header (prefer header for security)
    const secretFromQuery = request.nextUrl.searchParams.get('secret');
    const secretFromHeader = request.headers.get('X-REVALIDATE-SECRET');
    const secret = secretFromHeader || secretFromQuery;

    // Get expected secret (supports both old and new env var names via config)
    const expectedSecret = CMS_REVALIDATE_SECRET;

    // Debug: Check if secret exists (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Revalidate] Secret check:', {
        hasSecret: !!expectedSecret,
        secretLength: expectedSecret?.length || 0,
        envVars: {
          CMS_REVALIDATE_SECRET: !!process.env.CMS_REVALIDATE_SECRET,
          REVALIDATE_SECRET: !!process.env.REVALIDATE_SECRET,
        },
      });
    }

    if (!expectedSecret) {
      return NextResponse.json(
        { 
          error: 'Revalidation not configured',
          // Only show debug info in development
          ...(process.env.NODE_ENV === 'development' && {
            debug: {
              CMS_REVALIDATE_SECRET_set: !!process.env.CMS_REVALIDATE_SECRET,
              REVALIDATE_SECRET_set: !!process.env.REVALIDATE_SECRET,
            },
          }),
        },
        { status: 500 }
      );
    }

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const revalidatedPaths: string[] = [];
    const errors: string[] = [];

    // Format 1: Simple paths array { paths: ["/x", "/y"] }
    if ('paths' in body && Array.isArray(body.paths) && !('page_id' in body)) {
      const { paths } = body;

      for (const path of paths) {
        if (typeof path === 'string') {
          // Normalize path (ensure it starts with /)
          const normalizedPath = path.startsWith('/') ? path : `/${path}`;
          try {
            revalidatePath(normalizedPath);
            revalidatedPaths.push(normalizedPath);
          } catch (error) {
            const errorMsg = `Failed to revalidate ${normalizedPath}`;
            errors.push(errorMsg);
            if (process.env.NODE_ENV === 'development') {
              console.error(`[Revalidate] ${errorMsg}:`, error);
            }
          }
        }
      }

      // Also revalidate sitemap
      revalidatePath('/sitemap.xml');
      revalidatedPaths.push('/sitemap.xml');

      return NextResponse.json({
        revalidated: true,
        format: 'paths',
        paths: revalidatedPaths,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      });
    }

    // Format 2: Page ID only { page_id: 123 }
    if ('page_id' in body && !('paths' in body) && !('slug' in body)) {
      const { page_id } = body;

      try {
        const page = await getPageById(page_id);
        if (!page) {
          return NextResponse.json(
            { error: `Page with ID ${page_id} not found` },
            { status: 404 }
          );
        }

        // Determine paths from page metadata
        const pathsToRevalidate: string[] = [];

        // Use html_url if available
        if (page.meta?.html_url) {
          try {
            const url = new URL(page.meta.html_url);
            pathsToRevalidate.push(url.pathname);
          } catch {
            // Invalid URL, skip
          }
        }

        // Use url_path if available
        if (page.url_path) {
          const path = page.url_path.startsWith('/') ? page.url_path : `/${page.url_path}`;
          if (!pathsToRevalidate.includes(path)) {
            pathsToRevalidate.push(path);
          }
        }

        // Fallback to slug-based path construction
        if (pathsToRevalidate.length === 0 && page.meta?.slug) {
          // Try common locale prefixes
          for (const locale of ['en', 'ar']) {
            pathsToRevalidate.push(`/${locale}/${page.meta.slug}`);
          }
        }

        // Revalidate all determined paths
        for (const path of pathsToRevalidate) {
          try {
            revalidatePath(path);
            revalidatedPaths.push(path);
          } catch (error) {
            errors.push(`Failed to revalidate ${path}`);
          }
        }

        // Also revalidate sitemap
        revalidatePath('/sitemap.xml');
        revalidatedPaths.push('/sitemap.xml');

        return NextResponse.json({
          revalidated: true,
          format: 'page_id',
          page_id,
          paths: revalidatedPaths,
          errors: errors.length > 0 ? errors : undefined,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return NextResponse.json(
          {
            error: `Failed to fetch page ${page_id}`,
            details: process.env.NODE_ENV === 'development' && error instanceof Error
              ? error.message
              : undefined,
          },
          { status: 500 }
        );
      }
    }

    // Format 3: Slug + Locale { slug: "my-page", locale: "en" }
    if ('slug' in body && 'locale' in body && !('type' in body) && !('page_id' in body)) {
      const { slug, locale } = body;

      if (typeof slug !== 'string' || typeof locale !== 'string') {
        return NextResponse.json(
          { error: 'slug and locale must be strings' },
          { status: 400 }
        );
      }

      const path = `/${locale}/${slug}`;
      revalidatePath(path);
      revalidatedPaths.push(path);

      // Also revalidate sitemap
      revalidatePath('/sitemap.xml');
      revalidatedPaths.push('/sitemap.xml');

      return NextResponse.json({
        revalidated: true,
        format: 'slug_locale',
        slug,
        locale,
        paths: revalidatedPaths,
        timestamp: new Date().toISOString(),
      });
    }

    // Format 4: New format with page_id and paths { page_id: 123, slug: "my-page", paths: ["/en/my-page"] }
    if ('paths' in body && Array.isArray(body.paths) && 'page_id' in body) {
      const { paths, page_id, slug } = body;

      for (const path of paths) {
        if (typeof path === 'string') {
          const normalizedPath = path.startsWith('/') ? path : `/${path}`;
          try {
            revalidatePath(normalizedPath);
            revalidatedPaths.push(normalizedPath);
          } catch (error) {
            errors.push(`Failed to revalidate ${normalizedPath}`);
          }
        }
      }

      // Also revalidate sitemap
      revalidatePath('/sitemap.xml');
      revalidatedPaths.push('/sitemap.xml');

      return NextResponse.json({
        revalidated: true,
        format: 'new',
        page_id,
        slug,
        paths: revalidatedPaths,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      });
    }

    // Format 5: Old format { type: "condition", slug: "depression", locale: "en" }
    if ('type' in body && 'slug' in body && 'locale' in body) {
      const { type, slug, locale } = body;

      // Revalidate specific paths based on type
      if (type === 'condition') {
        revalidatePath(`/${locale}/conditions/${slug}`);
        revalidatedPaths.push(`/${locale}/conditions/${slug}`);
        revalidatePath(`/${locale}/conditions`); // Also revalidate index
        revalidatedPaths.push(`/${locale}/conditions`);
      } else if (type === 'medication') {
        revalidatePath(`/${locale}/medications/${slug}`);
        revalidatedPaths.push(`/${locale}/medications/${slug}`);
        revalidatePath(`/${locale}/medications`); // Also revalidate index
        revalidatedPaths.push(`/${locale}/medications`);
      } else if (type === 'governance') {
        revalidatePath(`/${locale}/${slug}`);
        revalidatedPaths.push(`/${locale}/${slug}`);
      } else {
        return NextResponse.json(
          { error: `Invalid type: ${type}` },
          { status: 400 }
        );
      }

      // Also revalidate sitemap
      revalidatePath('/sitemap.xml');
      revalidatedPaths.push('/sitemap.xml');

      return NextResponse.json({
        revalidated: true,
        format: 'old',
        type,
        slug,
        locale,
        paths: revalidatedPaths,
        timestamp: new Date().toISOString(),
      });
    }

    // Unknown format
    return NextResponse.json(
      {
        error: 'Invalid payload format',
        expected: [
          '{ paths: string[] }',
          '{ page_id: number }',
          '{ slug: string, locale: string }',
          '{ type: string, slug: string, locale: string }',
          '{ page_id: number, slug: string, paths: string[] }',
        ],
      },
      { status: 400 }
    );
  } catch (error) {
    // Don't expose internal errors in production
    const errorMessage =
      process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : 'Internal server error';

    console.error('[Revalidate] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
