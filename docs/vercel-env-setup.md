# Vercel Environment Variables Setup

This guide explains how to configure environment variables for the Wagtail CMS integration in Vercel.

## Required Environment Variables

### Production Environment

The following environment variables **must** be set in Vercel for the CMS integration to work:

#### `CMS_BASE_URL`

**Value:** `https://cms.psychpedia.com`

**Description:** Base URL of the Wagtail CMS instance.

**Required for:** All environments (Production, Preview, Development)

---

#### `CMS_REVALIDATE_SECRET`

**Value:** A secure random string (minimum 32 characters)

**Description:** Secret token for webhook-triggered cache revalidation. Must match the secret configured in Wagtail webhook settings.

**Required for:** Production and Preview environments

**Security:** 
- Never expose this value to the client
- Use a different secret for each environment if possible
- Rotate periodically

**Generate with:**
```bash
openssl rand -hex 32
```

---

## Optional Environment Variables

### `CMS_PREVIEW_SECRET`

**Value:** A secure random string (minimum 32 characters)

**Description:** Secret token for enabling draft content preview via `/api/preview`.

**Required for:** Preview environment (optional for Production)

**Generate with:**
```bash
openssl rand -hex 32
```

---

### `CMS_API_BASE`

**Value:** `https://cms.psychpedia.com/api/v2`

**Description:** Full API base URL. If not set, automatically defaults to `${CMS_BASE_URL}/api/v2`.

**Required for:** None (auto-derived from `CMS_BASE_URL`)

---

## Backward Compatibility

The following old environment variable names are still supported but deprecated:

- `NEXT_PUBLIC_CMS_URL` → Use `CMS_BASE_URL` instead
- `REVALIDATE_SECRET` → Use `CMS_REVALIDATE_SECRET` instead
- `PREVIEW_TOKEN` → Use `CMS_PREVIEW_SECRET` instead

**Recommendation:** Migrate to new names for consistency.

---

## Setting Environment Variables in Vercel

### Method 1: Vercel Dashboard

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name:** `CMS_BASE_URL`
   - **Value:** `https://cms.psychpedia.com`
   - **Environment:** Select which environments to enable (Production, Preview, Development)
4. Click **Save**
5. Repeat for each required variable

### Method 2: Vercel CLI

```bash
# Set for Production
vercel env add CMS_BASE_URL production
# Enter value when prompted: https://cms.psychpedia.com

vercel env add CMS_REVALIDATE_SECRET production
# Enter value when prompted: your-secret-here

# Set for Preview
vercel env add CMS_BASE_URL preview
vercel env add CMS_REVALIDATE_SECRET preview

# Set for Development (optional, for local testing)
vercel env add CMS_BASE_URL development
```

---

## Environment-Specific Configuration

### Production

**Required:**
- `CMS_BASE_URL=https://cms.psychpedia.com`
- `CMS_REVALIDATE_SECRET=<production-secret>`

**Optional:**
- `CMS_PREVIEW_SECRET=<preview-secret>` (if preview mode is needed)

### Preview (Pull Requests)

**Required:**
- `CMS_BASE_URL=https://cms.psychpedia.com` (or staging URL if different)
- `CMS_REVALIDATE_SECRET=<preview-secret>` (can be same as production or different)

**Optional:**
- `CMS_PREVIEW_SECRET=<preview-secret>` (recommended for testing)

### Development (Local)

**Required:**
- `CMS_BASE_URL=http://localhost:8000` (or your local Wagtail URL)

**Optional:**
- `CMS_REVALIDATE_SECRET=<local-secret>` (for testing webhooks locally)
- `CMS_PREVIEW_SECRET=<local-secret>` (for testing preview mode)

**Note:** Use `.env.local` file for local development (never commit this file).

---

## After Setting Variables

### Important: Redeploy Required

**Environment variable changes require a redeploy to take effect.**

1. **Automatic:** Vercel will automatically redeploy on the next push to your branch
2. **Manual:** Go to **Deployments** → Select latest deployment → **Redeploy**

### Verification

After redeploying, verify environment variables are set correctly:

```bash
# Check via API (temporary endpoint - remove after verification)
curl https://www.psychpedia.com/api/env-check
```

**Expected response:**
```json
{
  "CMS_BASE_URL": "https://cms.psychpedia.com",
  "HAS_CMS_REVALIDATE_SECRET": true
}
```

**Note:** The `/api/env-check` endpoint is temporary and should be removed after verification.

---

## Security Best Practices

### 1. Never Expose Secrets to Client

- ✅ **DO:** Use server-only environment variables (no `NEXT_PUBLIC_` prefix for secrets)
- ❌ **DON'T:** Use `NEXT_PUBLIC_` prefix for secrets (exposes to client)
- ✅ **DO:** All CMS secrets are server-only by default

### 2. Use Different Secrets Per Environment

- Production: Use production-specific secret
- Preview: Use preview-specific secret (can be same or different)
- Development: Use local development secret

### 3. Rotate Secrets Periodically

1. Generate new secret
2. Update in Vercel
3. Update in Wagtail webhook settings
4. Redeploy Next.js app
5. Test webhook
6. Remove old secret after verification

### 4. Monitor for Unauthorized Access

- Check Vercel logs for 401 errors on `/api/revalidate`
- Set up alerts for repeated authentication failures
- Review Wagtail webhook logs

---

## Troubleshooting

### Variables Not Working After Redeploy

1. **Verify variables are set:**
   - Check Vercel Dashboard → Settings → Environment Variables
   - Ensure correct environment is selected (Production/Preview)

2. **Check deployment logs:**
   - Go to Deployments → Select deployment → View Build Logs
   - Look for any errors related to environment variables

3. **Verify redeploy:**
   - Environment variables only apply to new deployments
   - Manually trigger a redeploy if needed

### Revalidation Not Working

1. **Check secret matches:**
   - Verify `CMS_REVALIDATE_SECRET` in Vercel matches Wagtail webhook secret
   - Test with curl:
     ```bash
     curl -X POST https://www.psychpedia.com/api/revalidate?secret=YOUR_SECRET \
       -H "Content-Type: application/json" \
       -d '{"paths": ["/en/test"]}'
     ```

2. **Check webhook URL:**
   - Verify Wagtail webhook points to: `https://www.psychpedia.com/api/revalidate`
   - Ensure HTTPS is used (not HTTP)

3. **Check logs:**
   - View Vercel function logs for `/api/revalidate`
   - Look for authentication errors or other issues

### Preview Mode Not Working

1. **Check secret is set:**
   - Verify `CMS_PREVIEW_SECRET` is set in Vercel
   - Ensure it's set for the correct environment

2. **Test preview endpoint:**
   ```bash
   curl "https://www.psychpedia.com/api/preview?token=YOUR_SECRET"
   ```

3. **Check cookies:**
   - Preview mode sets cookies: `__prerender_bypass` and `__next_preview_data`
   - Verify cookies are set in browser DevTools

---

## Related Documentation

- [CMS Environment Variables](./env-cms.md) - Detailed variable documentation
- [CMS Revalidation Webhook Setup](./cms-revalidation.md) - Webhook configuration
- [CMS Testing Guide](./cms-testing.md) - Local testing instructions

---

## Quick Reference

### Minimum Required for Production

```bash
CMS_BASE_URL=https://cms.psychpedia.com
CMS_REVALIDATE_SECRET=<generate-with-openssl-rand-hex-32>
```

### Complete Setup (All Features)

```bash
CMS_BASE_URL=https://cms.psychpedia.com
CMS_API_BASE=https://cms.psychpedia.com/api/v2
CMS_REVALIDATE_SECRET=<generate-secure-secret>
CMS_PREVIEW_SECRET=<generate-secure-secret>
```

### Local Development (.env.local)

```bash
CMS_BASE_URL=http://localhost:8000
CMS_API_BASE=http://localhost:8000/api/v2
CMS_REVALIDATE_SECRET=local-dev-secret
CMS_PREVIEW_SECRET=local-preview-secret
```

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test endpoints manually with curl
4. Review [CMS Testing Guide](./cms-testing.md) for debugging steps

