# CMS Environment Variables

This document describes all environment variables used for the Wagtail CMS integration.

## Required Variables

### `CMS_BASE_URL` (or `NEXT_PUBLIC_CMS_URL`)

**Description:** Base URL of the Wagtail CMS instance.

**New name (preferred):** `CMS_BASE_URL`  
**Old name (supported):** `NEXT_PUBLIC_CMS_URL`

**Default:** `https://cms.psychpedia.com`

**Example:**
```bash
CMS_BASE_URL=https://cms.psychpedia.com
```

**For local development:**
```bash
CMS_BASE_URL=http://localhost:8000
```

---

### `CMS_API_BASE`

**Description:** Full API base URL for Wagtail API v2 endpoints.

**Default:** `${CMS_BASE_URL}/api/v2`

**Example:**
```bash
CMS_API_BASE=https://cms.psychpedia.com/api/v2
```

**Note:** If not set, automatically defaults to `${CMS_BASE_URL}/api/v2`.

---

## Optional Variables

### `CMS_PREVIEW_SECRET` (or `PREVIEW_TOKEN`)

**Description:** Secret token for enabling draft content preview via `/api/preview`.

**New name (preferred):** `CMS_PREVIEW_SECRET`  
**Old name (supported):** `PREVIEW_TOKEN`

**Example:**
```bash
CMS_PREVIEW_SECRET=your-secure-random-token-here
```

**Security:** Use a long, random string (minimum 32 characters). Generate with:
```bash
openssl rand -hex 32
```

---

### `CMS_REVALIDATE_SECRET` (or `REVALIDATE_SECRET`)

**Description:** Secret token for webhook-triggered cache revalidation via `/api/revalidate`.

**New name (preferred):** `CMS_REVALIDATE_SECRET`  
**Old name (supported):** `REVALIDATE_SECRET`

**Example:**
```bash
CMS_REVALIDATE_SECRET=your-secure-random-token-here
```

**Security:** Use a long, random string (minimum 32 characters). Must match the secret configured in Wagtail webhook settings.

**Generate with:**
```bash
openssl rand -hex 32
```

---

## Complete Example

### Production

```bash
# CMS Configuration
CMS_BASE_URL=https://cms.psychpedia.com
CMS_API_BASE=https://cms.psychpedia.com/api/v2

# Secrets (generate secure random values)
CMS_PREVIEW_SECRET=abc123...xyz789
CMS_REVALIDATE_SECRET=def456...uvw012
```

### Local Development

```bash
# CMS Configuration
CMS_BASE_URL=http://localhost:8000
CMS_API_BASE=http://localhost:8000/api/v2

# Secrets (use same values as production or generate new ones)
CMS_PREVIEW_SECRET=local-preview-secret
CMS_REVALIDATE_SECRET=local-revalidate-secret
```

---

## Variable Priority

The configuration system supports both old and new variable names for backward compatibility:

1. **New names are preferred** if both are set
2. **Old names are used** as fallback if new names are not set
3. **Defaults apply** if neither is set

### Example Priority Order

For `CMS_PREVIEW_SECRET`:
1. `CMS_PREVIEW_SECRET` (if set)
2. `PREVIEW_TOKEN` (if `CMS_PREVIEW_SECRET` not set)
3. `undefined` (if neither is set)

---

## Configuration File

All CMS configuration is centralized in `lib/cms/config.ts`. This file:
- Reads environment variables
- Provides defaults
- Supports backward compatibility
- Exports constants for use throughout the application

**Do not** read CMS environment variables directly. Always import from `@/lib/cms/config`:

```typescript
import { CMS_BASE_URL, CMS_API_BASE, CMS_PREVIEW_SECRET } from '@/lib/cms/config';
```

---

## Verification

To verify your CMS configuration is working:

1. **Check if CMS is configured:**
   ```typescript
   import { isCMSConfigured } from '@/lib/cms/config';
   console.log('CMS configured:', isCMSConfigured());
   ```

2. **Test API connection:**
   ```bash
   curl https://cms.psychpedia.com/api/v2/pages/
   ```

3. **Test revalidation endpoint:**
   ```bash
   curl -X POST https://www.psychpedia.com/api/revalidate?secret=YOUR_SECRET \
     -H "Content-Type: application/json" \
     -d '{"paths": ["/en/test"]}'
   ```

---

## Security Best Practices

1. **Never commit secrets to version control**
   - Use `.env.local` for local development
   - Use environment variables in production (Vercel, etc.)
   - Add `.env.local` to `.gitignore`

2. **Use strong secrets**
   - Minimum 32 characters
   - Random and unpredictable
   - Different secrets for preview and revalidation

3. **Rotate secrets periodically**
   - Update in both Next.js and Wagtail
   - Test after rotation
   - Keep old secrets temporarily for zero-downtime rotation

4. **Use header authentication for webhooks**
   - Prefer `X-REVALIDATE-SECRET` header over query parameter
   - Prevents secrets from appearing in server logs

---

## Troubleshooting

### CMS not connecting

1. Verify `CMS_BASE_URL` is correct
2. Check that Wagtail is running and accessible
3. Verify CORS is configured in Wagtail (if needed)
4. Check network connectivity

### Revalidation not working

1. Verify `CMS_REVALIDATE_SECRET` matches in both systems
2. Check webhook URL is correct in Wagtail
3. Verify webhook payload format matches expected format
4. Check Next.js logs for errors

### Preview mode not working

1. Verify `CMS_PREVIEW_SECRET` is set
2. Check preview URL includes correct token
3. Verify Wagtail preview links are configured correctly

---

## Related Documentation

- [CMS Revalidation Webhook Setup](./cms-revalidation.md)
- [CMS Integration Overview](../README.md)

