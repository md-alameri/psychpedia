import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Exit preview mode API endpoint
 * Disables draft content preview
 * 
 * Usage: /api/exit-preview
 */
export async function GET() {
  const draft = await draftMode();
  draft.disable();
  
  // Redirect to home page
  redirect('/');
}

