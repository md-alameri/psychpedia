# Language Toggle Issue Report

## Issue Summary

The language toggle button in the Header component has two critical bugs:
1. **Incorrect button text display**: Shows "AR" when on Arabic version (should show "EN")
2. **Incorrect navigation**: Redirects to `/ar/ar` instead of `/en` when switching from Arabic

## Environment

- **Next.js Version**: 16.1.1 (Turbopack)
- **next-intl Version**: 4.6.1
- **React Version**: 19.2.3
- **Project**: psychpedia-landing-v2

## Current Implementation

### File: `components/Header.tsx`

```typescript
const toggleLocale = () => {
  const newLocale = locale === 'en' ? 'ar' : 'en';
  // next-intl's usePathname returns locale-agnostic paths
  // Use router.push to navigate with the new locale
  router.push(pathname || '/', { locale: newLocale });
};

// Button text rendering:
{locale === 'ar' ? 'EN' : 'AR'}
```

### File: `lib/i18n/navigation.ts`

```typescript
import { createNavigation } from 'next-intl/navigation';
import { locales } from './config';

export const { Link, redirect, usePathname, useRouter } = 
  createNavigation({ locales });
```

### File: `lib/i18n/config.ts`

```typescript
export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];
```

## Bug Details

### Bug #1: Incorrect Button Text on Arabic Version

**Expected Behavior:**
- When on `/ar` (Arabic version), button should display "EN"
- When on `/en` (English version), button should display "AR"

**Actual Behavior:**
- When on `/ar` (Arabic version), button displays "AR" (incorrect)
- When on `/en` (English version), button displays "AR" (correct)

**Root Cause Analysis:**
The button text logic `{locale === 'ar' ? 'EN' : 'AR'}` should work correctly, but the issue suggests that:
1. `useLocale()` hook from `next-intl` might not be returning the expected value `'ar'` when on the Arabic route
2. There might be a hydration mismatch or state synchronization issue
3. The locale value might be cached or not updating correctly

**Code Location:**
- Line 75 (Desktop): `{locale === 'ar' ? 'EN' : 'AR'}`
- Line 137 (Mobile): `{locale === 'ar' ? 'EN' : 'AR'}`

### Bug #2: Duplicate Locale Path (`/ar/ar`)

**Expected Behavior:**
- When clicking language toggle on `/ar`, should navigate to `/en`
- When clicking language toggle on `/en`, should navigate to `/ar`

**Actual Behavior:**
- When clicking language toggle on `/ar`, navigates to `/ar/ar` (incorrect)
- When clicking language toggle on `/en`, behavior unknown (needs testing)

**Root Cause Analysis:**
The issue is in the `toggleLocale` function:
```typescript
router.push(pathname || '/', { locale: newLocale });
```

The problem is that `usePathname()` from next-intl's `createNavigation` might be returning:
- `/ar` instead of `/` when on the Arabic route
- When we call `router.push('/ar', { locale: 'ar' })`, next-intl interprets this as:
  - Pathname: `/ar`
  - Locale: `ar`
  - Result: `/ar/ar`

**Expected Behavior of `usePathname()`:**
According to next-intl documentation, `usePathname()` should return locale-agnostic paths. For example:
- When on `/ar`, it should return `/`
- When on `/en`, it should return `/`
- When on `/ar/some-page`, it should return `/some-page`

**Actual Behavior (Suspected):**
- When on `/ar`, it returns `/ar` (includes locale prefix)
- When on `/en`, it returns `/en` (includes locale prefix)

**Code Location:**
- Line 10: `const pathname = usePathname();`
- Line 18: `router.push(pathname || '/', { locale: newLocale });`

## Reproduction Steps

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/ar`
3. Observe the language toggle button:
   - **Expected**: Button shows "EN"
   - **Actual**: Button shows "AR"
4. Click the language toggle button
5. Observe the URL:
   - **Expected**: URL changes to `http://localhost:3000/en`
   - **Actual**: URL changes to `http://localhost:3000/ar/ar`

## Related Configuration

### Middleware Configuration (`middleware.ts`)
```typescript
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'  // This ensures locale is always in the URL
});
```

### Next.js Configuration (`next.config.mjs`)
```javascript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/config.ts');

const nextConfig = {};

export default withNextIntl(nextConfig);
```

## Investigation Needed

1. **Verify `usePathname()` return value:**
   - Add console.log to check what `pathname` actually returns
   - Test on both `/ar` and `/en` routes
   - Verify if next-intl's `usePathname()` is working as documented

2. **Verify `useLocale()` return value:**
   - Add console.log to check what `locale` actually returns
   - Test on both `/ar` and `/en` routes
   - Verify if the locale is being detected correctly

3. **Check next-intl version compatibility:**
   - Verify if next-intl 4.6.1 is compatible with Next.js 16.1.1
   - Check if there are known issues with `usePathname()` in this version

4. **Test navigation behavior:**
   - Test `router.push('/', { locale: 'en' })` directly
   - Test `router.push('/', { locale: 'ar' })` directly
   - Verify if the issue is with the pathname or the router method

## Potential Solutions

### Solution 1: Force Root Path
```typescript
const toggleLocale = () => {
  const newLocale = locale === 'en' ? 'ar' : 'en';
  router.push('/', { locale: newLocale });  // Always use root path
};
```

### Solution 2: Strip Locale from Pathname
```typescript
const toggleLocale = () => {
  const newLocale = locale === 'en' ? 'ar' : 'en';
  // Strip locale prefix if present
  const cleanPath = pathname?.replace(/^\/(ar|en)/, '') || '/';
  router.push(cleanPath, { locale: newLocale });
};
```

### Solution 3: Use Window Location (Client-side)
```typescript
const toggleLocale = () => {
  const newLocale = locale === 'en' ? 'ar' : 'en';
  const currentPath = window.location.pathname;
  const cleanPath = currentPath.replace(/^\/(ar|en)/, '') || '/';
  router.push(cleanPath, { locale: newLocale });
};
```

### Solution 4: Use Link Component Instead
Consider using next-intl's `Link` component with programmatic navigation or a different approach.

## Additional Notes

- The `Link` component in the same file (line 34-39) uses `href="/"` and works correctly
- The middleware is configured with `localePrefix: 'always'`, which means all routes should have a locale prefix
- The issue might be related to how next-intl's navigation hooks work with Next.js 16.1.1

## Testing Checklist

- [ ] Verify `usePathname()` return value on `/ar`
- [ ] Verify `usePathname()` return value on `/en`
- [ ] Verify `useLocale()` return value on `/ar`
- [ ] Verify `useLocale()` return value on `/en`
- [ ] Test language toggle from `/en` to `/ar`
- [ ] Test language toggle from `/ar` to `/en`
- [ ] Test on both desktop and mobile menu buttons
- [ ] Check browser console for any errors
- [ ] Verify next-intl version compatibility

## References

- [next-intl Documentation - Navigation](https://next-intl-docs.vercel.app/docs/routing/navigation)
- [next-intl Documentation - usePathname](https://next-intl-docs.vercel.app/docs/routing/navigation#usepathname)
- [next-intl Documentation - useRouter](https://next-intl-docs.vercel.app/docs/routing/navigation#userouter)

