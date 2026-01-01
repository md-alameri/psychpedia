# API Hang Diagnosis Report

**Date:** January 2025  
**Issue:** `/api/users/me` hangs, causing `/admin` to spin

## Changes Made

### 1. Enhanced Route Handler (`app/(payload)/api/[[...segments]]/route.ts`)

**Status:** ✅ COMPLETED

**Changes:**
- ✅ Added `runtime = 'nodejs'` and `dynamic = 'force-dynamic'` (already present)
- ✅ Added all HTTP methods: GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD
- ✅ Added comprehensive logging to track request flow:
  - Module load log: `[Payload API] Route handler module loaded`
  - Request log: `[Payload API] {METHOD} {path} - Handler invoked`
  - Handler call log: `[Payload API] {METHOD} {path} - Calling Payload handler`
  - Response log: `[Payload API] {METHOD} {path} - Response status: {status}`
  - Error log: `[Payload API] {METHOD} {path} - Error: {error}`

**Code:**
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

console.log('[Payload API] Route handler module loaded');

// ... handler code with logging ...

export const GET = apiHandler(REST_GET(configPromise));
export const POST = apiHandler(REST_POST(configPromise));
export const DELETE = apiHandler(REST_DELETE(configPromise));
export const PATCH = apiHandler(REST_PATCH(configPromise));
export const PUT = apiHandler(REST_PUT(configPromise));
export const OPTIONS = ...;
export const HEAD = ...;
```

### 2. Route Conflict Search

**Status:** ✅ COMPLETED - No conflicts found

**Findings:**
- ✅ No `app/api/users*` routes found
- ✅ No `pages/api/users*` routes found
- ✅ No middleware rewrites affecting `/api/*`
- ✅ Route structure is correct:
  - `app/api/*` - Next.js API routes (health, search, etc.)
  - `app/(payload)/api/[[...segments]]/route.ts` - Payload API routes (catches all other `/api/*`)

**Route Structure:**
```
app/
├── api/
│   ├── health/route.ts          ✅ Next.js route
│   ├── search/route.ts          ✅ Next.js route
│   ├── payload-boot-test/route.ts  ✅ Test route
│   └── ... (other Next.js routes)
└── (payload)/
    └── api/
        └── [[...segments]]/route.ts  ✅ Payload catch-all
```

### 3. Payload Boot Test Route

**Status:** ✅ COMPLETED

**Created:** `app/api/payload-boot-test/route.ts`

**Purpose:** Isolates Payload initialization to identify if the issue is:
- Payload initialization itself
- Specific collection hooks/auth
- Route handler setup

**What it does:**
1. Resolves config promise
2. Initializes Payload instance
3. Gets collections list
4. Returns timing information and collection names

**Usage:**
```bash
curl http://localhost:3001/api/payload-boot-test
```

**Expected Response:**
```json
{
  "status": "success",
  "timing": {
    "config": 123,
    "payload": 456,
    "collections": 12,
    "total": 591
  },
  "collections": ["users", "conditions", ...],
  "collectionCount": 8
}
```

### 4. Diagnostic Script

**Status:** ✅ COMPLETED

**Created:** `scripts/diagnose-api-hang.ts`

**Usage:**
```bash
npm run diagnose:api
```

**What it tests:**
1. `/api/health` - Should work (baseline)
2. `/api/payload-boot-test` - Isolates Payload initialization
3. `/api/users/me` - The hanging endpoint (with 10s timeout)

## Testing Instructions

### Step 1: Start Dev Server

```bash
cd psychpedia-landing-v2
npm run dev
```

### Step 2: Check Server Logs

Look for these log messages when making requests:

1. **Module load:**
   ```
   [Payload API] Route handler module loaded
   ```

2. **Request received:**
   ```
   [Payload API] GET /api/users/me - Handler invoked
   ```

3. **Handler called:**
   ```
   [Payload API] GET /api/users/me - Calling Payload handler
   ```

4. **Response sent:**
   ```
   [Payload API] GET /api/users/me - Response status: 200
   ```

### Step 3: Test Endpoints

#### Test 1: Health Endpoint (Baseline)
```bash
curl -v http://localhost:3001/api/health
```
**Expected:** ✅ 200 OK, responds quickly

#### Test 2: Payload Boot Test
```bash
curl -v http://localhost:3001/api/payload-boot-test
```
**Expected:** 
- ✅ If works: Returns collections list, timing info
- ❌ If hangs: Issue is in Payload initialization or collection hooks

#### Test 3: Users Endpoint (The Problem)
```bash
curl -v --max-time 10 http://localhost:3001/api/users/me
```
**Expected:**
- ✅ If works: Returns user data or 401/403
- ❌ If hangs: Check logs to see where it stops

### Step 4: Run Diagnostic Script

```bash
npm run diagnose:api
```

This will test all three endpoints and provide a summary.

## Diagnostic Flow

### If `/api/payload-boot-test` Hangs:

**Possible causes:**
1. Payload initialization deadlock
2. Collection hook causing infinite loop
3. Database connection issue

**Next steps:**
1. Check which collection is causing the issue:
   - Temporarily disable Users collection hooks/auth
   - Re-enable incrementally to isolate the problem
2. Check database connection:
   ```bash
   npm run db:health
   ```
3. Check Payload initialization logs

### If `/api/payload-boot-test` Works but `/api/users/me` Hangs:

**Possible causes:**
1. Route handler setup issue
2. Authentication middleware hanging
3. Specific endpoint logic issue

**Next steps:**
1. Check if `[Payload API]` logs appear for `/api/users/me`
2. If logs don't appear: Route handler not being called (routing issue)
3. If logs appear but no response: Handler is hanging (Payload issue)

### If No Logs Appear:

**Possible causes:**
1. Route not matching
2. Middleware intercepting
3. Next.js routing issue

**Next steps:**
1. Verify route file location: `app/(payload)/api/[[...segments]]/route.ts`
2. Check Next.js routing: Ensure catch-all route is correct
3. Check for conflicting routes

## Expected Log Output

When `/api/users/me` is called, you should see:

```
[Payload API] Route handler module loaded
[Payload API] GET /api/users/me - Handler invoked
[Payload API] GET /api/users/me - Calling Payload handler
[Payload] Initializing Payload instance...
[Payload] ✅ Payload instance initialized successfully
[Payload API] GET /api/users/me - Response status: 200
```

If logs stop at a specific point, that's where the hang occurs.

## Files Modified

1. ✅ `app/(payload)/api/[[...segments]]/route.ts` - Enhanced with logging and all HTTP methods
2. ✅ `app/api/payload-boot-test/route.ts` - New test route
3. ✅ `scripts/diagnose-api-hang.ts` - New diagnostic script
4. ✅ `package.json` - Added `diagnose:api` script

## Next Steps

1. **Start dev server and test:**
   ```bash
   npm run dev
   ```

2. **In another terminal, run diagnostics:**
   ```bash
   npm run diagnose:api
   ```

3. **Check server logs for `[Payload API]` messages**

4. **Report findings:**
   - Does `[Payload API]` log appear for `/api/users/me`?
   - What is the result of `/api/payload-boot-test`?
   - Are there any conflicting routes?
   - Where do the logs stop (if hanging)?

## Troubleshooting Checklist

- [ ] Dev server is running on port 3001
- [ ] Database is accessible (`npm run db:health`)
- [ ] Environment variables are set (`npm run db:validate-env`)
- [ ] No conflicting routes in `app/api/users*`
- [ ] Route handler logs appear in console
- [ ] `/api/health` works
- [ ] `/api/payload-boot-test` works or hangs (report which)
- [ ] `/api/users/me` works or hangs (report which)

---

**Report Generated:** January 2025  
**Status:** Ready for Testing

