#!/usr/bin/env tsx
/**
 * Setup Verification Script
 * 
 * Verifies the production-grade database setup end-to-end.
 * 
 * Usage:
 *   npm run verify:setup
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Payload CMS removed - this script is deprecated
// Keeping for reference but most checks are no longer applicable

interface VerificationResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

const results: VerificationResult[] = [];

async function verify(name: string, fn: () => Promise<boolean> | boolean): Promise<void> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    results.push({
      name,
      status: result ? 'pass' : 'fail',
      message: result ? 'Passed' : 'Failed',
      duration,
    });
  } catch (error) {
    const duration = Date.now() - start;
    results.push({
      name,
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });
  }
}

async function main() {
  console.log('🔍 Verifying Production-Grade Database Setup\n');
  console.log('='.repeat(60) + '\n');

  // Payload CMS has been removed - this script is deprecated
  results.push({
    name: 'Setup Verification',
    status: 'skip',
    message: 'Payload CMS removed - this script is deprecated',
  });

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('Verification Results:\n');

  let passCount = 0;
  let failCount = 0;
  let skipCount = 0;

  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️ ';
    const status = result.status.toUpperCase().padEnd(6);
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${status} - ${result.name}${duration}`);
    if (result.status === 'fail') {
      console.log(`   Error: ${result.message}`);
    } else if (result.status === 'skip') {
      console.log(`   ${result.message}`);
    }

    if (result.status === 'pass') passCount++;
    else if (result.status === 'fail') failCount++;
    else skipCount++;
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Summary: ${passCount} passed, ${failCount} failed, ${skipCount} skipped\n`);

  if (failCount > 0) {
    console.log('❌ Verification failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('✅ All verifications passed!');
    console.log('\n📝 Next steps:');
    console.log('   - Test API endpoints: curl http://localhost:3001/api/users/me');
    console.log('   - Test health endpoint: curl http://localhost:3001/api/health');
    console.log('   - Load /admin in browser and verify no infinite spinner');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
  process.exit(1);
});

