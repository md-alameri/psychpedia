# API Route Not Found Issue - "/api/" Error

**Date:** December 31, 2025  
**Status:** ⚠️ PARTIALLY RESOLVED  
**Severity:** High  
**Affects:** Admin UI (`/admin`)

**Update:** The `/api/` trailing slash issue is resolved, but admin UI is still showing 404 errors for `/api/config`, `/api/collections`, and `/api/globals` endpoints.

## Problem Description

When navigating to `http://localhost:3001/admin`, the browser console shows:

```json
{
  "message": "Route not found \"/api/\""
}
```

The admin UI fails to load properly, and API requests to `/api/` (with trailing slash) are not being handled correctly.

## Steps to Reproduce

1. Start the development server:
   ```bash
   cd psychpedia-landing-v2
   npm run dev
   ```

2. Navigate to `http://localhost:3001/admin` in a browser

3. Open browser DevTools Console (F12)

4. Observe the error:
   ```json
   {
     "message": "Route not found \"/api/\""
   }
   ```

## Current State

### Route Structure

- **Next.js API Routes** (working):
  - `app/api/health/route.ts` ✅
  - `app/api/search/route.ts` ✅
  - `app/api/waitlist/route.ts` ✅
  - `app/api/report-issue/route.ts` ✅
  - Other routes in `app/api/*` ✅

- **Payload API Routes** (issue):
  - `app/(payload)/api/[[...segments]]/route.ts` ⚠️
  - Should handle `/api/*` requests but `/api/` (trailing slash) fails

### Current Implementation

#### 1. Route Handler (`app/(payload)/api/[[...segments]]/route.ts`)

The route handler includes:
- Normalization of trailing slashes in pathname
- Root endpoint handling for `/api` and `/api/`
- Proper slug extraction from URL pathname

**Code snippet:**
```typescript
// Normalize pathname by removing trailing slashes
const normalizedPath = url.pathname.replace(/\/+$/, '');
let slug = params?.slug;
if (!slug || slug.length === 0) {
  const pathSegments = normalizedPath.split('/').filter(Boolean);
  if (pathSegments[0] === 'api') {
    slug = pathSegments.slice(1);
  }
}

// Handle root API endpoint (/api or /api/)
if (!slug || slug.length === 0) {
  return new Response(
    JSON.stringify({
      message: 'Payload CMS API',
      version: '3.x',
      endpoints: { ... }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
```

#### 2. Middleware (`middleware.ts`)

Created middleware to redirect `/api/` to `/api`:

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Normalize API routes: redirect /api/ to /api (remove trailing slash)
  if (pathname === '/api/') {
    return NextResponse.redirect(new URL('/api', request.url), 308);
  }
  
  return NextResponse.next();
}
```

## Testing Results

### Direct API Tests

```bash
# Test /api (no trailing slash) - WORKS ✅
$ curl http://localhost:3001/api
{"message":"Payload CMS API","version":"3.x","endpoints":{...}}

# Test /api/ (with trailing slash) - RETURNS "/api" as text ❌
$ curl http://localhost:3001/api/
/api

# Test /api/health - WORKS ✅
$ curl http://localhost:3001/api/health
{"status":"healthy","database":"connected",...}

# Test /api/users/me - WORKS ✅
$ curl http://localhost:3001/api/users/me
{"user":null,"message":"Account"}
```

### HTTP Response Analysis

```bash
$ curl -v http://localhost:3001/api/ 2>&1 | grep -E "(HTTP|Location)"
> GET /api/ HTTP/1.1
< HTTP/1.1 308 Permanent Redirect
```

**Observation:** Next.js is returning a `308 Permanent Redirect` for `/api/`, but the redirect target is not being handled correctly.

## Root Cause Analysis

### Hypothesis 1: Middleware Not Applied
- **Status:** ❓ Unknown
- **Reason:** Middleware changes require dev server restart
- **Action:** Verify middleware is being executed

### Hypothesis 2: Next.js Trailing Slash Handling
- **Status:** ✅ Confirmed
- **Reason:** Next.js has default trailing slash behavior that may conflict
- **Evidence:** `308 Permanent Redirect` response for `/api/`

### Hypothesis 3: Route Handler Not Reached
- **Status:** ❓ Unknown
- **Reason:** The route handler may not be matching `/api/` requests
- **Action:** Check server logs for `[Payload API]` messages

### Hypothesis 4: Client-Side Request Issue
- **Status:** ⚠️ Likely
- **Reason:** Payload admin UI may be making requests to `/api/` from client-side code
- **Action:** Check browser Network tab for actual request URLs

## Attempted Solutions

### ✅ Solution 1: Route Handler Normalization
- **Action:** Added pathname normalization to remove trailing slashes
- **Result:** Partial - works for `/api` but not `/api/`
- **File:** `app/(payload)/api/[[...segments]]/route.ts`

### ✅ Solution 2: Middleware Redirect
- **Action:** Created middleware to redirect `/api/` → `/api`
- **Result:** Unknown - requires server restart to test
- **File:** `middleware.ts`

## Next Steps to Debug

### 1. Verify Middleware Execution

Check if middleware is running:

```bash
# Add logging to middleware.ts
console.log('[Middleware] Processing:', pathname);
```

Then restart dev server and check logs when accessing `/admin`.

### 2. Check Server Logs

When accessing `/admin`, check for:
- `[Payload API]` log messages
- `[Middleware]` log messages
- Any error messages

### 3. Browser Network Tab Analysis

1. Open DevTools → Network tab
2. Navigate to `/admin`
3. Filter by "api"
4. Check:
   - Which requests are being made
   - Request URLs (exact paths)
   - Response status codes
   - Response bodies

### 4. Check Next.js Configuration

Verify `next.config.mjs` for trailing slash settings:

```javascript
const nextConfig = {
  trailingSlash: false, // or true, check current setting
  // ...
};
```

### 5. Test Route Matching

Add explicit logging to route handler:

```typescript
console.log('[Route Handler] Pathname:', url.pathname);
console.log('[Route Handler] Normalized:', normalizedPath);
console.log('[Route Handler] Slug:', slug);
console.log('[Route Handler] Params:', params);
```

### 6. Check Payload Admin Configuration

Verify Payload's admin configuration in `payload.config.ts`:

```typescript
admin: {
  user: Users.slug,
  // Check if there's a basePath or route configuration
}
```

## Expected Behavior

When accessing `/admin`:

1. ✅ Admin UI should load without errors
2. ✅ API requests should succeed (200 status)
3. ✅ No "Route not found" errors in console
4. ✅ All Payload API endpoints should be accessible

## Solution (Implemented)

### Root Cause
Next.js was intercepting `/api/` requests and issuing a built-in 308 "remove trailing slash" redirect before the Payload catch-all route handler could respond. This caused the "Route not found '/api/'" error in the admin UI.

### Implementation

#### 1. Disabled Next.js Automatic Trailing Slash Redirects

**File:** `next.config.mjs`

Added experimental flags to disable Next.js's automatic trailing slash redirects:

```javascript
experimental: {
  turbo: {
    root: __dirname,
  },
  // Disable Next.js automatic trailing slash redirects
  // This allows our route handler to process /api/ requests directly
  skipTrailingSlashRedirect: true,
  // Help with full URL normalization control in middleware/handlers
  skipMiddlewareUrlNormalize: true,
}
```

- `skipTrailingSlashRedirect: true` - Stops Next.js from issuing automatic 308 redirects
- `skipMiddlewareUrlNormalize: true` - Helps with full URL normalization control

#### 2. Configured Payload CMS Routes Explicitly

**File:** `payload.config.ts`

Added explicit routes configuration to ensure no trailing slashes:

```typescript
// Ensure serverURL doesn't have trailing slash
const serverURL = process.env.PAYLOAD_PUBLIC_SERVER_URL!.replace(/\/+$/, '');

const config = buildConfig({
  serverURL,
  // Explicitly configure routes without trailing slashes
  routes: {
    api: '/api',
    admin: '/admin',
  },
  // ...
});
```

This ensures:
- `routes.api` is set to `/api` (not `/api/`)
- `routes.admin` is set to `/admin` (not `/admin/`)
- `serverURL` doesn't end with a slash

#### 3. Updated Middleware to Use Rewrite

**File:** `middleware.ts`

Changed from redirect (308) to rewrite for `/api/`:

```typescript
if (pathname === '/api/') {
  const url = request.nextUrl.clone();
  url.pathname = '/api';
  return NextResponse.rewrite(url);
}
```

This maps `/api/` to `/api` internally without changing the URL and without any 308 redirects. This only works reliably after disabling Next.js's own redirect.

### Verification Steps

After implementing the solution:

1. **Restart dev server** (required for config changes):
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test `/api/` endpoint**:
   ```bash
   curl -i http://localhost:3001/api/
   ```
   **Expected:** HTTP/1.1 200 (not 308)

3. **Check browser Network tab**:
   - Navigate to `/admin`
   - Filter by "api"
   - `/api/` requests should return 200 JSON (not 308 redirect)

4. **Verify server logs**:
   - Should see `[Payload API] GET /api/ - Handler invoked` log
   - This confirms the route handler is being reached

5. **Test admin UI**:
   - Navigate to `http://localhost:3001/admin`
   - Should load without "Route not found" errors
   - Console should be clean

### Expected Results

- ✅ `/api/` requests reach the route handler (no 308 redirect)
- ✅ Admin UI loads without "Route not found" errors
- ✅ Both `/api` and `/api/` return the same JSON response
- ✅ No trailing slash redirects in browser Network tab
- ✅ Server logs show route handler invocations for `/api/`

## Workaround (No Longer Needed)

~~**Temporary workaround:** Access admin UI and manually fix any client-side requests that use `/api/` with trailing slash.~~

**Note:** This issue has been resolved with the above solution.

## Related Files

- `app/(payload)/api/[[...segments]]/route.ts` - Payload API route handler
- `middleware.ts` - Next.js middleware for route normalization
- `payload.config.ts` - Payload CMS configuration
- `next.config.mjs` - Next.js configuration

## Related Issues

- Previous issue: `/api/users/me` hanging (resolved)
- Previous issue: Admin UI loading slowly (partially resolved)
- ~~Current issue: `/api/` route not found~~ (✅ **RESOLVED** - see Solution section above)

## Environment

- **Next.js Version:** 16.1.1
- **Payload CMS Version:** 3.69.0
- **Node Version:** (check with `node --version`)
- **OS:** macOS (darwin 25.2.0)
- **Database:** PostgreSQL 16.11 (Docker container `psychpedia-db`)

## Additional Notes

- The error message format `{"message": "Route not found \"/api/\""}` suggests this is coming from Payload CMS itself, not Next.js
- The error appears in the browser console, indicating it's a client-side issue
- Direct curl tests show `/api` works but `/api/` returns unexpected response
- Middleware was created but may not be executing (requires server restart)

## Current Status (Post-Fix)

### ✅ Fixed
- `/api/` endpoint now returns 200 OK (verified with curl)
- Trailing slash redirect issue resolved
- Middleware rewrite working correctly

### ⚠️ Remaining Issues

**Critical Finding from Server Logs:**

When accessing `/admin`, the server logs show:
```
[Payload Admin] GET /admin - Handler invoked
[Payload Admin] GET /admin - Slug: []
[Payload Admin] GET /admin - Calling Payload handler
[Payload Admin] GET /admin - Response status: 404
[Payload Admin] GET /admin - 404 response body: {"message":"Route not found \"/api/\""}
```

**Key Observations:**
1. ✅ Admin route handler is being invoked
2. ✅ Slug extraction is working (empty slug for `/admin`)
3. ❌ Payload handler returns 404 with "Route not found '/api/'"
4. ❌ **No `[Payload API]` logs appear** - This means Payload's internal request to `/api/` is NOT reaching our API route handler

**Root Cause Hypothesis:**

Payload's admin handler is making an **internal request** to `/api/` to fetch configuration, but this request is:
- Not going through Next.js routing (no `[Payload API]` logs)
- Failing with "Route not found '/api/'"
- Possibly using Payload's internal API client which bypasses Next.js routes

**Possible Causes:**
1. **Payload Internal API Client**: Payload might be using its own internal API client that doesn't go through Next.js routes
2. **URL Construction**: Payload might be constructing the URL incorrectly using `serverURL`
3. **Circular Dependency**: Admin handler needs API handler, but API handler isn't accessible internally
4. **Payload 3.x Changes**: Internal request mechanism might have changed in Payload 3.x

**Next Steps:**
1. ✅ Check server logs - **DONE**: No `[Payload API]` logs for internal requests
2. Check Payload 3.x documentation for internal API request mechanism
3. Verify `serverURL` configuration is correct
4. Check if Payload needs special configuration for internal requests
5. Consider if we need to handle internal requests differently

## Debugging Checklist

- [x] Restart dev server after middleware creation
- [x] Check browser Network tab for actual request URLs
- [x] Verify middleware is executing (add logging)
- [x] Check server logs for route handler invocations
- [x] Disable Next.js trailing slash redirects via experimental flags
- [x] Check Payload admin configuration for routes
- [x] Verify route file location and naming
- [ ] Test with different browsers (Chrome, Firefox, Safari) - Recommended for final verification

