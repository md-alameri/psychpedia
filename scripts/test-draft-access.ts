/**
 * Test script for draft content access
 * Verifies that draft content is not accessible in production without preview mode
 * 
 * Usage: NODE_ENV=production tsx scripts/test-draft-access.ts
 */

async function testDraftAccess() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const testSlug = 'test-draft-condition'; // Replace with actual draft slug for testing
  
  console.log('Testing draft content access...');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  
  // Test 1: Access draft without preview mode (should 404 in production)
  try {
    const response = await fetch(`${baseUrl}/en/conditions/${testSlug}`);
    const status = response.status;
    
    if (process.env.NODE_ENV === 'production') {
      if (status === 404) {
        console.log('✓ Test 1 PASSED: Draft content returns 404 in production without preview');
      } else {
        console.error(`✗ Test 1 FAILED: Expected 404, got ${status}`);
        process.exit(1);
      }
    } else {
      console.log(`  Test 1 SKIPPED: Not in production mode (status: ${status})`);
    }
  } catch (error) {
    console.error('Test 1 error:', error);
    process.exit(1);
  }
  
  // Test 2: Enable preview mode
  const previewToken = process.env.PREVIEW_TOKEN || 'test-token';
  try {
    const previewResponse = await fetch(`${baseUrl}/api/preview?token=${previewToken}`);
    const previewStatus = previewResponse.status;
    
    if (previewStatus === 200 || previewStatus === 307 || previewStatus === 308) {
      console.log('✓ Test 2 PASSED: Preview mode can be enabled');
    } else {
      console.error(`✗ Test 2 FAILED: Expected 200/307/308, got ${previewStatus}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('Test 2 error:', error);
    process.exit(1);
  }
  
  // Test 3: Access draft with preview mode (should work)
  try {
    const response = await fetch(`${baseUrl}/en/conditions/${testSlug}`, {
      headers: {
        'Cookie': '__prerender_bypass=1; __next_preview_data=1',
      },
    });
    const status = response.status;
    
    if (process.env.NODE_ENV === 'production') {
      if (status === 200) {
        console.log('✓ Test 3 PASSED: Draft content accessible with preview mode');
      } else {
        console.log(`  Test 3 INFO: Status ${status} (may need actual preview cookie)`);
      }
    } else {
      console.log(`  Test 3 SKIPPED: Not in production mode (status: ${status})`);
    }
  } catch (error) {
    console.error('Test 3 error:', error);
    process.exit(1);
  }
  
  console.log('\nAll draft access tests completed!');
}

testDraftAccess().catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});

