import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { CMS_PREVIEW_SECRET } from '@/lib/cms/config';

/**
 * Preview mode API endpoint
 * Enables draft content preview using Next.js draftMode
 * 
 * Usage: /api/preview?token=YOUR_PREVIEW_TOKEN
 * 
 * Requires CMS_PREVIEW_SECRET (or PREVIEW_TOKEN) environment variable
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  // Use centralized config - supports both old and new env var names
  const expectedToken = CMS_PREVIEW_SECRET;
  
  if (!expectedToken) {
    return new Response('Preview not configured', { status: 500 });
  }
  
  if (!token || token !== expectedToken) {
    return new Response('Invalid token', { status: 401 });
  }
  
  const draft = await draftMode();
  draft.enable();
  
  // Redirect to home page
  redirect('/');
}

