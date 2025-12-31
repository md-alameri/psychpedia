/**
 * Test script for admin route protection
 * Verifies that /admin/content-health is not accessible in production
 * 
 * Usage: NODE_ENV=production tsx scripts/test-admin-access.ts
 */

async function testAdminAccess() {
  const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
  
  console.log('Testing admin route protection...');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  
  // Test 1: Access admin route in production (should 404)
  try {
    const response = await fetch(`${baseUrl}/en/admin/content-health`);
    const status = response.status;
    
    if (process.env.NODE_ENV === 'production') {
      if (status === 404) {
        console.log('✓ Test 1 PASSED: Admin route returns 404 in production');
      } else {
        console.error(`✗ Test 1 FAILED: Expected 404, got ${status}`);
        process.exit(1);
      }
    } else {
      if (status === 200) {
        console.log('✓ Test 1 PASSED: Admin route accessible in development');
      } else {
        console.log(`  Test 1 INFO: Status ${status} (may be expected)`);
      }
    }
  } catch (error) {
    console.error('Test 1 error:', error);
    process.exit(1);
  }
  
  // Test 2: Test Arabic locale
  try {
    const response = await fetch(`${baseUrl}/ar/admin/content-health`);
    const status = response.status;
    
    if (process.env.NODE_ENV === 'production') {
      if (status === 404) {
        console.log('✓ Test 2 PASSED: Admin route (AR) returns 404 in production');
      } else {
        console.error(`✗ Test 2 FAILED: Expected 404, got ${status}`);
        process.exit(1);
      }
    } else {
      console.log(`  Test 2 INFO: Status ${status} (development mode)`);
    }
  } catch (error) {
    console.error('Test 2 error:', error);
    process.exit(1);
  }
  
  console.log('\nAll admin access tests completed!');
}

testAdminAccess().catch((error) => {
  console.error('Test script error:', error);
  process.exit(1);
});

