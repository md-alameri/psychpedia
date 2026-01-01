#!/usr/bin/env tsx
/**
 * API Hang Diagnostic Script
 * 
 * Tests API endpoints to diagnose hanging issues.
 * 
 * Usage:
 *   npm run diagnose:api
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3001';

interface TestResult {
  name: string;
  url: string;
  status: 'pass' | 'fail' | 'timeout';
  statusCode?: number;
  duration: number;
  error?: string;
  responseBody?: string;
}

const results: TestResult[] = [];

async function testEndpoint(name: string, path: string, options: RequestInit = {}): Promise<TestResult> {
  const url = `${BASE_URL}${path}`;
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    let responseBody = '';
    try {
      responseBody = await response.text();
    } catch (e) {
      // Ignore body read errors
    }
    
    return {
      name,
      url,
      status: response.ok ? 'pass' : 'fail',
      statusCode: response.status,
      duration,
      responseBody: responseBody.substring(0, 200), // First 200 chars
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        name,
        url,
        status: 'timeout',
        duration,
        error: 'Request timed out after 10 seconds',
      };
    }
    
    return {
      name,
      url,
      status: 'fail',
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  console.log('🔍 Diagnosing API Hang Issues\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('='.repeat(60) + '\n');

  // Test 1: Health endpoint (should work)
  console.log('Testing /api/health...');
  const healthResult = await testEndpoint('Health Check', '/api/health');
  results.push(healthResult);
  console.log(`  ${healthResult.status === 'pass' ? '✅' : '❌'} ${healthResult.status} (${healthResult.duration}ms)`);
  if (healthResult.statusCode) console.log(`  Status: ${healthResult.statusCode}`);
  if (healthResult.error) console.log(`  Error: ${healthResult.error}`);
  console.log();

  // Test 2: Payload boot test (isolates initialization)
  console.log('Testing /api/payload-boot-test...');
  const bootResult = await testEndpoint('Payload Boot Test', '/api/payload-boot-test');
  results.push(bootResult);
  console.log(`  ${bootResult.status === 'pass' ? '✅' : '❌'} ${bootResult.status} (${bootResult.duration}ms)`);
  if (bootResult.statusCode) console.log(`  Status: ${bootResult.statusCode}`);
  if (bootResult.error) console.log(`  Error: ${bootResult.error}`);
  if (bootResult.responseBody) {
    console.log(`  Response: ${bootResult.responseBody}`);
  }
  console.log();

  // Test 3: Users endpoint (the hanging one)
  console.log('Testing /api/users/me (with 10s timeout)...');
  const usersResult = await testEndpoint('Users Me', '/api/users/me');
  results.push(usersResult);
  console.log(`  ${usersResult.status === 'pass' ? '✅' : '❌'} ${usersResult.status} (${usersResult.duration}ms)`);
  if (usersResult.statusCode) console.log(`  Status: ${usersResult.statusCode}`);
  if (usersResult.error) console.log(`  Error: ${usersResult.error}`);
  if (usersResult.responseBody) {
    console.log(`  Response: ${usersResult.responseBody}`);
  }
  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('Summary:\n');
  
  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'timeout' ? '⏱️' : '❌';
    console.log(`${icon} ${result.name}: ${result.status} (${result.duration}ms)`);
    if (result.statusCode) {
      console.log(`   Status Code: ${result.statusCode}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n📝 Next Steps:');
  console.log('1. Check server logs for "[Payload API]" messages');
  console.log('2. If /api/payload-boot-test hangs: Check collection hooks/auth');
  console.log('3. If /api/payload-boot-test works but /api/users/me hangs: Check route handler');
  console.log('4. Check for route conflicts in app/api directory');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error instanceof Error ? error.message : error);
  process.exit(1);
});

