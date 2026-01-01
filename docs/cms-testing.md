# How to Test Wagtail CMS Integration Locally

This guide provides step-by-step instructions for testing the Next.js ↔ Wagtail CMS integration in your local development environment.

## Prerequisites

1. **Wagtail CMS running locally**
   - Default: `http://localhost:8000`
   - Or configure `CMS_BASE_URL` in `.env.local`

2. **Next.js app running locally**
   - Default: `http://localhost:3001`
   - Started with `npm run dev`

3. **Environment variables configured**
   - See [env-cms.md](./env-cms.md) for required variables
   - Create `.env.local` with your CMS configuration

## Step 1: Verify CMS API Connection

### Test 1: Check CMS API is accessible

```bash
# Test basic API connectivity
curl http://localhost:8000/api/v2/pages/

# Expected: JSON response with pages list
```

### Test 2: Fetch a specific page

```bash
# Get a page by slug
curl "http://localhost:8000/api/v2/pages/?slug=your-page-slug&fields=*"

# Expected: JSON response with page data
```

### Test 3: Test from Next.js

Create a test script or use the browser console:

```typescript
// In Next.js app
import { getPageBySlug } from '@/lib/cms/api';

const page = await getPageBySlug('your-page-slug');
console.log('Page:', page);
```

## Step 2: Test Page Resolution

### Test Path-Based Resolution

The catch-all route uses path-based resolution first, then falls back to slug.

1. **Create a test page in Wagtail:**
   - Slug: `test-page`
   - URL path: `/en/test-page` (or your locale)

2. **Access the page in Next.js:**
   ```
   http://localhost:3001/en/test-page
   ```

3. **Verify it loads:**
   - Should display the page content
   - Check browser console for any errors
   - Verify metadata (title, description) is correct

### Test Nested Paths

1. **Create a nested page in Wagtail:**
   - Slug: `nested-page`
   - Parent: `test-page`
   - Full path: `/en/test-page/nested-page`

2. **Access the nested page:**
   ```
   http://localhost:3001/en/test-page/nested-page
   ```

3. **Verify path-based resolution works:**
   - Should resolve correctly using `url_path` or `html_url`
   - Should not fall back to slug resolution

### Test Homepage

1. **Access homepage:**
   ```
   http://localhost:3001/en
   ```

2. **Verify it handles empty slug:**
   - Should attempt path-based resolution for `/en`
   - Should gracefully handle if no homepage is found

## Step 3: Test Revalidation Endpoint

### Test 1: Simple Paths Format

```bash
curl -X POST http://localhost:3001/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{
    "paths": [
      "/en/test-page",
      "/ar/test-page"
    ]
  }'
```

**Expected response:**
```json
{
  "revalidated": true,
  "format": "paths",
  "paths": [
    "/en/test-page",
    "/ar/test-page",
    "/sitemap.xml"
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Test 2: Page ID Format

```bash
curl -X POST http://localhost:3001/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{
    "page_id": 123
  }'
```

**Expected response:**
```json
{
  "revalidated": true,
  "format": "page_id",
  "page_id": 123,
  "paths": [
    "/en/test-page",
    "/sitemap.xml"
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Test 3: Slug + Locale Format

```bash
curl -X POST http://localhost:3001/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-page",
    "locale": "en"
  }'
```

**Expected response:**
```json
{
  "revalidated": true,
  "format": "slug_locale",
  "slug": "test-page",
  "locale": "en",
  "paths": [
    "/en/test-page",
    "/sitemap.xml"
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Test 4: Old Format (Type + Slug + Locale)

```bash
curl -X POST http://localhost:3001/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{
    "type": "condition",
    "slug": "depression",
    "locale": "en"
  }'
```

**Expected response:**
```json
{
  "revalidated": true,
  "format": "old",
  "type": "condition",
  "slug": "depression",
  "locale": "en",
  "paths": [
    "/en/conditions/depression",
    "/en/conditions",
    "/sitemap.xml"
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Test 5: Header Authentication

```bash
curl -X POST http://localhost:3001/api/revalidate \
  -H "Content-Type: application/json" \
  -H "X-REVALIDATE-SECRET: YOUR_SECRET" \
  -d '{
    "paths": ["/en/test-page"]
  }'
```

**Expected:** Same response as Test 1, but using header authentication (more secure).

### Test 6: Error Cases

**Invalid secret:**
```bash
curl -X POST http://localhost:3001/api/revalidate?secret=wrong-secret \
  -H "Content-Type: application/json" \
  -d '{"paths": ["/en/test"]}'
```

**Expected:** `401 Unauthorized` with `{"error": "Invalid secret"}`

**Invalid payload:**
```bash
curl -X POST http://localhost:3001/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{"invalid": "payload"}'
```

**Expected:** `400 Bad Request` with error message and expected formats

## Step 4: Test Preview Mode

### Test 1: Enable Preview Mode

```bash
# Visit preview endpoint with token
curl "http://localhost:3001/api/preview?token=YOUR_PREVIEW_SECRET"
```

**Expected:** Redirects to homepage with preview mode enabled

### Test 2: Access Draft Content

1. **Create a draft page in Wagtail**
2. **Enable preview mode** (Step 4.1)
3. **Access the draft page:**
   ```
   http://localhost:3001/en/draft-page-slug
   ```
4. **Verify:**
   - Page should load (even if draft)
   - Yellow preview banner should appear
   - Check browser cookies for `__prerender_bypass` and `__next_preview_data`

### Test 3: Exit Preview Mode

```bash
curl http://localhost:3001/api/exit-preview
```

**Expected:** Redirects to homepage with preview mode disabled

## Step 5: Test ISR (Incremental Static Regeneration)

### Test 1: Verify ISR is Working

1. **Build the Next.js app:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Access a CMS page:**
   ```
   http://localhost:3000/en/test-page
   ```

4. **Check response headers:**
   ```bash
   curl -I http://localhost:3000/en/test-page
   ```
   
   **Look for:**
   - `x-nextjs-cache: HIT` (cached) or `MISS` (regenerated)
   - `Cache-Control` header with revalidation time

### Test 2: Trigger Revalidation

1. **Update page in Wagtail**
2. **Call revalidation endpoint** (see Step 3)
3. **Access page again:**
   ```
   http://localhost:3000/en/test-page
   ```
4. **Verify:**
   - Page should show updated content
   - Cache should be regenerated

## Step 6: Test Error Handling

### Test 1: CMS Unavailable

1. **Stop Wagtail CMS**
2. **Access a CMS page:**
   ```
   http://localhost:3001/en/test-page
   ```
3. **Expected:**
   - Should handle gracefully
   - May show 404 or fallback content
   - Should not crash the app

### Test 2: Invalid Page

1. **Access non-existent page:**
   ```
   http://localhost:3001/en/non-existent-page
   ```
2. **Expected:**
   - Should return 404
   - Should not throw errors

### Test 3: Network Timeout

The CMS client has a 10-second timeout. To test:

1. **Simulate slow CMS** (if possible)
2. **Access a page**
3. **Expected:**
   - Should timeout gracefully
   - Should return null/404
   - Should not hang indefinitely

## Step 7: Integration Test Checklist

- [ ] CMS API is accessible
- [ ] Pages resolve by path correctly
- [ ] Pages resolve by slug (fallback) correctly
- [ ] Nested paths work
- [ ] Homepage handling works
- [ ] Revalidation endpoint accepts all formats
- [ ] Revalidation actually clears cache
- [ ] Preview mode enables/disables correctly
- [ ] Draft content is accessible in preview mode
- [ ] ISR revalidation works
- [ ] Error handling is graceful
- [ ] No breaking changes to existing routes

## Troubleshooting

### CMS Connection Issues

**Problem:** Cannot connect to CMS

**Solutions:**
1. Verify `CMS_BASE_URL` in `.env.local`
2. Check Wagtail is running: `curl http://localhost:8000/health`
3. Check firewall/network settings
4. Verify CORS configuration in Wagtail

### Revalidation Not Working

**Problem:** Revalidation endpoint returns errors

**Solutions:**
1. Verify `CMS_REVALIDATE_SECRET` matches in both systems
2. Check secret is set in `.env.local`
3. Verify webhook URL format
4. Check Next.js logs for detailed errors

### Pages Not Resolving

**Problem:** Pages return 404 even though they exist in Wagtail

**Solutions:**
1. Check page slug matches exactly
2. Verify `url_path` or `html_url` in Wagtail API response
3. Check locale prefix matches
4. Verify page is published (not draft)
5. Test with `getPageByPath()` vs `getPageBySlug()`

### Preview Mode Not Working

**Problem:** Preview mode doesn't show draft content

**Solutions:**
1. Verify `CMS_PREVIEW_SECRET` is set
2. Check preview token in URL matches secret
3. Verify cookies are set correctly
4. Check Wagtail preview links are configured

## Next Steps

After local testing passes:

1. **Test in staging environment**
2. **Configure Wagtail webhooks** (see [cms-revalidation.md](./cms-revalidation.md))
3. **Set up production environment variables**
4. **Monitor logs for errors**
5. **Set up alerts for revalidation failures**

## Additional Resources

- [CMS Environment Variables](./env-cms.md)
- [CMS Revalidation Webhook Setup](./cms-revalidation.md)
- [Wagtail API Documentation](https://docs.wagtail.org/en/stable/advanced_topics/api/v2/configuration.html)

