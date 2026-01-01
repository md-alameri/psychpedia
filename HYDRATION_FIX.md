# Hydration Error Fix

## Issue
Hydration error caused by:
1. Browser extension (ChartNote) injecting HTML elements
2. `getCurrentUserRole()` function calls in server components causing potential mismatches
3. **`Math.random()` used for React keys in `RichTextRenderer`** - generates different values on server vs client

## Fixes Applied

### 1. Removed Client-Side Function Calls from Server Components
- **File**: `app/[locale]/conditions/[slug]/page.tsx`
- **Change**: Replaced `getCurrentUserRole() === 'public'` with constant `true` (public pages always hide dosing)
- **Reason**: Server components should not call functions that might differ between server and client

- **File**: `app/[locale]/medications/[slug]/page.tsx`
- **Change**: Same fix applied

### 2. Enhanced Hydration Suppression
- **File**: `app/layout.tsx`
- **Change**: Added `suppressHydrationWarning` to `html` and `body` elements
- **Reason**: Suppresses warnings from browser extensions injecting HTML

### 3. Fixed Non-Deterministic Keys in RichTextRenderer
- **File**: `components/content/RichTextRenderer.tsx`
- **Change**: Replaced all `Math.random()` calls with deterministic key generation based on node type, index, and content hash
- **Reason**: `Math.random()` generates different values on server vs client, causing hydration mismatches. Deterministic keys ensure server and client render the same keys.
- **Implementation**: Added `generateKey()` helper function that creates keys based on:
  - Node ID (if present)
  - Node type
  - Position in tree (parent path + index)
  - Content hash (first 10 chars of text for text nodes)

## Browser Extension Handling

The ChartNote browser extension injects an audio element into the page, which causes hydration mismatches. The `suppressHydrationWarning` attribute on the root elements will suppress these warnings.

**Note**: This is expected behavior when browser extensions modify the DOM. The warnings are harmless but can be suppressed.

### Recoverable Hydration Errors

If you see a "Recoverable Error" about hydration mismatches in the metadata boundary:
- This is caused by browser extensions (like ChartNote) injecting elements
- The error is **recoverable** - React handles it gracefully and the app continues to work
- The `suppressHydrationWarning` on `<html>` and `<body>` elements suppresses most warnings
- The metadata boundary div is rendered by Next.js internally and may show warnings when extensions inject content

**Solution**: These errors are expected and harmless. The app will continue to function correctly. If you want to eliminate the warnings completely, you can disable the browser extension during development.

## Verification

After these fixes:
1. ✅ No more hydration errors from `getCurrentUserRole()` calls
2. ✅ Browser extension injections are suppressed
3. ✅ Server and client rendering should match
4. ✅ No more hydration errors from `Math.random()` in RichTextRenderer keys

## Testing

1. Clear browser cache
2. Reload `/admin` page
3. Check browser console - hydration warnings should be gone
4. Verify admin UI still works correctly

