import { NextRequest, NextResponse } from 'next/server';

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length > 254) {
      return NextResponse.json(
        { success: false, message: 'Email address is too long.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // TODO: Save to database or external service
    // For now, we'll return success
    // You can integrate with your existing backend here:
    // - Connect to your database
    // - Call your existing API
    // - Or proxy to the CGI script if available
    
    // Example: If you want to proxy to existing CGI backend
    // const cgiResponse = await fetch('https://your-domain.com/cgi-bin/waitlist.py', {
    //   method: 'POST',
    //   body: formData,
    // });
    // return NextResponse.json(await cgiResponse.json());

    // For now, return success (replace with actual storage logic)
    console.log('Waitlist submission:', trimmedEmail);

    return NextResponse.json({
      success: true,
      message: "Thank you! You've been added to the waitlist."
    });
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle CORS for direct form submissions if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

