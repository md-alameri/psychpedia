import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Validate secret
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.REVALIDATE_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Revalidation not configured' },
        { status: 500 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { type, slug, locale } = body;

    if (!type || !slug || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: type, slug, locale' },
        { status: 400 }
      );
    }

    // Revalidate specific paths based on type
    if (type === 'condition') {
      revalidatePath(`/${locale}/conditions/${slug}`);
      revalidatePath(`/${locale}/conditions`); // Also revalidate index
    } else if (type === 'medication') {
      revalidatePath(`/${locale}/medications/${slug}`);
      revalidatePath(`/${locale}/medications`); // Also revalidate index
    } else if (type === 'governance') {
      revalidatePath(`/${locale}/${slug}`);
    } else {
      return NextResponse.json(
        { error: `Invalid type: ${type}` },
        { status: 400 }
      );
    }

    // Also revalidate sitemap
    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      revalidated: true,
      type,
      slug,
      locale,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

