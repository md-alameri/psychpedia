# Psychpedia Landing Page v2

A modern, minimalist, medical-grade landing page built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** with custom design system
- **Bilingual support** (English/Arabic) with next-intl
- **RTL support** for Arabic
- **Accessible** with proper ARIA labels and keyboard navigation
- **SEO optimized** with proper meta tags and language alternates
- **Mobile-first** responsive design

## Design Philosophy

- Minimalist and academic aesthetic
- Calm color palette (off-whites, slate, muted blue)
- No gradients or heavy animations
- Generous white space
- Professional, evidence-based tone
- Inspired by Apple Health, Notion, and academic journals

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically redirect to `/en` or `/ar` based on your browser's language preference.

### Build

```bash
npm run build
```

The build process includes:
1. Search index generation (`build:search-index`)
2. Content validation (`validate:all`)
3. Next.js production build

### Production

```bash
npm start
```

## Environment Variables

The following environment variables are used:

- `PREVIEW_TOKEN` - Token for enabling draft content preview mode (required for preview functionality)
- `GH_TOKEN` - GitHub personal access token for creating issues from content reports (optional)
- `GH_REPO` - GitHub repository in format `owner/repo` for issue creation (optional, required if `GH_TOKEN` is set)
- `NODE_ENV` - Set to `production` for production builds (automatically set by Next.js)

### Setting Up Preview Mode

To enable preview mode for draft content:

1. Set `PREVIEW_TOKEN` in your environment:
   ```bash
   export PREVIEW_TOKEN=your-secure-token-here
   ```

2. Enable preview mode by visiting:
   ```
   /api/preview?token=your-secure-token-here
   ```

3. Draft content will now be accessible. To exit preview mode:
   ```
   /api/exit-preview
   ```

**Note**: In development, draft content is always accessible. In production, drafts require preview mode to be enabled.

### Setting Up GitHub Issue Integration

To automatically create GitHub issues from content reports:

1. Create a GitHub personal access token with `repo` scope
2. Set environment variables:
   ```bash
   export GH_TOKEN=your-github-token
   export GH_REPO=owner/repo-name
   ```

3. Reports submitted via the "Report Issue" form will automatically create GitHub issues

**Note**: If `GH_TOKEN` is not set, reports are logged to the console instead.

## Project Structure

```
psychpedia-landing-v2/
├── app/
│   ├── [locale]/          # Locale-specific routes
│   │   ├── layout.tsx     # Locale layout with i18n provider
│   │   └── page.tsx       # Main landing page
│   ├── layout.tsx          # Root HTML structure
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Credibility.tsx
│   ├── Vision.tsx
│   ├── Waitlist.tsx
│   ├── Ethics.tsx
│   └── Footer.tsx
├── lib/
│   └── i18n/              # Internationalization
│       ├── config.ts      # next-intl configuration
│       └── messages/      # Translation files
│           ├── en.json
│           └── ar.json
├── proxy.ts              # Locale detection and routing
└── tailwind.config.ts    # Tailwind configuration
```

## Content Operations

### Draft Content Access

- **Development**: Draft content is always accessible
- **Production**: Draft content requires preview mode to be enabled
- Preview mode is enabled via `/api/preview?token=PREVIEW_TOKEN`
- Preview mode persists via Next.js cookies until explicitly disabled

### Report Issue Workflow

Users can report content issues directly from content pages:

1. Click "Report Issue" button on any condition or medication page
2. Fill out the form with:
   - Email (optional)
   - Issue description (required, minimum 10 characters)
3. Submit the report

**Rate Limiting**: Reports are rate-limited to 5 requests per 15 minutes per IP address.

**Processing**:
- **Development**: Reports are logged to the console
- **Production with GitHub**: Reports create GitHub issues automatically
- **Production without GitHub**: Reports are logged to the console

### Admin Dashboard

The content health dashboard is available at `/admin/content-health`:

- **Development**: Fully accessible
- **Production**: Returns 404 (protected)

**Note**: This is a temporary protection. Future versions will use proper authentication.

## Waitlist Form

The waitlist form submits to `/cgi-bin/waitlist.py` (existing backend). For this to work:

1. **Development**: You may need to proxy requests or use a mock handler
2. **Production**: Deploy the CGI script alongside the Next.js app, or configure your server to handle the route

The form includes:
- Client-side email validation
- Error handling
- Success/error states
- Accessibility features

## Internationalization

The app supports English (`/en`) and Arabic (`/ar`). Language switching is handled via the header toggle.

Translation files are located in `lib/i18n/messages/`:
- `en.json` - English translations
- `ar.json` - Arabic translations

### Verification

To verify that the HTML lang and dir attributes are set correctly server-side:

```bash
# Check Arabic locale
curl -s http://localhost:3000/ar | head -n 2
# Expected: <html lang="ar" dir="rtl">

# Check English locale
curl -s http://localhost:3000/en | head -n 2
# Expected: <html lang="en" dir="ltr">
```

The locale is inferred from the URL path and set via a cookie in proxy, ensuring correct server-side rendering without client-side hacks.

## Styling

Tailwind CSS is configured with a custom design system:

- **Colors**: Calm palette with off-whites, slate grays, and muted blue
- **Typography**: System fonts with Arabic fallbacks
- **Spacing**: Generous vertical spacing (6rem desktop, 4rem mobile)
- **RTL**: Automatic RTL support for Arabic via Tailwind utilities

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Focus states on all interactive elements
- Screen reader friendly

## SEO

- Proper meta tags with language alternates
- Open Graph tags
- Twitter Card tags
- Clean, descriptive titles and descriptions
- Canonical URLs

## Browser Support

- Modern browsers (last 2 versions)
- Graceful degradation for older browsers
- RTL support tested in Arabic browsers

## Testing

Test scripts are available for verifying production behavior:

```bash
# Test draft access protection
NODE_ENV=production tsx scripts/test-draft-access.ts

# Test admin route protection
NODE_ENV=production tsx scripts/test-admin-access.ts
```

Set `TEST_BASE_URL` environment variable to test against a different URL:
```bash
TEST_BASE_URL=https://your-site.com NODE_ENV=production tsx scripts/test-draft-access.ts
```

## Deployment

This is a Next.js application and can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Any Node.js hosting** that supports Next.js

### Required Environment Variables for Production

- `PREVIEW_TOKEN` - For draft content preview functionality
- `NODE_ENV=production` - Automatically set by Next.js in production builds

### Optional Environment Variables

- `GH_TOKEN` - For GitHub issue creation from reports
- `GH_REPO` - GitHub repository for issue creation (format: `owner/repo`)

For the waitlist form to work, ensure the CGI script (`/cgi-bin/waitlist.py`) is accessible at the same domain or configure appropriate proxying.

## License

© 2026 Psychpedia. All rights reserved.
