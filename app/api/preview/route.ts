import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Preview mode API endpoint
 * Enables draft content preview using Next.js draftMode
 * 
 * Usage: /api/preview?token=YOUR_PREVIEW_TOKEN
 * 
 * Requires PREVIEW_TOKEN environment variable
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  if (!token || token !== process.env.PREVIEW_TOKEN) {
    return new Response('Invalid token', { status: 401 });
  }
  
  const draft = await draftMode();
  draft.enable();
  
  // Redirect to home page
  redirect('/');
}

