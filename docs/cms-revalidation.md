# Wagtail CMS Revalidation Webhook Setup

This guide explains how to configure Wagtail CMS to trigger cache revalidation in Next.js when content is published or updated.

## Overview

The revalidation webhook endpoint (`/api/revalidate`) allows Wagtail to notify Next.js when content changes, triggering immediate cache invalidation and regeneration of affected pages.

## Endpoint

**URL:** `https://www.psychpedia.com/api/revalidate`

**Method:** `POST`

**Authentication:** Required via secret (see below)

## Authentication

The endpoint supports two authentication methods:

### Method 1: Query Parameter (Recommended for Testing)

```
POST https://www.psychpedia.com/api/revalidate?secret=YOUR_SECRET
```

### Method 2: Header (Recommended for Production)

```
POST https://www.psychpedia.com/api/revalidate
Headers:
  X-REVALIDATE-SECRET: YOUR_SECRET
```

**Security Note:** Using the header method is more secure as it prevents the secret from appearing in server logs.

## Environment Variables

Set one of these environment variables in your Next.js deployment:

- `CMS_REVALIDATE_SECRET` (new, preferred)
- `REVALIDATE_SECRET` (old, still supported)

The secret must match between Wagtail webhook configuration and Next.js environment variables.

## Payload Formats

The endpoint supports two payload formats for backward compatibility.

### New Format (Recommended)

```json
{
  "page_id": 123,
  "slug": "my-page",
  "paths": [
    "/en/my-page",
    "/ar/my-page",
    "/en/parent-page"
  ]
}
```

**Benefits:**
- Explicit control over which paths to revalidate
- Supports multiple paths in a single request
- More flexible for complex page hierarchies

### Old Format (Legacy Support)

```json
{
  "type": "condition",
  "slug": "depression",
  "locale": "en"
}
```

**Supported types:**
- `condition` - Revalidates `/en/conditions/{slug}` and `/en/conditions`
- `medication` - Revalidates `/en/medications/{slug}` and `/en/medications`
- `governance` - Revalidates `/en/{slug}`

**Note:** The old format automatically constructs paths based on type. Use the new format for more control.

## Wagtail Webhook Configuration

### Step 1: Create Webhook in Wagtail Admin

1. Log in to Wagtail admin: `https://cms.psychpedia.com/admin/`
2. Navigate to **Settings** → **Webhooks**
3. Click **Add webhook**

### Step 2: Configure Webhook

**Name:** `Next.js Revalidation`

**Page type:** Select the page types you want to trigger revalidation (e.g., Condition Page, Medication Page)

**Action:** Select **Publish** and/or **Update**

**URL:** 
```
https://www.psychpedia.com/api/revalidate?secret=YOUR_SECRET
```

Or use header authentication:
```
https://www.psychpedia.com/api/revalidate
```

**HTTP Headers (if using header auth):**
```
X-REVALIDATE-SECRET: YOUR_SECRET
```

**HTTP Method:** `POST`

**HTTP Content Type:** `application/json`

### Step 3: Configure Payload

#### Option A: New Format (Recommended)

In Wagtail webhook settings, you'll need to configure a custom payload. Wagtail's webhook system may require a custom view or signal handler to send the new format.

**Example custom payload template:**
```json
{
  "page_id": {{ page.id }},
  "slug": "{{ page.slug }}",
  "paths": [
    {% for locale in page.locales.all %}
    "/{{ locale.code }}/{{ page.url_path|default:page.slug }}",
    {% endfor %}
  ]
}
```

#### Option B: Old Format (Simpler)

If using the old format, Wagtail's default webhook payload may work, but you'll need to ensure it includes `type`, `slug`, and `locale` fields.

**Example payload template:**
```json
{
  "type": "{{ page.content_type.model }}",
  "slug": "{{ page.slug }}",
  "locale": "{{ page.locale.language_code }}"
}
```

### Step 4: Test Webhook

1. Create or update a page in Wagtail
2. Publish the page
3. Check Next.js logs for revalidation confirmation
4. Verify the page updates on the frontend

## Response Format

### Success Response

```json
{
  "revalidated": true,
  "format": "new",
  "page_id": 123,
  "slug": "my-page",
  "paths": [
    "/en/my-page",
    "/sitemap.xml"
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Error Responses

**401 Unauthorized:**
```json
{
  "error": "Invalid secret"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid payload format",
  "expected": [
    "New format: { page_id, slug, paths: string[] }",
    "Old format: { type, slug, locale }"
  ]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Revalidation not configured"
}
```

## Security Best Practices

1. **Use Strong Secrets:** Generate a long, random secret (minimum 32 characters)
2. **Use Header Authentication:** Prefer header-based auth over query parameters
3. **HTTPS Only:** Always use HTTPS for webhook URLs
4. **Rotate Secrets:** Periodically rotate secrets and update both systems
5. **Monitor Logs:** Regularly check for unauthorized access attempts

## Troubleshooting

### Webhook Not Triggering

1. Verify the webhook is enabled in Wagtail admin
2. Check that the page type matches the webhook configuration
3. Verify the URL is correct and accessible
4. Check Wagtail logs for webhook delivery errors

### Revalidation Not Working

1. Verify the secret matches in both systems
2. Check Next.js logs for authentication errors
3. Verify the payload format matches expected format
4. Test the endpoint manually with curl:

```bash
curl -X POST https://www.psychpedia.com/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{"page_id": 123, "slug": "test", "paths": ["/en/test"]}'
```

### Paths Not Revalidating

1. Verify paths start with `/`
2. Check that paths match actual Next.js routes
3. Ensure paths include locale prefix (e.g., `/en/...`)
4. Check Next.js logs for revalidation confirmations

## Local Development

For local development, point the webhook to your local Next.js server:

```
http://localhost:3001/api/revalidate?secret=YOUR_LOCAL_SECRET
```

Make sure to:
1. Set `CMS_REVALIDATE_SECRET` in your `.env.local`
2. Run Next.js dev server on port 3001 (or update the URL)
3. Ensure Wagtail can reach your local server (use ngrok or similar for testing)

## Additional Resources

- [Next.js Revalidation Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration#on-demand-revalidation)
- [Wagtail Webhooks Documentation](https://docs.wagtail.org/en/stable/reference/contrib/webhooks.html)

